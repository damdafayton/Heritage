import {useContext, useEffect} from 'react';
import {useContractWrite} from 'wagmi';
import {logger} from '../../utils/logger';
const log = logger('Subscribe');

import {SubscribeView} from './SubscribeView';
import {useHeritageWalletContract} from '../../hooks/useHeritageWalletContract';
import {HerritageWalletContext} from '../../context/HerritageWallet.context';
import {useConvertDepositToWei} from '../../forms/hooks/useConvertDepositToWei';
import {Modal, Portal} from '../../ui/Modal';

export function Subscribe({visible, setVisible}) {
  const {refetchSubscriptionData} = useContext(HerritageWalletContext);

  const {getDepositInWei} = useConvertDepositToWei();

  const handleFormSubmit = async (vals, actions) => {
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

  const contextData = useContext(HerritageWalletContext);

  return (
    <Portal>
      {/* Add context to modal because it will be lost with Portal */}
      <HerritageWalletContext.Provider value={contextData}>
        <Modal
          visible={visible}
          onDismiss={() => setVisible(false)}
          contentContainerStyle={containerStyle}>
          <SubscribeView handleFormSubmit={handleFormSubmit} />
        </Modal>
      </HerritageWalletContext.Provider>
    </Portal>
  );
}

const containerStyle = {backgroundColor: 'white', padding: 20};
