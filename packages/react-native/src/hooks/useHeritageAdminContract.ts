import {useNetwork} from 'wagmi';
import {AbiFunction} from 'abitype';

import deployedContracts from '../../contracts/deployedContracts';
import {GenericContractsDeclaration} from '../../types/hardhat';

const contracts = deployedContracts as GenericContractsDeclaration;

export function useHeritageAdminContract() {
  const {chain, chains} = useNetwork();

  if (!chain?.id) return {};

  const deployment = contracts[chain.id]?.['HeritageAdmin'];

  const defaultABI = deployedContracts['31337']['HeritageAdmin'].abi;

  const address = deployment?.address;
  const abi = deployment?.abi as unknown as typeof defaultABI;

  const findContractFunction = (functionName: string) => {
    return abi?.find(part => {
      const partAsFn = part as AbiFunction;
      return partAsFn.name === functionName;
    }) as AbiFunction;
  };

  return {address, abi, findContractFunction};
}
