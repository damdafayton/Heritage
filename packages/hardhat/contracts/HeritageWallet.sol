//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";

import "../interfaces/HeritageWalletInterface.sol";

// Useful for debugging. Remove when deploying to a live network.
import "hardhat/console.sol";

contract HeritageWallet is HeritageWalletInterface, Ownable {
	uint collectedFees;
	address public heritageProxyAddr;
	uint public minFeePerYearInUsd;
	uint public feeThousandagePerYear;
	uint public minimumInheritancePercentage = 1;
	struct Subscription {
		uint startTimestamp;
		uint minFeePerYear;
		uint feeThousandagePerYear;
		uint paidFeeCount;
		bool lastYearPaid;
		uint deposited;
		bool canModify;
	}
	address[] internal subscriberList;
	mapping(address => Subscription) public addressSubscriptionMap;
	mapping(address => Inheritant[]) public addrInheritantListMap;
	struct Inheritant {
		address payable to;
		uint percentToHeritage;
	}
	// event for deposit and for withdraw
	event Deposit(address _sender, address addressToDeposit, uint amount);
	event SendFunds(address _sender, address _beneficiary, uint amount);
	event PayFee(address inheritant, uint feeAmount);

	// set the owner as soon as the wallet is created
	constructor(
		address _owner,
		uint _minFeePerYearInUsd,
		uint _feeThousandagePerYear
	) Ownable(_owner) {
		minFeePerYearInUsd = _minFeePerYearInUsd;
		feeThousandagePerYear = _feeThousandagePerYear;
	}

	function updateFeeThousandage(uint newFee) public onlyOwner {
		feeThousandagePerYear = newFee;
	}

	function updateMinFee(uint newFee) public onlyOwner {
		minFeePerYearInUsd = newFee;
	}

	// User callable functions start

	function registerSubscriber() public payable {
		uint minimumDepositInWei = convertUsdToWei(minFeePerYearInUsd);

		require(
			minimumDepositInWei <= msg.value,
			"Minimum fee must be deposited to register a new user."
		);

		_registerUser(msg.sender);

		payOutstandingFees(msg.sender);
	}

	/**
	 * This must be only called by the user itself to ensure that only user can determine where his funds can be transferred.
	 * By default it wont allow percentage to be set less than 1 and will limit inheritant count to maximum 100
	 */
	function addInheritant(
		address payable receiver,
		uint percentage
	) public _isAllowedToModify(msg.sender) {
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

		_allowToModify(msg.sender);
	}

	// Wallet functionalities start

	function deposit(address depositeeAddress) public payable {
		Subscription storage subscriptionData = addressSubscriptionMap[
			depositeeAddress
		];

		if (subscriptionData.startTimestamp == 0) {
			_registerUser(depositeeAddress);
		}

		emit Deposit(msg.sender, depositeeAddress, msg.value);

		if (subscriptionData.lastYearPaid == false) {
			payOutstandingFees(depositeeAddress);
		}
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

	// Wallet functionalities end

	// User callable functions end

	function payOutstandingFees(
		address _address
	) public _isAllowedToModify(_address) returns (bool) {
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

			emit PayFee(_address, fee);
		}

		subscriptionData.lastYearPaid = true;

		_allowToModify(_address);

		return true;
	}

	function withdrawCollectedFees(
		address payable feeCollector
	) public onlyOwner {
		feeCollector.transfer(collectedFees);
	}

	function getCollectedFees() external view onlyOwner returns (uint) {
		return collectedFees;
	}

	function distributeHeritage(
		address addr
	) public onlyOwner _isAllowedToModify(addr) _isFeePaid(addr) {
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

		_allowToModify(msg.sender);
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

	// Utilities start here

	function getEthPrice() public view returns (uint, uint) {
		return _getHeritageProxy().getEthPrice();
	}

	function convertUsdToWei(uint valueInUSD) public view returns (uint) {
		(uint ethPrice, uint decimal) = getEthPrice();

		// Match value digits to ethPrice digits
		uint valueStandardized = valueInUSD * 10 ** decimal;

		uint valueInWei = (1 ether * valueStandardized) / ethPrice;

		return valueInWei;
	}

	function updateUnpaidFees() public {
		for (uint i = 0; i < subscriberList.length; i++) {
			address userAddress = subscriberList[0];
			Subscription storage subscription = addressSubscriptionMap[
				userAddress
			];

			uint requiredPaymentCount = _findYearsBetweenTimestamps(
				subscription.startTimestamp,
				block.timestamp
			) + 1;

			if (subscription.paidFeeCount < requiredPaymentCount) {
				subscription.lastYearPaid = false;
			}
		}
	}

	function getSubscriberList()
		public
		view
		onlyOwner
		returns (address[] memory)
	{
		return subscriberList;
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

	function setHeritageProxyAddress(
		address _heritageProxyAddr
	) external onlyOwner {
		heritageProxyAddr = _heritageProxyAddr;
	}

	// Utilities end here

	// Internal helpers start here

	function _getHeritageProxy()
		internal
		view
		returns (HeritageWalletInterface)
	{
		HeritageWalletInterface heritageProxy = HeritageWalletInterface(
			heritageProxyAddr
		);

		return heritageProxy;
	}

	function _allowToModify(address _address) internal {
		Subscription storage subscriptionData = addressSubscriptionMap[
			_address
		];

		subscriptionData.canModify = true;
	}

	function _registerUser(
		address userAddress
	) internal returns (Subscription memory) {
		Subscription storage subscription = addressSubscriptionMap[userAddress];

		require(subscription.startTimestamp == 0, "Already registered.");
		subscriberList.push(userAddress);

		subscription.startTimestamp = block.timestamp;
		subscription.minFeePerYear = minFeePerYearInUsd;
		subscription.feeThousandagePerYear = feeThousandagePerYear;
		subscription.canModify = true;
		subscription.deposited += msg.value;

		return subscription;
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

	// Internal helpers end here

	// Modifiers

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

		subscriptionData.canModify = false;

		_;
	}

	modifier _isFeePaid(address _address) {
		Subscription storage subscriptionData = addressSubscriptionMap[
			_address
		];

		require(
			subscriptionData.lastYearPaid,
			"Inheritant has outstanding fee to pay."
		);

		_;
	}
}
