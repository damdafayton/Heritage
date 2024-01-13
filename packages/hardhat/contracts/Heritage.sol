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
	address public heritageWalletAddr;
	address public manager;

	// /// @custom:oz-upgrades-unsafe-allow constructor
	// constructor() initializer {}

	function initialize(address _heritageWalletAddr) public initializer {
		__Ownable_init(msg.sender);
		heritageWalletAddr = _heritageWalletAddr;
	}

	function _authorizeUpgrade(
		address newImplementation
	) internal view override onlyOwner {
		console.log("_authorizeUpgrade executed for admin:", _msgSender());
		console.log("New implementation address:", newImplementation);
	}

	// temporary override for frontend
	function proxiableUUID() public pure override returns (bytes32) {
		return ERC1967Utils.IMPLEMENTATION_SLOT;
	}

	function transferHeritageWalletOwner(address newOwner) public onlyOwner {
		_getHeritageWallet().transferOwnership(newOwner);
	}

	function updateManager(address _manager) public onlyOwner {
		manager = _manager;
	}

	modifier _onlyManager() {
		require(
			msg.sender == manager,
			"Only manager can access this functionality."
		);
		_;
	}

	function addressSubscriptionMap(
		address addr
	) external view returns (uint, uint, uint, uint, bool, uint, bool) {
		return _getHeritageWallet().addressSubscriptionMap(addr);
	}

	//  Interface functions

	function convertUsdToWei(uint valInUSD) public view returns (uint) {
		return _getHeritageWallet().convertUsdToWei(valInUSD);
	}

	function withdrawCollectedFees(
		address payable feeCollector
	) external onlyOwner {
		_getHeritageWallet().withdrawCollectedFees(feeCollector);
	}

	function distributeHeritage(address addr) external _onlyManager {
		_getHeritageWallet().distributeHeritage(addr);
	}

	function deposit(address _addressToDeposit) external payable {
		_getHeritageWallet().deposit{ value: msg.value }(_addressToDeposit);
	}

	function sendFunds(uint amount, address payable receiver) external {
		_getHeritageWallet().sendFunds(amount, receiver);
	}

	function payOutstandingFees(address _address) external returns (bool) {
		return _getHeritageWallet().payOutstandingFees(_address);
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
