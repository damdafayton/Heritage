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
	address manager;
	uint public minFeePerYearInUsd;
	uint public feeThousandagePerYear;

	// /// @custom:oz-upgrades-unsafe-allow constructor
	// constructor() initializer {}

	function initialize(
		address _heritageWalletAddr,
		uint _minFeePerYearInUsd,
		uint _feeThousandagePerYear
	) public initializer {
		__Ownable_init(msg.sender);
		heritageWalletAddr = _heritageWalletAddr;
		minFeePerYearInUsd = _minFeePerYearInUsd;
		feeThousandagePerYear = _feeThousandagePerYear;
	}

	function _authorizeUpgrade(
		address newImplementation
	) internal view override onlyOwner {
		console.log("_authorizeUpgrade executed for admin:", _msgSender());
		console.log("New implementation address:", newImplementation);
	}

	// temporary override
	// function proxiableUUID() public view override returns (bytes32) {
	// 	bytes32 variable;
	// 	return variable;
	// }

	function updateFeeThousandage(uint newFee) public onlyOwner {
		feeThousandagePerYear = newFee;
	}

	function updateMinFee(uint newFee) public onlyOwner {
		minFeePerYearInUsd = newFee;
	}

	/**
	 * manager
	 */
	function registerSubscriber(address _address) external {
		_getHeritageWallet().registerSubscriber(
			_address,
			minFeePerYearInUsd,
			feeThousandagePerYear
		);
	}

	//  Interface functions

	/**
	 * onlyOwner
	 * manager
	 */
	function withdrawCollectedFees() external {
		_getHeritageWallet().withdrawCollectedFees();
	}

	/**
	 * manager
	 */
	function distributeHeritage(address addr) external {
		_getHeritageWallet().distributeHeritage(addr);
	}

	function deposit(address _addressToDeposit) external payable {
		_getHeritageWallet().deposit(_addressToDeposit);
	}

	function sendFunds(uint amount, address payable receiver) external {
		_getHeritageWallet().sendFunds(amount, receiver);
	}

	function payOutstandingFees(address _address) external returns (bool) {
		return _getHeritageWallet().payOutstandingFees(_address);
	}

	function addInheritant(address payable receiver, uint percentage) external {
		_getHeritageWallet().addInheritant(receiver, percentage);
	}

	function getRemainingInheritancePercentage(
		address subscriber,
		address receiver
	) external view returns (uint, bool, uint) {
		return
			_getHeritageWallet().getRemainingInheritancePercentage(
				subscriber,
				receiver
			);
	}

	function calculateFeeToPay(address _address) external view returns (uint) {
		return _getHeritageWallet().calculateFeeToPay(_address);
	}

	function getEthPrice() external view returns (uint, uint) {
		return _getHeritageWallet().getEthPrice();
	}

	function _getHeritageWallet() internal view returns (HeritageWallet) {
		HeritageWallet heritageWallet = HeritageWallet(heritageWalletAddr);

		return heritageWallet;
	}
}
