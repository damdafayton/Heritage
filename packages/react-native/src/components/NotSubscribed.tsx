import {useEffect, useState} from 'react';

import {useContractRead, useContractWrite} from 'wagmi';
import {parseEther} from 'ethers';

import {NotSubscribedView} from './NotSubscribedView';
import {useHeritageWalletContract} from '../hooks/useHeritageWalletContract';

export function NotSubscribed({
  refetchAddressSubscriptionMap,
}: {
  refetchAddressSubscriptionMap: Function;
}) {
  const {address, abi} = useHeritageWalletContract();

  const [depositAmountInWEI, setDepositAmountInWEI] = useState<bigint>();
  const [depositAmountInUSD, setDepositAmountInUSD] = useState<bigint>(0n);

  const {data: usdValInWei, refetch: refetchConvertUsdToWei} = useContractRead({
    abi,
    address,
    functionName: 'convertUsdToWei',
    args: [depositAmountInUSD],
    enabled: false,
  });

  const {
    write,
    data,
    isLoading,
    isSuccess: registerSubscriberIsSuccess,
  } = useContractWrite({
    abi,
    address,
    functionName: 'registerSubscriber',
  });

  const handleFormSubmit = async ({depositType, depositAmount}) => {
    console.log({depositType, depositAmount});
    setDepositAmountInWEI(0n);
    setDepositAmountInUSD(0n);

    switch (depositType) {
      case 'ETH':
        const valueInWei = parseEther(depositAmount);

        setDepositAmountInWEI(valueInWei);
        break;
      case 'USD':
        setDepositAmountInUSD(BigInt(depositAmount));
        break;
    }
  };

  useEffect(() => {
    if (!depositAmountInUSD) return;

    refetchConvertUsdToWei();
  }, [depositAmountInUSD]);

  useEffect(() => {
    setDepositAmountInWEI(usdValInWei as bigint);
  }, [usdValInWei]);

  useEffect(() => {
    console.log({depositAmountInWEI});

    if (!depositAmountInWEI) return;

    write({
      // from: userAddress,
      value: depositAmountInWEI,
    });
  }, [depositAmountInWEI]);

  useEffect(() => {
    if (registerSubscriberIsSuccess) refetchAddressSubscriptionMap();
  }, [registerSubscriberIsSuccess]);

  return <NotSubscribedView handleFormSubmit={handleFormSubmit} />;
}
