import {useContext, useEffect} from 'react';

import {useContractWrite} from 'wagmi';

import {NotSubscribedView} from './11_NotSubscribedView';
import {useHeritageWalletContract} from '../../hooks/useHeritageWalletContract';
import {HerritageWalletContext} from '../../context/HerritageWallet.context';
import {useConvertDepositToWei} from '../../forms/hooks/useConvertDepositToWei';

export function NotSubscribed() {
  const {refetchSubscriptionData} = useContext(HerritageWalletContext);

  const {getDepositInWei} = useConvertDepositToWei();

  const handleFormSubmit = async vals => {
    const depositAmountInWEI = await getDepositInWei(vals);

    await writeAsync({
      value: depositAmountInWEI,
    });
  };

  const {address, abi} = useHeritageWalletContract();

  const {writeAsync, isSuccess: registerSubscriberIsSuccess} = useContractWrite(
    {
      abi,
      address,
      functionName: 'registerSubscriber',
    },
  );

  useEffect(() => {
    if (registerSubscriberIsSuccess) refetchSubscriptionData();
  }, [registerSubscriberIsSuccess]);

  return <NotSubscribedView handleFormSubmit={handleFormSubmit} />;
}
