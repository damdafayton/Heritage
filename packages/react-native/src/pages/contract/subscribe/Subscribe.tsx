import {useContext, useEffect} from 'react';
import {useContractWrite} from 'wagmi';
import {logger} from '../../../utils/logger';
const log = logger('Subscribe');

import {SubscribeView} from './SubscribeView';
import {useHeritageWalletContract} from '../../../hooks/useHeritageWalletContract';
import {HerritageWalletContext} from '../../../context/HerritageWallet.context';
import {useConvertDepositToWei} from '../../../forms/hooks/useConvertDepositToWei';
import {PortalWithModal} from '../../../ui/PortalWithModal';
import {AppStateContext} from '../../../context/AppState.context';

export function Subscribe({visible, setVisible}) {
  const {refetchSubscriptionData} = useContext(HerritageWalletContext);
  const {setError, setSuccess} = useContext(AppStateContext);

  const {getDepositInWei} = useConvertDepositToWei();

  const handleFormSubmit = async (vals, actions) => {
    try {
      const depositAmountInWEI = await getDepositInWei(vals);

      await writeAsync({
        value: depositAmountInWEI,
      });

      setSuccess({
        message: 'Registration successful!',
      });

      refetchSubscriptionData();
    } catch (e) {
      log.error(e);
      setError({
        message: 'Something went wrong during register, please try again.',
        isModalVisible: true,
      });
      return {error: e};
    }
  };

  const {address, abi} = useHeritageWalletContract();

  const {
    writeAsync,
    isSuccess: registerSubscriberIsSuccess,
    isLoading,
  } = useContractWrite({
    abi,
    address,
    functionName: 'registerSubscriber',
  });

  return (
    <PortalWithModal visible={visible} onDismiss={() => setVisible(false)}>
      <SubscribeView
        handleFormSubmit={handleFormSubmit}
        isLoading={isLoading}
      />
    </PortalWithModal>
  );
}
