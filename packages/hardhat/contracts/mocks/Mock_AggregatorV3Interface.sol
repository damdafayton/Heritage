// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract Mock_AggregatorV3Interface {
	function latestRoundData()
		public
		pure
		returns (
			uint80 roundId,
			int256 answer,
			uint256 startedAt,
			uint256 updatedAt,
			uint80 answeredInRound
		)
	{
		(roundId, answer, startedAt, updatedAt, answeredInRound) = (
			0,
			197400000000,
			0,
			0,
			0
		);
	}

	function decimals() public pure returns (uint8) {
		return 8;
	}
}
