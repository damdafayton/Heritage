import {Portal as PortalRN} from 'react-native-paper';
import {useContext} from 'react';

import {HerritageWalletContext} from '../context/HerritageWallet.context';
import {Modal} from './Modal';
import {AppStateContext} from '../context/AppState.context';
import {ErrorBanner} from '../molecules/ErrorBanner';

export function PortalWithModal({children, visible, onDismiss}) {
  const heritageContextData = useContext(HerritageWalletContext);
  const appStateContextData = useContext(AppStateContext);
  console.log('appStateContextData', appStateContextData);
  return (
    <PortalRN>
      {/* Add context to modal because it will be lost with PortalRN */}
      <AppStateContext.Provider value={appStateContextData}>
        <HerritageWalletContext.Provider value={heritageContextData}>
          <Modal
            visible={visible}
            onDismiss={onDismiss}
            contentContainerStyle={containerStyle}>
            {appStateContextData.isModalError && <ErrorBanner />}
            {children}
          </Modal>
        </HerritageWalletContext.Provider>
      </AppStateContext.Provider>
    </PortalRN>
  );
}

const containerStyle = {backgroundColor: 'white', padding: 20};
