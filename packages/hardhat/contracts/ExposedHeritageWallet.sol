//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import { HeritageWallet } from "./HeritageWallet.sol";

contract ExposedHeritageWallet is HeritageWallet {
	constructor(
		address owner,
		address ethUsdPriceFeed
	) HeritageWallet(owner, ethUsdPriceFeed) {}

	function convertPriceToWei(
		uint price,
		uint ethPrice,
		uint decimal
	) public pure returns (uint) {
		return _convertPriceToWei(price, ethPrice, decimal);
	}

	function numDigits(int number) public pure returns (uint8) {
		return _numDigits(number);
	}

	function findYearsBetweenTimestamps(
		uint startTimestamp,
		uint endTimestamp
	) public pure returns (uint) {
		return _findYearsBetweenTimestamps(startTimestamp, endTimestamp);
	}
}
