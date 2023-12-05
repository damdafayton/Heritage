//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// Useful for debugging. Remove when deploying to a live network.
import "hardhat/console.sol";

import "./Heritage.sol";

contract HeritageV2 is Heritage {
	function foo() public pure returns (uint) {
		return 5;
	}
}
