import {useNetwork} from 'wagmi';
import {useHeritageWalletContract} from './useHeritageWalletContract';

export function useGetEtherScanLink() {
  const {address} = useHeritageWalletContract();
  const {chain} = useNetwork();

  const etherscanLink = `https://${
    chain?.id === 1 ? '' : `${chain?.name}.`
  }etherscan.io/address/${address}`;

  return etherscanLink;
}
