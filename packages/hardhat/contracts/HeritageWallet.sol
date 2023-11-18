//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

// Useful for debugging. Remove when deploying to a live network.
import "hardhat/console.sol";

contract HeritageWallet is Ownable {
	uint collectedFees;
	address ethUsdPriceFeed;
	struct Subscription {
		uint startTimestamp;
		uint minFeePerYear;
		uint feeThousandagePerYear;
		uint paidFeeCount;
		bool lastYearPaid;
		Inheritant[] inheritantList;
		uint deposited;
		bool canModify;
	}
	mapping(address => Subscription) public addressSubscriptionMap;
	struct Inheritant {
		address to;
		uint percentToHeritage;
	}
	// event for deposit and for withdraw
	event Deposit(address _sender, address addressToDeposit, uint amount);
	event SendFunds(address _sender, uint amount, address _beneficiary);

	// set the owner as soon as the wallet is created
	constructor(address _owner, address _ethUsdPriceFeed) Ownable(_owner) {
		ethUsdPriceFeed = _ethUsdPriceFeed;
	}

	/**
	 * Deposit to address in the args or to sender itself.
	 * @param _addressToDeposit address
	 */
	function deposit(address _addressToDeposit) public payable {
		address addressToDeposit = _addressToDeposit;

		if (_addressToDeposit == address(0)) {
			addressToDeposit = msg.sender;
		}

		Subscription storage subscriptionData = addressSubscriptionMap[
			addressToDeposit
		];
		subscriptionData.deposited += msg.value;

		emit Deposit(msg.sender, addressToDeposit, msg.value);

		console.log("trigger compile");
	}

	function sendFunds(
		uint amount,
		address payable receiver
	) public isAllowedToSend(msg.sender, amount) {
		_isFeePaid(msg.sender);

		Subscription storage subsciptionData = addressSubscriptionMap[
			msg.sender
		];

		subsciptionData.deposited -= amount;

		receiver.transfer(amount);

		emit SendFunds(msg.sender, amount, receiver);
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

		for (uint i = 0; i < leftYearsToPay; i++) {}

		_changeCanModify(_address, true);

		return true;
	}

	function withdrawCollectedFees() public onlyOwner {
		address payable ownerAddress = payable(owner());

		ownerAddress.transfer(collectedFees);
	}

	function distributeHeritage() public onlyOwner {
		if (!_isFeePaid(msg.sender)) {
			require(
				payOutstandingFees(msg.sender),
				"Fees can not be paid. Please try later."
			);
		}

		// Distribute here
	}

	function addInheritant(
		address receiver,
		uint percentage
	) public isAllowedToModify(msg.sender) {
		_changeCanModify(msg.sender, false);

		require(
			getRemainingInheritancePercentage(msg.sender) >= percentage,
			"Remaining inheritance amount is not enough for target percentage. Please set a lower percentage."
		);

		Inheritant memory newInheritant = Inheritant(receiver, percentage);

		Subscription storage subscriptionData = addressSubscriptionMap[
			msg.sender
		];

		subscriptionData.inheritantList.push(newInheritant);

		_changeCanModify(msg.sender, true);
	}

	function getRemainingInheritancePercentage(
		address _address
	) public view returns (uint) {
		Subscription storage subscriptionData = addressSubscriptionMap[
			_address
		];

		uint consumedInheritancePercent = 0;

		for (uint i = 0; i < subscriptionData.inheritantList.length; i++) {
			consumedInheritancePercent += subscriptionData
				.inheritantList[i]
				.percentToHeritage;
		}

		return 100 - consumedInheritancePercent;
	}

	// Choses the higher val of fixed fee vs thousandage fee and returns the result in WEI
	function calculateFeeToPay(address _address) public view returns (uint) {
		Subscription storage subscriptionData = addressSubscriptionMap[
			_address
		];

		(uint ethPrice, uint decimal) = getEthPrice();

		uint userMinFee = _convertPriceToWei(
			subscriptionData.minFeePerYear,
			ethPrice,
			decimal
		);

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
	) public onlyOwner {
		Subscription storage newSubscription = addressSubscriptionMap[_address];

		require(newSubscription.startTimestamp == 0, "Already registered.");

		newSubscription.startTimestamp = block.timestamp;
		newSubscription.minFeePerYear = minFeePerYear;
		newSubscription.feeThousandagePerYear = feeThousandagePerYear;
		newSubscription.canModify = true;
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

	function _convertPriceToWei(
		uint price,
		uint ethPrice,
		uint decimal
	) internal pure returns (uint) {
		uint missingDecimalCountInPrice = _numDigits(int(ethPrice)) - decimal;
		// Match price digits to ethPrice digits
		uint priceStandardized = price * 10 ** missingDecimalCountInPrice;

		uint priceInWei = (1 ether * priceStandardized) / ethPrice;

		return priceInWei;
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

	function _isFeePaid(address _address) internal view returns (bool) {
		Subscription storage subscriptionData = addressSubscriptionMap[
			_address
		];

		require(
			subscriptionData.lastYearPaid,
			"Sender has outstanding fee to pay."
		);

		return true;
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

	modifier isAllowedToSend(address _address, uint _amount) {
		Subscription storage subscriptionData = addressSubscriptionMap[
			_address
		];

		require(
			subscriptionData.deposited > _amount,
			"Sender doesnt have enough balance."
		);

		_;
	}

	modifier isAllowedToModify(address _address) {
		Subscription storage subscriptionData = addressSubscriptionMap[
			_address
		];

		require(
			subscriptionData.canModify == true,
			"Address data can not be modified now. Wait for ongoing updates to finish."
		);

		_;
	}
}
