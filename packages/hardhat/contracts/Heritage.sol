//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// Useful for debugging. Remove when deploying to a live network.
import "hardhat/console.sol";

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract Heritage is Initializable, UUPSUpgradeable, OwnableUpgradeable {
	// Cant change the order or type of the variables down
	uint minimumFeePerYer;
	uint feeThousandagePerYear;
	address[] addressesToPay;
	address[] subscribedAddresses;
	struct Subscription {
		address payingAddress;
		uint startDate;
		uint feePerYear;
		uint feeThousandagePerYear;
		bool lastYearPaid;
		uint payCount;
		bool paidLastYear;
	}
	mapping(address => Subscription) addressSubscriptionMap;

	// /// @custom:oz-upgrades-unsafe-allow constructor
	// constructor() initializer {}

	function initialize() public initializer {
		// __Ownable_init();
	}

	function _authorizeUpgrade(
		address newImplementation
	) internal override onlyOwner {
		console.log("_authorizeUpgrade executed for admin:", _msgSender());
		console.log("New implementation address:", newImplementation);
	}
}
