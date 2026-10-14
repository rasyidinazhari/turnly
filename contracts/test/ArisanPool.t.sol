// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console} from "forge-std/Test.sol";
import {ArisanPool} from "../src/ArisanPool.sol";
import {MockIDRX} from "../src/MockIDRX.sol";

contract ArisanPoolTest is Test {
    ArisanPool pool;
    MockIDRX token;

    address admin   = address(0x1);
    address alice   = address(0x2);
    address bob     = address(0x3);
    address charlie = address(0x4); // non-member untuk test

    uint256 constant CONTRIBUTION = 100 * 1e6; // 100 mIDRX
    uint32  constant MAX_MEMBERS  = 3;
    uint32  constant PERIOD       = 60; // 60 detik (mode demo)

    function setUp() public {
        // Deploy kontrak
        token = new MockIDRX();
        pool  = new ArisanPool(60); // MIN_PERIOD = 60 detik

        // Beri masing-masing akun token yang cukup
        address[3] memory accounts = [admin, alice, bob];
        for (uint256 i = 0; i < accounts.length; i++) {
            vm.prank(accounts[i]);
            token.faucet(); // 1.000 mIDRX per klaim
            vm.prank(accounts[i]);
            token.approve(address(pool), type(uint256).max);
        }
    }

    // ─────────────────────────────────────────────────────────────────
    // Helper: buat dan isi grup 3 anggota, lalu start
    // ─────────────────────────────────────────────────────────────────

    function _setupActiveGroup() internal returns (uint256 groupId) {
        vm.prank(admin);
        groupId = pool.createGroup(address(token), CONTRIBUTION, MAX_MEMBERS, PERIOD);

        vm.prank(alice);
        pool.joinGroup(groupId);

        vm.prank(bob);
        pool.joinGroup(groupId);

        vm.prank(admin);
        pool.startGroup(groupId);
    }

    // ─────────────────────────────────────────────────────────────────
    // Test 1: Alur penuh 3 anggota sampai Completed
    // ─────────────────────────────────────────────────────────────────

    function test_FullFlowThreeMembersCompleted() public {
        uint256 groupId = _setupActiveGroup();

        uint256 adminBefore   = token.balanceOf(admin);
        uint256 aliceBefore   = token.balanceOf(alice);
        uint256 bobBefore     = token.balanceOf(bob);

        // Putaran 0 — penerima: admin (posisi 0)
        vm.prank(admin);
        pool.contribute(groupId);
        vm.prank(alice);
        pool.contribute(groupId);
        vm.prank(bob);
        pool.contribute(groupId); // iuran terakhir → pot cair ke admin

        // Putaran 1 — penerima: alice (posisi 1)
        vm.warp(block.timestamp + PERIOD + 1);
        vm.prank(admin);
        pool.contribute(groupId);
        vm.prank(alice);
        pool.contribute(groupId);
        vm.prank(bob);
        pool.contribute(groupId); // pot cair ke alice

        // Putaran 2 — penerima: bob (posisi 2)
        vm.warp(block.timestamp + PERIOD + 1);
        vm.prank(admin);
        pool.contribute(groupId);
        vm.prank(alice);
        pool.contribute(groupId);
        vm.prank(bob);
        pool.contribute(groupId); // pot cair ke bob → GroupCompleted

        // Status harus Completed
        (,,,,,,, ArisanPool.Status status,,) = pool.getGroup(groupId);
        assertEq(uint8(status), uint8(ArisanPool.Status.Completed));

        // Setiap anggota membayar 3 × 100 = 300, menerima 300 satu kali
        // Net change = 0 untuk semua
        assertEq(token.balanceOf(admin), adminBefore);
        assertEq(token.balanceOf(alice), aliceBefore);
        assertEq(token.balanceOf(bob), bobBefore);
    }

    // ─────────────────────────────────────────────────────────────────
    // Test 2: Anggota tidak bisa membayar dua kali di putaran yang sama
    // ─────────────────────────────────────────────────────────────────

    function test_CannotPayTwiceInSameRound() public {
        uint256 groupId = _setupActiveGroup();

        vm.prank(admin);
        pool.contribute(groupId);

        vm.prank(admin);
        vm.expectRevert("ArisanPool: sudah membayar putaran ini");
        pool.contribute(groupId);
    }

    // ─────────────────────────────────────────────────────────────────
    // Test 3: Non-anggota tidak bisa membayar
    // ─────────────────────────────────────────────────────────────────

    function test_NonMemberCannotContribute() public {
        uint256 groupId = _setupActiveGroup();

        // Beri charlie token dan approval
        vm.startPrank(charlie);
        token.faucet();
        token.approve(address(pool), type(uint256).max);
        vm.expectRevert("ArisanPool: bukan anggota");
        pool.contribute(groupId);
        vm.stopPrank();
    }

    // ─────────────────────────────────────────────────────────────────
    // Test 4: Tidak ada fungsi admin untuk ubah/tarik dana setelah Active
    //         (startGroup kedua harus revert)
    // ─────────────────────────────────────────────────────────────────

    function test_AdminCannotStartGroupTwice() public {
        uint256 groupId = _setupActiveGroup();

        vm.prank(admin);
        vm.expectRevert("ArisanPool: grup tidak open");
        pool.startGroup(groupId);
    }

    // ─────────────────────────────────────────────────────────────────
    // Test 5a: joinGroup ditolak saat slot penuh
    // ─────────────────────────────────────────────────────────────────

    function test_JoinGroupRejectedWhenFull() public {
        vm.prank(admin);
        uint256 groupId = pool.createGroup(address(token), CONTRIBUTION, 2, PERIOD);

        vm.prank(alice);
        pool.joinGroup(groupId); // slot penuh (admin + alice = 2)

        vm.prank(bob);
        vm.expectRevert("ArisanPool: slot penuh");
        pool.joinGroup(groupId);
    }

    // ─────────────────────────────────────────────────────────────────
    // Test 5b: joinGroup ditolak setelah grup dimulai
    // ─────────────────────────────────────────────────────────────────

    function test_JoinGroupRejectedAfterStart() public {
        uint256 groupId = _setupActiveGroup();

        vm.prank(charlie);
        vm.expectRevert("ArisanPool: grup tidak open");
        pool.joinGroup(groupId);
    }

    // ─────────────────────────────────────────────────────────────────
    // Test 6: Pencairan hanya terjadi saat iuran terakhir masuk
    // ─────────────────────────────────────────────────────────────────

    function test_PayoutOnlyOnLastContribution() public {
        uint256 groupId = _setupActiveGroup();

        uint256 balanceBefore = token.balanceOf(admin);

        // Admin bayar (bukan terakhir) — saldo admin harus berkurang
        vm.prank(admin);
        pool.contribute(groupId);
        assertEq(token.balanceOf(admin), balanceBefore - CONTRIBUTION);

        // Alice bayar (bukan terakhir) — admin belum terima pot
        vm.prank(alice);
        pool.contribute(groupId);
        assertEq(token.balanceOf(admin), balanceBefore - CONTRIBUTION);

        // Bob bayar (terakhir) → pot cair ke admin (posisi 0)
        vm.prank(bob);
        pool.contribute(groupId);
        uint256 pot = CONTRIBUTION * MAX_MEMBERS; // 300 mIDRX
        assertEq(token.balanceOf(admin), balanceBefore - CONTRIBUTION + pot);
    }
}
