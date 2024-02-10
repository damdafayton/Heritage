import {useNavigation} from '@react-navigation/native';
import {Appbar as AppbarUI} from 'react-native-paper';
import {getHeaderTitle} from '@react-navigation/elements';
import {useEffect, useState} from 'react';

export function Appbar() {
  const navigation = useNavigation();
  const navState = navigation.getState();

  console.log('appbar-state:', navigation.getState());

  // const title = getHeaderTitle(options, route?.name);

  const [showBack, setShowBack] = useState(false);

  const handleBackPress = () => {
    navigation.canGoBack() && navigation.goBack();
  };

  const [appBarName, setAppBarName] = useState('');

  useEffect(() => {
    const {routes, index} = navState || {};

    if (!routes) return;

    let _appBarName;
    const activeRoute = routes[index];
    _appBarName = activeRoute.name;

    console.log({activeRoute: JSON.stringify(activeRoute)});
    if (activeRoute.state) {
      const {routes: subRoutes, index: subIndex = 0} = activeRoute.state;
      const subActiveRoute = subRoutes[subIndex];
      _appBarName = subActiveRoute.name;
    }

    setAppBarName(_appBarName);
  }, []);

  useEffect(() => {
    if (navigation.canGoBack()) {
      setShowBack(true);
    } else {
      setShowBack(false);
    }
  }, []);

  return (
    <AppbarUI.Header mode="small">
      {showBack && <AppbarUI.BackAction onPress={handleBackPress} />}
      <AppbarUI.Content title={appBarName} />
    </AppbarUI.Header>
  );
}
