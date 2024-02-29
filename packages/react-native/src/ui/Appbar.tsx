import {useNavigation, useNavigationState} from '@react-navigation/native';
import {Appbar as AppbarUI} from 'react-native-paper';
import {useEffect, useReducer, useState} from 'react';
import {logger} from '../utils/logger';
const log = logger('Appbar');

export function Appbar() {
  const navigation = useNavigation();
  const {routes, index} = useNavigationState(x => x) || {};

  // const title = getHeaderTitle(options, route?.name);

  const [showBack, setShowBack] = useState(false);

  const handleBackPress = () => {
    navigation.canGoBack() && navigation.goBack();
  };

  const [appBarName, setAppBarName] = useState('');

  useEffect(() => {
    log.debug('state changed');

    if (navigation.canGoBack()) {
      setShowBack(true);
    } else {
      setShowBack(false);
    }

    if (!routes) return;

    let _appBarName;
    const activeRoute = routes[index];
    _appBarName = activeRoute.name;

    log.debug({activeRoute: JSON.stringify(activeRoute)});
    if (activeRoute.state) {
      const {routes: subRoutes, index: subIndex = 0} = activeRoute.state;
      const subActiveRoute = subRoutes[subIndex];
      _appBarName = subActiveRoute.name;
    }

    setAppBarName(_appBarName);
  }, [index, routes?.[index]?.state?.index]);

  return (
    <AppbarUI.Header mode="small">
      {showBack && <AppbarUI.BackAction onPress={handleBackPress} />}
      <AppbarUI.Content title={appBarName} />
    </AppbarUI.Header>
  );
}
