import {useTheme} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialIcons';

import {Banner} from '../ui/Banner';

export function ErrorBanner({style = {}, ...props}) {
  const theme = useTheme();

  return (
    <Banner
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
      style={[
        {marginBottom: 16, backgroundColor: theme.colors.background},
        style,
      ]}
      {...props}>
      {props.children}
    </Banner>
  );
}
