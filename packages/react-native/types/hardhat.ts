import {Abi} from 'abitype';
import {Address} from 'viem';

export type GenericContractsDeclaration = {
  [chainId: number]: {
    [contractName: string]: {
      address: Address;
      abi: Abi;
    };
  };
};
