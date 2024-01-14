//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import { HeritageWallet } from "./HeritageWallet.sol";

// Useful for debugging. Remove when deploying to a live network.
import "hardhat/console.sol";

contract ExposedHeritageWallet is HeritageWallet {
	constructor(
		address owner,
		uint minFeePerYearInUsd,
		uint
	) HeritageWallet(owner, minFeePerYearInUsd, feeThousandagePerYear) {}

	function numDigits(int number) public pure returns (uint8) {
		return _numDigits(number);
	}

	function findYearsBetweenTimestamps(
		uint startTimestamp,
		uint endTimestamp
	) public pure returns (uint) {
		return _findYearsBetweenTimestamps(startTimestamp, endTimestamp);
	}

	function __registerUser(
		address userAddress
	) public returns (Subscription memory) {
		return _registerUser(userAddress);
	}

	// function __payFee(
	// 	Subscription memory subscription,
	// 	uint fee,
	// 	bool isItNewSubscription,
	// 	address _address
	// ) public {
	// 	_payFee(subscription, fee, isItNewSubscription, _address);
	// }
}
