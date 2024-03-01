import 'react';

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useTheme} from 'react-native-paper';
import {createMaterialBottomTabNavigator} from 'react-native-paper/react-navigation';

import {logger} from '../utils/logger';
const log = logger('Tabs');

import {MenuType} from '../typings/config';
import {Contract} from '../pages/Contract';
import {Home} from '../pages/Home';
import {HerritageWalletContext} from '../context/HerritageWallet.context';
import {useContext} from 'react';

export function Tabs() {
  const theme = useTheme();

  const Tab = createMaterialBottomTabNavigator();
  const isConnected = useContext(HerritageWalletContext);

  return (
    <Tab.Navigator
      barStyle={{marginHorizontal: -20}}
      style={{
        paddingHorizontal: 20,
        paddingTop: 10,
        backgroundColor: theme.colors.background,
      }}
      screenListeners={{
        state: e => {
          // updateAppBar();
        },
      }}
      initialRouteName={MenuType.HOME}
      screenOptions={
        {
          //@ts-ignore
          // header: props => <Appbar {...props} />,
        }
      }>
      <Tab.Screen
        name={MenuType.HOME}
        component={Home}
        options={{
          tabBarLabel: MenuType.HOME,
          tabBarIcon: ({color}) => (
            <MaterialCommunityIcons name="home" color={color} size={24} />
          ),
        }}
      />
      {isConnected && (
        <>
          <Tab.Screen
            name={MenuType.CONTRACT}
            component={Contract}
            options={{
              tabBarLabel: MenuType.CONTRACT,
              tabBarIcon: ({color}) => (
                <MaterialCommunityIcons name="bell" color={color} size={24} />
              ),
            }}
          />
        </>
      )}
    </Tab.Navigator>
  );
}
