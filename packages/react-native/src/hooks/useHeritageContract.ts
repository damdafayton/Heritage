import {useNetwork} from 'wagmi';

import deployedContracts from '../../contracts/deployedContracts';
import {GenericContractsDeclaration} from '../../types/hardhat';

const contracts = deployedContracts as GenericContractsDeclaration;

export function useHeritageContract() {
  const {chain, chains} = useNetwork();

  if (!chain?.id) return {};

  const heritage = contracts[chain.id]?.Heritage;

  const address = heritage?.address;
  const abi = heritage?.abi;

  return {address, abi};
}
