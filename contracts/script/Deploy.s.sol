// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {MockIDRX} from "../src/MockIDRX.sol";
import {ArisanPool} from "../src/ArisanPool.sol";

/// @notice Deploy MockIDRX dan ArisanPool ke Monad Testnet.
///         Set MIN_PERIOD_SECONDS=60 untuk demo (default), 86400 untuk produksi.
///
/// Jalankan:
///   source .env
///   export DEPLOYER=$(cast wallet address --account $DEPLOYER_ACCOUNT)
///   forge script script/Deploy.s.sol:Deploy \
///     --rpc-url $MONAD_TESTNET_RPC \
///     --account $DEPLOYER_ACCOUNT --sender $DEPLOYER \
///     --broadcast
contract Deploy is Script {
    function run() external {
        uint32 minPeriod = uint32(vm.envOr("MIN_PERIOD_SECONDS", uint256(60)));

        vm.startBroadcast();

        MockIDRX token = new MockIDRX();
        ArisanPool pool = new ArisanPool(minPeriod);

        vm.stopBroadcast();

        console.log("================================");
        console.log("Deployment selesai!");
        console.log("================================");
        console.log("MockIDRX :", address(token));
        console.log("ArisanPool:", address(pool));
        console.log("MIN_PERIOD:", minPeriod, "detik");
        console.log("================================");
        console.log("Salin ke deployments/monad-testnet.json dan .env");
    }
}
