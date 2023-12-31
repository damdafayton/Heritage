//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./HeritageWalletInterface.sol";

// Useful for debugging. Remove when deploying to a live network.
import "hardhat/console.sol";

contract HeritageWallet is HeritageWalletInterface, Ownable {
	uint collectedFees;
	address ethUsdPriceFeed;
	// In case outsiders want to use the contract as a wallet.
	uint defaultTransferPercentForNonRegistered = 1;
	struct Subscription {
		uint startTimestamp;
		uint minFeePerYear;
		uint feeThousandagePerYear;
		uint paidFeeCount;
		bool lastYearPaid;
		uint deposited;
		bool canModify;
	}
	mapping(address => Subscription) public addressSubscriptionMap;
	mapping(address => Inheritant[]) public addrInheritantListMap;
	struct Inheritant {
		address payable to;
		uint percentToHeritage;
	}
	// event for deposit and for withdraw
	event Deposit(address _sender, address addressToDeposit, uint amount);
	event SendFunds(address _sender, address _beneficiary, uint amount);

	// set the owner as soon as the wallet is created
	constructor(address _owner, address _ethUsdPriceFeed) Ownable(_owner) {
		ethUsdPriceFeed = _ethUsdPriceFeed;
	}

	function deposit(address _addressToDeposit) public payable {
		Subscription storage subscriptionData = addressSubscriptionMap[
			_addressToDeposit
		];
		subscriptionData.deposited += msg.value;

		emit Deposit(msg.sender, _addressToDeposit, msg.value);
	}

	function sendFunds(
		uint amount,
		address payable receiver
	) public _isAllowedToSend(msg.sender, amount) _isFeePaid(msg.sender) {
		Subscription storage subsciptionData = addressSubscriptionMap[
			msg.sender
		];

		subsciptionData.deposited -= amount;

		receiver.transfer(amount);

		emit SendFunds(msg.sender, receiver, amount);
	}

	function payOutstandingFees(address _address) public returns (bool) {
		_changeCanModify(_address, false);

		Subscription storage subscriptionData = addressSubscriptionMap[
			_address
		];

		uint requiredPaymentCount = _findYearsBetweenTimestamps(
			subscriptionData.startTimestamp,
			block.timestamp
		) + 1;

		uint leftYearsToPay = requiredPaymentCount -
			subscriptionData.paidFeeCount;

		for (uint i = 0; i < leftYearsToPay; i++) {
			uint fee = calculateFeeToPay(_address);

			require(
				subscriptionData.deposited >= fee,
				"Not enough deposit to pay fees."
			);
			subscriptionData.deposited -= fee;
			subscriptionData.paidFeeCount++;
			collectedFees += fee;
		}

		subscriptionData.lastYearPaid = true;
		_changeCanModify(_address, true);

		return true;
	}

	function withdrawCollectedFees(
		address payable feeCollector
	) public onlyOwner {
		feeCollector.transfer(collectedFees);
	}

	function distributeHeritage(
		address addr
	) public onlyOwner _isFeePaid(addr) {
		_changeCanModify(msg.sender, false);

		// Distribute here
		Inheritant[] memory inheritantArr = addrInheritantListMap[addr];
		Subscription storage subscription = addressSubscriptionMap[addr];
		uint amountToDistribute = subscription.deposited;

		for (uint i = 0; i < inheritantArr.length; i++) {
			uint percent = inheritantArr[i].percentToHeritage;
			address payable to = inheritantArr[i].to;

			to.transfer((amountToDistribute * percent) / 100);
		}

		subscription.deposited = 0;

		_changeCanModify(msg.sender, true);
	}

	function addInheritant(
		address payable receiver,
		uint percentage
	) public _isAllowedToModify(msg.sender) {
		_changeCanModify(msg.sender, false);

		(
			uint available,
			bool existing,
			uint existingIdx
		) = getRemainingInheritancePercentage(msg.sender, receiver);

		require(
			available >= percentage,
			"Remaining inheritance amount is not enough for target percentage. Please set a lower percentage."
		);

		Inheritant[] storage inheritants = addrInheritantListMap[msg.sender];

		Inheritant memory newInheritant = Inheritant(receiver, percentage);

		if (existing) {
			Inheritant storage inheritant = inheritants[existingIdx];
			inheritant.percentToHeritage = percentage;
		} else {
			inheritants.push(newInheritant);
		}

		_changeCanModify(msg.sender, true);
	}

	function getRemainingInheritancePercentage(
		address subscriber,
		address receiver
	) public view returns (uint, bool, uint) {
		Inheritant[] storage inheritants = addrInheritantListMap[subscriber];

		uint consumedInheritancePercent = 0;

		bool existing = false;
		uint existingIdx = 0;

		for (uint i = 0; i < inheritants.length; i++) {
			if (inheritants[i].to == receiver) {
				existing = true;
				existingIdx = i;
				continue;
			}

			consumedInheritancePercent += inheritants[i].percentToHeritage;
		}

		uint available = 100 - consumedInheritancePercent;

		return (available, existing, existingIdx);
	}

	// Choses the higher val of fixed fee vs thousandage fee and returns the result in WEI
	function calculateFeeToPay(address _address) public view returns (uint) {
		Subscription storage subscriptionData = addressSubscriptionMap[
			_address
		];

		uint userMinFee = convertUsdToWei(subscriptionData.minFeePerYear);

		uint userFeeFromThousandage = (subscriptionData.deposited *
			subscriptionData.feeThousandagePerYear) / 1000;

		userMinFee = userMinFee < userFeeFromThousandage
			? userFeeFromThousandage
			: userMinFee;

		return userMinFee;
	}

	function registerSubscriber(
		address _address,
		uint minFeePerYear,
		uint feeThousandagePerYear
	) public payable onlyOwner {
		Subscription storage subscription = addressSubscriptionMap[_address];

		require(subscription.startTimestamp == 0, "Already registered.");

		subscription.startTimestamp = block.timestamp;
		subscription.minFeePerYear = minFeePerYear;
		subscription.feeThousandagePerYear = feeThousandagePerYear;
		subscription.canModify = true;
		subscription.deposited += msg.value;
	}

	function getEthPrice() public view returns (uint, uint) {
		AggregatorV3Interface dataFeed = AggregatorV3Interface(ethUsdPriceFeed);

		// prettier-ignore
		(
            /* uint80 roundID */,
            int answer,
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = dataFeed.latestRoundData();

		uint decimal = dataFeed.decimals();

		return (uint(answer), decimal);
	}

	function convertUsdToWei(uint valueInUSD) public view returns (uint) {
		(uint ethPrice, uint decimal) = getEthPrice();

		// Match value digits to ethPrice digits
		uint valueStandardized = valueInUSD * 10 ** decimal;

		uint valueInWei = (1 ether * valueStandardized) / ethPrice;

		return valueInWei;
	}

	function _numDigits(int number) internal pure returns (uint8) {
		uint8 digits = 0;
		//if (number < 0) digits = 1; // enable this line if '-' counts as a digit
		while (number != 0) {
			number /= 10;
			digits++;
		}
		return digits;
	}

	function _changeCanModify(address _address, bool newStatus) internal {
		Subscription storage subscriptionData = addressSubscriptionMap[
			_address
		];

		subscriptionData.canModify = newStatus;
	}

	modifier _isFeePaid(address _address) {
		Subscription storage subscriptionData = addressSubscriptionMap[
			_address
		];

		require(
			subscriptionData.lastYearPaid,
			"Sender has outstanding fee to pay."
		);

		_;
	}

	function _findYearsBetweenTimestamps(
		uint startTimestamp,
		uint endTimestamp
	) internal pure returns (uint) {
		uint yearsPassedSinceSubscription = 0;

		while (endTimestamp > startTimestamp) {
			yearsPassedSinceSubscription++;

			startTimestamp += 365 days;

			if (startTimestamp <= endTimestamp) {
				yearsPassedSinceSubscription++;
			}
		}

		return yearsPassedSinceSubscription;
	}

	modifier _isAllowedToSend(address _address, uint _amount) {
		Subscription storage subscriptionData = addressSubscriptionMap[
			_address
		];

		require(
			subscriptionData.deposited >= _amount,
			"Sender doesnt have enough balance."
		);

		_;
	}

	modifier _isAllowedToModify(address _address) {
		Subscription storage subscriptionData = addressSubscriptionMap[
			_address
		];

		require(
			subscriptionData.startTimestamp != 0,
			"Address is not registered."
		);

		require(
			subscriptionData.canModify == true,
			"Address data can not be modified now. Wait for ongoing updates to finish."
		);

		_;
	}
}
