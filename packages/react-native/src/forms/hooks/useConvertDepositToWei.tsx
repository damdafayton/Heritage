import {parseEther} from 'ethers';

import {DepositFormVals} from '../DepositForm';
import {usePublicClient} from 'wagmi';
import {useHeritageWalletContract} from '../../hooks/useHeritageWalletContract';

export function useConvertDepositToWei() {
  const {abi, address} = useHeritageWalletContract();

  const client = usePublicClient();

  async function getDepositInWei({
    depositType,
    depositAmount,
  }: DepositFormVals) {
    if (!abi || !address) return;

    console.log({depositType, depositAmount});

    let valueInWei;
    switch (depositType) {
      case 'ETH':
        valueInWei = parseEther(depositAmount);

        return valueInWei;
      case 'USD':
        const res = await client.readContract({
          abi,
          address,
          args: [BigInt(depositAmount)],
          functionName: 'convertUsdToWei',
        });

        valueInWei = res;
        return valueInWei;
    }
  }

  return {getDepositInWei};
}
