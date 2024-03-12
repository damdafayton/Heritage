import MaterialCommunityIcons from 'react-native-vector-icons/MaterialIcons';

import {Banner} from '../ui/Banner';
import {useTheme} from 'react-native-paper';

export function ErrorBanner(props) {
  const theme = useTheme();

  return (
    <Banner
      style={{marginBottom: 16}}
      actions={[
        {
          label: 'Dismiss',
          onPress: props.onPressDismiss,
        },
      ]}
      icon={({size}) => (
        <MaterialCommunityIcons
          name="warning"
          size={size}
          color={theme.colors.error}
        />
      )}
      {...props}>
      {props.children}
    </Banner>
  );
}
