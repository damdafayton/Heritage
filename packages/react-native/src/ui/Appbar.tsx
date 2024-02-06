import {
  useNavigation,
  useRoute,
  useNavigationState,
} from '@react-navigation/native';
import {Appbar as AppbarUI} from 'react-native-paper';
import {getHeaderTitle} from '@react-navigation/elements';
import {useEffect, useState} from 'react';

export function Appbar({title}) {
  const navigation = useNavigation();

  const _goBack = () => navigation.canGoBack() && navigation.goBack();
  // const title = getHeaderTitle(options, route?.name);

  const [showBack, setShowBack] = useState(false);

  useEffect(() => {
    if (navigation.canGoBack()) {
      setShowBack(true);
    } else {
      setShowBack(false);
    }
  }, [title]);

  return (
    <AppbarUI.Header mode="small">
      {showBack && <AppbarUI.BackAction onPress={_goBack} />}
      <AppbarUI.Content title={title} />
    </AppbarUI.Header>
  );
}
