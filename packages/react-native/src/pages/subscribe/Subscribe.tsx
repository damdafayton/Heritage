import {useContext, useEffect} from 'react';
import {useContractWrite} from 'wagmi';
import {logger} from '../../utils/logger';
const log = logger('Subscribe');

import {SubscribeView} from './SubscribeView';
import {useHeritageWalletContract} from '../../hooks/useHeritageWalletContract';
import {HerritageWalletContext} from '../../context/HerritageWallet.context';
import {useConvertDepositToWei} from '../../forms/hooks/useConvertDepositToWei';
import {PortalWithModal} from '../../ui/PortalWithModal';
import {AppStateContext} from '../../context/AppState.context';

export function Subscribe({visible, setVisible}) {
  const {refetchSubscriptionData} = useContext(HerritageWalletContext);
  const {setErrors} = useContext(AppStateContext);

  const {getDepositInWei} = useConvertDepositToWei();

  const handleFormSubmit = async (vals, actions) => {
    try {
      const depositAmountInWEI = await getDepositInWei(vals);

      await writeAsync({
        value: depositAmountInWEI,
      });
    } catch (e) {
      log.error(e);
      setErrors({
        errors: ['Something went wrong, please try again.'],
        modalError: true,
      });
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

  return (
    <PortalWithModal visible={visible} onDismiss={() => setVisible(false)}>
      <SubscribeView handleFormSubmit={handleFormSubmit} />
    </PortalWithModal>
  );
}
