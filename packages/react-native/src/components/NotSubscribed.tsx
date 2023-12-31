import {useEffect, useState} from 'react';

import {NotSubscribedView} from './NotSubscribedView';
import {useHeritageContract} from '../hooks/useHeritageContract';
import {readContracts} from 'wagmi';
import {parseEther} from 'ethers';

export function NotSubscribed() {
  const {
    address: heritageAddress,
    abi,
    getHeritageFunction,
  } = useHeritageContract();
  const usdToWeiFn = getHeritageFunction?.('convertUsdToWei');

  const [depositAmountInWEI, setDepositAmountInWEI] = useState<bigint>();

  const handleFormSubmit = async ({depositType, depositAmount}) => {
    console.log({depositType, depositAmount});

    let valueInWei: bigint;

    switch (depositType) {
      case 'ETH':
        valueInWei = parseEther(depositAmount);

        setDepositAmountInWEI(valueInWei);
        break;
      case 'USD':
        if (!usdToWeiFn || !heritageAddress) break;

        const data = await readContracts({
          contracts: [
            {
              abi: [usdToWeiFn],
              address: heritageAddress,
              functionName: usdToWeiFn?.name,
              args: [depositAmount],
            },
          ],
        });

        valueInWei = data[0]?.result as bigint;

        setDepositAmountInWEI(valueInWei);
        break;
    }
  };

  useEffect(() => {
    if (!depositAmountInWEI) return;

    console.log({depositAmountInWEI});
  }, [depositAmountInWEI]);

  return <NotSubscribedView handleFormSubmit={handleFormSubmit} />;
}
