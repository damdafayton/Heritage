//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// Useful for debugging. Remove when deploying to a live network.
import "hardhat/console.sol";

import "./HeritageAdmin.sol";

contract HeritageAdminV2 is HeritageAdmin {
	function foo() public pure returns (uint) {
		return 5;
	}
}
