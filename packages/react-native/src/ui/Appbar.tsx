import {useNavigation} from '@react-navigation/native';
import {Appbar as AppbarUI} from 'react-native-paper';
import {getHeaderTitle} from '@react-navigation/elements';

export function Appbar({route, options}) {
  const navigation = useNavigation();
  const _goBack = () => navigation.goBack();
  const title = getHeaderTitle(options, route?.name);

  return (
    <AppbarUI.Header mode="small">
      <AppbarUI.BackAction onPress={_goBack} />
      <AppbarUI.Content title={title} />
    </AppbarUI.Header>
  );
}
