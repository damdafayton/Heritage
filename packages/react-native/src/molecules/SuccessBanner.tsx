import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useContext} from 'react';

import {Banner} from '../ui/Banner';
import {AppStateContext} from '../context/AppState.context';
import {useTheme} from 'react-native-paper';

export function SuccessBanner() {
  const {successes, clearSuccesses} = useContext(AppStateContext);
  const theme = useTheme();

  return successes.length ? (
    <Banner
      style={{marginBottom: 16}}
      visible={successes.length}
      actions={[
        {
          label: 'Dismiss',
          onPress: clearSuccesses,
        },
      ]}
      icon={({size}) => (
        <MaterialCommunityIcons
          name="warning"
          size={size}
          color={theme.colors.outline}
        />
      )}>
      {successes.join('\n')}
    </Banner>
  ) : (
    <></>
  );
}
