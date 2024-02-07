import {useContext, useEffect} from 'react';
import {useContractWrite} from 'wagmi';
import {logger} from '../../utils/logger';
const log = logger('NotSubscribed');

import {SubscribeView} from './SubscribeView';
import {useHeritageWalletContract} from '../../hooks/useHeritageWalletContract';
import {HerritageWalletContext} from '../../context/HerritageWallet.context';
import {useConvertDepositToWei} from '../../forms/hooks/useConvertDepositToWei';

export function Subscribe() {
  const {refetchSubscriptionData} = useContext(HerritageWalletContext);

  const {getDepositInWei} = useConvertDepositToWei();

  const handleFormSubmit = async vals => {
    try {
      const depositAmountInWEI = await getDepositInWei(vals);

      await writeAsync({
        value: depositAmountInWEI,
      });
    } catch (e) {
      log.error(e);
      return {error: e};
    }
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

  return <SubscribeView handleFormSubmit={handleFormSubmit} />;
}
