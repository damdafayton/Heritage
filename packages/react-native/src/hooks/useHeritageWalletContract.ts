import {useNetwork} from 'wagmi';
import {AbiFunction} from 'abitype';
import {logger} from '../utils/logger';

const log = logger('useHeritageWalletContract');

import deployedContracts from '../../contracts/deployedContracts';
import {GenericContractsDeclaration} from '../../types/hardhat';

const contracts = deployedContracts as GenericContractsDeclaration;

const defaultABI = deployedContracts['31337']['HeritageWallet'].abi;
type NameValues<T> = T extends {name: infer U} ? U : never;
type Names = NameValues<(typeof defaultABI)[number]>;
export type FindHeritageWalletFunction = (functionName: Names) => AbiFunction;

export function useHeritageWalletContract() {
  const {chain, chains} = useNetwork();

  if (!chain?.id) {
    const error = 'Chain or chain ID can not be found.';

    return {error};
  }

  const deployment = contracts[chain.id]?.['HeritageWallet'];

  if (!deployment) {
    const error = `HeritageWallet can not be found at chain with ID: ${chain.id} and name: ${chain.name}`;
    log.error(error);
    return {error};
  }

  const address = deployment?.address;
  const abi = deployment?.abi as unknown as typeof defaultABI;

  const findContractFunction: FindHeritageWalletFunction = (
    functionName: Names,
  ) => {
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
