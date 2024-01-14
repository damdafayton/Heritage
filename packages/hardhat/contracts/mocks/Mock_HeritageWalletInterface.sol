//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "../../interfaces/HeritageWalletInterface.sol";

contract Mock_HeritageWalletInterface {
	function getEthPrice() external pure returns (uint, uint) {
		return (197400000000, 8);
	}
}
