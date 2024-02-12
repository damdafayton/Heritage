import {Portal as PortalRN} from 'react-native-paper';
import {useContext} from 'react';

import {HerritageWalletContext} from '../context/HerritageWallet.context';
import {Modal} from './Modal';
import {AppStateContext} from '../context/AppState.context';
import {logger} from '../utils/logger';
import {ErrorSnackbar} from '../molecules/ErrorSnackbar';
import {SuccessSnackbar} from '../molecules/SuccessSnackbar';
const log = logger('PortalWithModal');

export function PortalWithModal({children, visible, onDismiss}) {
  const heritageContextData = useContext(HerritageWalletContext);
  const appStateContextData = useContext(AppStateContext);
  log.debug(appStateContextData);
  return (
    <PortalRN>
      {/* Add context to modal because it will be lost with PortalRN */}
      <AppStateContext.Provider value={appStateContextData}>
        <HerritageWalletContext.Provider value={heritageContextData}>
          <Modal
            visible={visible}
            onDismiss={onDismiss}
            contentContainerStyle={containerStyle}>
            {appStateContextData.isModalVisible && (
              <>
                <ErrorSnackbar />
                <SuccessSnackbar />
              </>
            )}
            {children}
          </Modal>
        </HerritageWalletContext.Provider>
      </AppStateContext.Provider>
    </PortalRN>
  );
}

const containerStyle = {backgroundColor: 'white', padding: 20};
