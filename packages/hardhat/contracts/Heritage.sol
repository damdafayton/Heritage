//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// Useful for debugging. Remove when deploying to a live network.
import "hardhat/console.sol";

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "./HeritageWalletInterface.sol";
import "./HeritageWallet.sol";

contract Heritage is
	HeritageWalletInterface,
	Initializable,
	UUPSUpgradeable,
	OwnableUpgradeable
{
	// Cant change the order or type of the variables down
	address heritageWalletAddr;
	address ethUsdPriceFeed;
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
		address _heritageWalletAddr,
		uint _usdMinFeePerYer,
		uint _feeThousandagePerYear
	) public initializer {
		// __Ownable_init();
		__Ownable_init(owner);
		usdMinFeePerYer = _usdMinFeePerYer;
		feeThousandagePerYear = _feeThousandagePerYear;
		heritageWalletAddr = _heritageWalletAddr;
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

	function deposit(address _addressToDeposit) external payable {
		HeritageWallet wallet = _getHeritageWallet();

		wallet.deposit(_addressToDeposit);
	}

	function sendFunds(uint amount, address payable receiver) external {
		HeritageWallet wallet = _getHeritageWallet();

		wallet.sendFunds(amount, receiver);
	}

	function payOutstandingFees(address _address) external returns (bool) {
		HeritageWallet wallet = _getHeritageWallet();

		return wallet.payOutstandingFees(_address);
	}

	function withdrawCollectedFees() external {
		HeritageWallet wallet = _getHeritageWallet();

		wallet.withdrawCollectedFees();
	}

	function distributeHeritage(address addr) external {
		HeritageWallet wallet = _getHeritageWallet();

		wallet.distributeHeritage(addr);
	}

	function addInheritant(address payable receiver, uint percentage) external {
		HeritageWallet wallet = _getHeritageWallet();

		wallet.addInheritant(receiver, percentage);
	}

	function getRemainingInheritancePercentage(
		address subscriber,
		address receiver
	) external view returns (uint, bool, uint) {
		HeritageWallet wallet = _getHeritageWallet();

		return wallet.getRemainingInheritancePercentage(subscriber, receiver);
	}

	function calculateFeeToPay(address _address) external view returns (uint) {
		HeritageWallet wallet = _getHeritageWallet();

		return wallet.calculateFeeToPay(_address);
	}

	function registerSubscriber(
		address _address,
		uint _minFeePerYear,
		uint _feeThousandagePerYear
	) external {
		HeritageWallet wallet = _getHeritageWallet();

		wallet.registerSubscriber(
			_address,
			_minFeePerYear,
			_feeThousandagePerYear
		);
	}

	function getEthPrice() external view returns (uint, uint) {
		HeritageWallet wallet = _getHeritageWallet();

		return wallet.getEthPrice();
	}

	function _getHeritageWallet() internal view returns (HeritageWallet) {
		HeritageWallet heritageWallet = HeritageWallet(heritageWalletAddr);

		return heritageWallet;
	}
}
