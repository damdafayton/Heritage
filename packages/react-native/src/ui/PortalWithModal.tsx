import {Portal as PortalRN, useTheme} from 'react-native-paper';
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
  const {isModalVisible, errors, successes} = appStateContextData;

  const theme = useTheme();

  const containerStyle = {
    backgroundColor: theme.colors.background,
    padding: 20,
  };

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
            {isModalVisible && (
              <>
                <ErrorSnackbar errors={errors} />
                <SuccessSnackbar successes={successes} />
              </>
            )}
            {children}
          </Modal>
        </HerritageWalletContext.Provider>
      </AppStateContext.Provider>
    </PortalRN>
  );
}
