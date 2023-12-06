//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

interface HeritageWalletInterface {
	function deposit(address _addressToDeposit) external payable;

	function sendFunds(uint amount, address payable receiver) external;

	function payOutstandingFees(address _address) external returns (bool);

	function withdrawCollectedFees(address payable feeCollector) external;

	function distributeHeritage(address addr) external;

	function addInheritant(address payable receiver, uint percentage) external;

	function getRemainingInheritancePercentage(
		address subscriber,
		address receiver
	) external view returns (uint, bool, uint);

	function calculateFeeToPay(address _address) external view returns (uint);

	function getEthPrice() external view returns (uint, uint);
}
