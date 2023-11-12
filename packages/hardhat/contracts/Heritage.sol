//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// Useful for debugging. Remove when deploying to a live network.
import "hardhat/console.sol";

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract Heritage is Initializable, UUPSUpgradeable, OwnableUpgradeable {
	// Cant change the order or type of the variables down
	uint public usdMinFeePerYer;
	uint public feeThousandagePerYear;
	address[] addressesToPay;
	address[] subscribedAddresses;
	struct Subscription {
		address payingAddress;
		uint startDate;
		uint feePerYear;
		uint feeThousandagePerYear;
		uint payCount;
		bool lastYearPaid;
	}
	mapping(address => Subscription) public addressSubscriptionMap;

	// /// @custom:oz-upgrades-unsafe-allow constructor
	// constructor() initializer {}

	function initialize(
		address owner,
		uint _usdMinFeePerYer,
		uint _feeThousandagePerYear
	) public initializer {
		// __Ownable_init();
		__Ownable_init(owner);
		usdMinFeePerYer = _usdMinFeePerYer;
		feeThousandagePerYear = _feeThousandagePerYear;
	}

	function _authorizeUpgrade(
		address newImplementation
	) internal override onlyOwner {
		console.log("_authorizeUpgrade executed for admin:", _msgSender());
		console.log("New implementation address:", newImplementation);
	}

	function subscribe() public {
		console.log("Calculating the minimum fee for:", _msgSender());

		Subscription storage newSubscription = addressSubscriptionMap[
			_msgSender()
		];

		newSubscription.payingAddress = _msgSender();
		newSubscription.startDate = block.timestamp;
		newSubscription.feePerYear = usdMinFeePerYer;
		newSubscription.feeThousandagePerYear = feeThousandagePerYear;
	}

	// temporary override
	function proxiableUUID() public view override returns (bytes32) {
		bytes32 variable;
		return variable;
	}
}
