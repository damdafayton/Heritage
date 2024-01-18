import {useNetwork} from 'wagmi';
import {AbiFunction} from 'abitype';

import deployedContracts from '../../contracts/deployedContracts';
import {GenericContractsDeclaration} from '../../types/hardhat';

const contracts = deployedContracts as GenericContractsDeclaration;

export function useHeritageWalletContract() {
  const {chain, chains} = useNetwork();

  if (!chain?.id) {
    const error = 'Chain or chain ID can not be found.';
    console.info(error);
    return {error};
  }

  const deployment = contracts[chain.id]?.['HeritageWallet'];

  if (!deployment) {
    const error = `HeritageWallet can not be found at chain with ID: ${chain.id} and name: ${chain.name}`;
    console.info(error);
    return {error};
  }

  const defaultABI = deployedContracts['31337']['HeritageWallet'].abi;

  const address = deployment?.address;
  const abi = deployment?.abi as unknown as typeof defaultABI;

  const findContractFunction = (functionName: string) => {
    return abi?.find(part => {
      const partAsFn = part as AbiFunction;
      return partAsFn.name === functionName;
    }) as AbiFunction;
  };

  return {
    address,
    abi,
    findContractFunction,
  };
}
