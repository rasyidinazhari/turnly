// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @title ArisanPool
/// @notice Mengelola banyak grup arisan onchain tanpa bendahara.
///         Kontrak menahan iuran dan otomatis mencairkan pot ke penerima giliran
///         begitu semua anggota sudah membayar.
contract ArisanPool is ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ─────────────────────────────────────────────────────────────────
    // Types
    // ─────────────────────────────────────────────────────────────────

    enum Status {
        Open,
        Active,
        Completed,
        Cancelled
    }

    struct Group {
        address admin;
        IERC20 token;
        uint256 contribution; // iuran per anggota per putaran (satuan terkecil token)
        uint32 maxMembers;
        uint32 periodSeconds;
        uint32 currentRound; // indeks putaran berjalan, mulai dari 0
        uint64 roundDeadline; // tenggat putaran berjalan (unix timestamp)
        Status status;
        address[] members; // urutan = urutan giliran, terkunci saat startGroup
    }

    // ─────────────────────────────────────────────────────────────────
    // Storage
    // ─────────────────────────────────────────────────────────────────

    /// @notice Periode minimum (detik). Bisa di-set rendah untuk demo.
    uint32 public immutable MIN_PERIOD;

    uint256 public groupCount;

    mapping(uint256 => Group) private groups;

    /// @notice paid[groupId][round][member] — apakah anggota sudah bayar di putaran ini
    mapping(uint256 => mapping(uint32 => mapping(address => bool))) public paid;

    /// @notice paidCount[groupId][round] — berapa anggota sudah bayar di putaran ini
    mapping(uint256 => mapping(uint32 => uint32)) public paidCount;

    /// @notice isMember[groupId][address]
    mapping(uint256 => mapping(address => bool)) public isMember;

    // ─────────────────────────────────────────────────────────────────
    // Events
    // ─────────────────────────────────────────────────────────────────

    event GroupCreated(
        uint256 indexed groupId,
        address indexed admin,
        address token,
        uint256 contribution,
        uint32 maxMembers,
        uint32 periodSeconds
    );
    event MemberJoined(uint256 indexed groupId, address indexed member, uint32 position);
    event GroupStarted(uint256 indexed groupId, uint64 firstDeadline);
    event Contributed(
        uint256 indexed groupId, uint32 round, address indexed member, uint256 amount
    );
    event RoundPaidOut(
        uint256 indexed groupId, uint32 round, address indexed recipient, uint256 amount
    );
    event GroupCompleted(uint256 indexed groupId);

    // ─────────────────────────────────────────────────────────────────
    // Constructor
    // ─────────────────────────────────────────────────────────────────

    constructor(uint32 minPeriod) {
        require(minPeriod > 0, "ArisanPool: minPeriod harus > 0");
        MIN_PERIOD = minPeriod;
    }

    // ─────────────────────────────────────────────────────────────────
    // External functions
    // ─────────────────────────────────────────────────────────────────

    /// @notice Buat grup arisan baru. Pembuat otomatis jadi admin dan anggota pertama.
    /// @param token     Alamat ERC-20 yang dipakai sebagai iuran
    /// @param contribution Jumlah iuran per anggota per putaran (satuan terkecil token)
    /// @param maxMembers Jumlah anggota (2–10)
    /// @param periodSeconds Durasi satu putaran dalam detik (>= MIN_PERIOD)
    /// @return groupId  ID grup yang baru dibuat
    function createGroup(
        address token,
        uint256 contribution,
        uint32 maxMembers,
        uint32 periodSeconds
    ) external returns (uint256 groupId) {
        require(token != address(0), "ArisanPool: token tidak valid");
        require(contribution > 0, "ArisanPool: iuran harus > 0");
        require(maxMembers >= 2 && maxMembers <= 10, "ArisanPool: anggota harus 2-10");
        require(periodSeconds >= MIN_PERIOD, "ArisanPool: periode terlalu pendek");

        groupId = groupCount++;

        Group storage g = groups[groupId];
        g.admin = msg.sender;
        g.token = IERC20(token);
        g.contribution = contribution;
        g.maxMembers = maxMembers;
        g.periodSeconds = periodSeconds;
        g.status = Status.Open;
        g.members.push(msg.sender);

        isMember[groupId][msg.sender] = true;

        emit GroupCreated(groupId, msg.sender, token, contribution, maxMembers, periodSeconds);
        emit MemberJoined(groupId, msg.sender, 0);
    }

    /// @notice Bergabung ke grup yang masih Open.
    function joinGroup(uint256 groupId) external {
        Group storage g = groups[groupId];
        require(g.status == Status.Open, "ArisanPool: grup tidak open");
        require(!isMember[groupId][msg.sender], "ArisanPool: sudah menjadi anggota");
        require(g.members.length < g.maxMembers, "ArisanPool: slot penuh");

        uint32 position = uint32(g.members.length);
        g.members.push(msg.sender);
        isMember[groupId][msg.sender] = true;

        emit MemberJoined(groupId, msg.sender, position);
    }

    /// @notice Admin mengunci urutan giliran dan mengaktifkan grup.
    function startGroup(uint256 groupId) external {
        Group storage g = groups[groupId];
        require(msg.sender == g.admin, "ArisanPool: bukan admin");
        require(g.status == Status.Open, "ArisanPool: grup tidak open");
        require(g.members.length >= 2, "ArisanPool: butuh minimal 2 anggota");

        g.status = Status.Active;
        g.roundDeadline = uint64(block.timestamp + g.periodSeconds);

        emit GroupStarted(groupId, g.roundDeadline);
    }

    /// @notice Anggota membayar iuran putaran berjalan.
    ///         Jika ini iuran terakhir, pot langsung dicairkan ke penerima giliran.
    function contribute(uint256 groupId) external nonReentrant {
        Group storage g = groups[groupId];
        require(g.status == Status.Active, "ArisanPool: grup tidak aktif");
        require(isMember[groupId][msg.sender], "ArisanPool: bukan anggota");

        uint32 round = g.currentRound;
        require(!paid[groupId][round][msg.sender], "ArisanPool: sudah membayar putaran ini");

        // Checks-effects-interactions
        paid[groupId][round][msg.sender] = true;
        uint32 newCount = paidCount[groupId][round] + 1;
        paidCount[groupId][round] = newCount;

        g.token.safeTransferFrom(msg.sender, address(this), g.contribution);

        emit Contributed(groupId, round, msg.sender, g.contribution);

        if (newCount == uint32(g.members.length)) {
            _payout(groupId);
        }
    }

    // ─────────────────────────────────────────────────────────────────
    // View functions
    // ─────────────────────────────────────────────────────────────────

    /// @notice Kembalikan data grup lengkap termasuk daftar anggota.
    function getGroup(uint256 groupId)
        external
        view
        returns (
            address admin,
            address token,
            uint256 contribution,
            uint32 maxMembers,
            uint32 periodSeconds,
            uint32 currentRound,
            uint64 roundDeadline,
            Status status,
            address[] memory members,
            address currentRecipient
        )
    {
        Group storage g = groups[groupId];
        admin = g.admin;
        token = address(g.token);
        contribution = g.contribution;
        maxMembers = g.maxMembers;
        periodSeconds = g.periodSeconds;
        currentRound = g.currentRound;
        roundDeadline = g.roundDeadline;
        status = g.status;
        members = g.members;
        currentRecipient =
            (g.status == Status.Active && g.currentRound < g.members.length)
            ? g.members[g.currentRound]
            : address(0);
    }

    /// @notice Cek apakah anggota sudah membayar di putaran tertentu.
    function hasPaid(uint256 groupId, uint32 round, address member) external view returns (bool) {
        return paid[groupId][round][member];
    }

    /// @notice Jumlah anggota grup.
    function memberCount(uint256 groupId) external view returns (uint256) {
        return groups[groupId].members.length;
    }

    // ─────────────────────────────────────────────────────────────────
    // Internal
    // ─────────────────────────────────────────────────────────────────

    /// @dev Cairkan pot ke penerima giliran dan siapkan putaran berikutnya.
    ///      Dipanggil otomatis saat iuran terakhir masuk.
    function _payout(uint256 groupId) internal {
        Group storage g = groups[groupId];

        uint32 round = g.currentRound;
        address recipient = g.members[round];
        uint256 potAmount = g.contribution * g.members.length;

        // Naikkan putaran sebelum transfer (CEI)
        g.currentRound = round + 1;

        if (g.currentRound == uint32(g.members.length)) {
            // Semua putaran selesai
            g.status = Status.Completed;
            g.token.safeTransfer(recipient, potAmount);
            emit RoundPaidOut(groupId, round, recipient, potAmount);
            emit GroupCompleted(groupId);
        } else {
            // Putaran berikutnya
            g.roundDeadline = uint64(block.timestamp + g.periodSeconds);
            g.token.safeTransfer(recipient, potAmount);
            emit RoundPaidOut(groupId, round, recipient, potAmount);
        }
    }
}
