// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title MockIDRX
/// @notice ERC-20 token tes untuk demo arisan. Jangan pakai di mainnet.
contract MockIDRX is ERC20 {
    uint256 public constant FAUCET_AMOUNT = 1_000 * 1e6; // 1.000 mIDRX per klaim
    uint256 public constant COOLDOWN = 1 hours;

    mapping(address => uint256) public lastClaim;

    constructor() ERC20("Mock IDRX", "mIDRX") {}

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    /// @notice Klaim 1.000 mIDRX. Cooldown 1 jam per alamat.
    function faucet() external {
        require(block.timestamp >= lastClaim[msg.sender] + COOLDOWN, "MockIDRX: cooldown aktif");
        lastClaim[msg.sender] = block.timestamp;
        _mint(msg.sender, FAUCET_AMOUNT);
    }
}
