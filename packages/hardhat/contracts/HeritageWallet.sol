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
	uint public maxFeePercentagePerYear = 1;
	uint public maxInheritantCount = 10;
	struct Subscription {
		uint startTimestamp;
		uint minFeePerYear;
		uint feeThousandagePerYear;
		uint paidFeeCount;
		bool lastYearPaid;
		uint deposited;
		bool canModify;
		uint lastPaidFeeInWei;
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

		Subscription storage subscriptionData = _registerUser(msg.sender);

		emit Deposit(msg.sender, msg.sender, msg.value);

		uint fee = calculateFeeToPay(msg.sender);
		_payFee(subscriptionData, fee, true, msg.sender);
	}

	/**
	 * This must be only called by the user itself to ensure that only user can determine where his funds can be transferred.
	 * By default it wont allow percentage to be set less than 1 and will limit inheritant count to maximum 100
	 */
	function addInheritant(
		address payable receiver,
		uint percentage
	) public _ifAllowedDisallowModify(msg.sender) {
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

		require(inheritants.length < maxInheritantCount, "Maximum inheritant count reached.");

		Inheritant memory newInheritant = Inheritant(receiver, percentage);

		if (existing) {
			if (percentage == 0) {
				_removeInheritant(msg.sender, existingIdx);
			} else {
				Inheritant storage inheritant = inheritants[existingIdx];
				inheritant.percentToHeritage = percentage;
			}
		} else {
			require(percentage > 0, "Percentage should be above 0.");

			inheritants.push(newInheritant);
		}

		_allowToModify(msg.sender);
	}

	// Wallet functionalities start

	function deposit(address depositeeAddress) public payable {
		Subscription storage subscriptionData = addressSubscriptionMap[
			depositeeAddress
		];

		bool isUserRegistered = subscriptionData.startTimestamp != 0;

		if (!isUserRegistered) {
			_registerUser(depositeeAddress);

			emit Deposit(msg.sender, depositeeAddress, msg.value);

			uint fee = calculateFeeToPay(depositeeAddress);
			_payFee(subscriptionData, fee, true, depositeeAddress);
		} else {
			subscriptionData.deposited += msg.value;

			emit Deposit(msg.sender, depositeeAddress, msg.value);
		}
	}

	function sendFunds(
		uint amount,
		address payable receiver
	)
		public
		_isAllowedToSend(msg.sender, amount)
		_ifAllowedDisallowModify(msg.sender)
	{
		Subscription storage subscriptionData = addressSubscriptionMap[
			msg.sender
		];

		if (subscriptionData.lastYearPaid == false) {
			payOutstandingFees(msg.sender);
		}

		subscriptionData.deposited -= amount;

		receiver.transfer(amount);

		emit SendFunds(msg.sender, receiver, amount);

		_allowToModify(msg.sender);
	}

	// Wallet functionalities end

	// User callable functions end

	function forcePaySingleFee() public _ifAllowedDisallowModify((msg.sender)) {
		Subscription storage subscription = addressSubscriptionMap[msg.sender];

		uint fee = calculateFeeToPay(msg.sender);

		require(
			subscription.deposited >= fee,
			"Not enough deposit to pay fees."
		);

		subscription.deposited -= fee;
		subscription.paidFeeCount++;

		collectedFees += fee;

		_allowToModify(msg.sender);

		emit PayFee(msg.sender, fee);
	}

	function payOutstandingFees(
		address _address
	) public _ifAllowedDisallowModify(_address) returns (bool) {
		Subscription storage subscriptionData = addressSubscriptionMap[
			_address
		];

		uint requiredPaymentCount = _getRequiredPaymentCount(
			subscriptionData.startTimestamp,
			block.timestamp
		) ;

		uint leftYearsToPay = requiredPaymentCount -
			subscriptionData.paidFeeCount;

		for (uint i = 0; i < leftYearsToPay; i++) {
			uint fee = calculateFeeToPay(_address);

			_payFee(subscriptionData, fee, false, _address);
		}

		subscriptionData.lastYearPaid = true;

		_allowToModify(_address);

		return true;
	}

	function _payFee(
		Subscription storage subscription,
		uint fee,
		bool isItNewSubscription,
		address _address
	) internal {
		require(
			subscription.deposited >= fee,
			"Not enough deposit to pay fees."
		);

		if (!isItNewSubscription) {
			require(
				(subscription.deposited * maxFeePercentagePerYear) / 100 >= fee,
				"As a safe-guard, an address can not spend more than 1% of it's balance for a fee payment."
			);
		}

		subscription.lastYearPaid = isItNewSubscription;
		subscription.deposited -= fee;
		subscription.paidFeeCount++;
		subscription.lastPaidFeeInWei = fee;

		collectedFees += fee;

		emit PayFee(_address, fee);
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
	) public onlyOwner _ifAllowedDisallowModify(addr) {
		Subscription storage subscription = addressSubscriptionMap[addr];

		// Update fee status and pay the fees
		updateUnpaidFee(addr);

		if (subscription.lastYearPaid == false) {
			_allowToModify(addr);
			bool feesPaid = payOutstandingFees(addr);
			require(feesPaid, "Fees could not be paid.");
		}

		// Distribute here
		Inheritant[] memory inheritantArr = addrInheritantListMap[addr];

		// Contract pays the gas of the first inheritor, for others minFee is deducted from the deposited
		if( inheritantArr.length > 1){
			// last fee paid in wei is used as a preventive measure against contract being exploited 
			// since it can never be more than maxFeePercentagePerYear of the deposited.
			uint distributionCharge = (inheritantArr.length -1) * subscription.lastPaidFeeInWei;
			subscription.deposited -= distributionCharge;
		}
		

		uint deposited = subscription.deposited;
		
		for (uint i = 0; i < inheritantArr.length; i++) {
			uint percent = inheritantArr[i].percentToHeritage;
			address payable to = inheritantArr[i].to;

			to.transfer((deposited * percent) / 100);
		}

		subscription.deposited = 0;

		_allowToModify(addr);
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

			updateUnpaidFee(userAddress);	
		}
	}

	function updateUnpaidFee(address userAddr)public{
		Subscription storage subscription = addressSubscriptionMap[
				userAddr
			];

		uint requiredPaymentCount = _getRequiredPaymentCount(
			subscription.startTimestamp,
			block.timestamp
		);
		console.log(subscription.startTimestamp, block.timestamp);
		console.log("requiredPaymentCount",requiredPaymentCount);
		if (subscription.paidFeeCount < requiredPaymentCount) {
			subscription.lastYearPaid = false;
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

	function _removeInheritant(
		address userAddr,
		uint inheritantIndex
	) internal {
		Inheritant memory lastInheritant = addrInheritantListMap[userAddr][
			addrInheritantListMap[userAddr].length - 1
		];

		addrInheritantListMap[userAddr][inheritantIndex] = lastInheritant;

		addrInheritantListMap[userAddr].pop();
	}

	function _allowToModify(address _address) internal {
		Subscription storage subscriptionData = addressSubscriptionMap[
			_address
		];

		subscriptionData.canModify = true;
	}

	function _registerUser(
		address userAddress
	) internal returns (Subscription storage) {
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

	function _getRequiredPaymentCount(
		uint startTimestamp,
		uint endTimestamp
	) internal pure returns (uint) {
		return _findYearsBetweenTimestamps(startTimestamp, endTimestamp) + 1;
	}
	function _findYearsBetweenTimestamps(
		uint startTimestamp,
		uint endTimestamp
	) internal pure returns (uint) {
		uint yearsPassedSinceSubscription = 0;

		while (endTimestamp > startTimestamp) {
			startTimestamp += 365 days;

			if (endTimestamp > startTimestamp){
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

	modifier _ifAllowedDisallowModify(address _address) {
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
}
