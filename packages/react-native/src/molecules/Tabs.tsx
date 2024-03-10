import 'react';

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useTheme} from 'react-native-paper';
import {createMaterialBottomTabNavigator} from 'react-native-paper/react-navigation';

import {logger} from '../utils/logger';
const log = logger('Tabs');

import {AppMode, MenuType} from '../typings/config';
import {Contract} from '../pages/Contract';
import {Home} from '../pages/Home';
import {HerritageWalletContext} from '../context/HerritageWallet.context';
import {useContext} from 'react';
import {Help} from '../pages/Help';
import {ScrollView} from 'react-native';
import {Text} from '../ui';
import {Settings} from '../pages/Settings';
import {AppStateContext} from '../context/AppState.context';
import {Inheritor} from '../pages/Inheritor';

export const StyledScrollView = ({children, ...props}) => {
  const theme = useTheme();

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={{backgroundColor: theme.colors.background}}
      {...props}>
      {children}
      <Text style={{marginBottom: 24}}>{''}</Text>
    </ScrollView>
  );
};

export function Tabs() {
  const theme = useTheme();

  const Tab = createMaterialBottomTabNavigator();
  const {isConnected} = useContext(HerritageWalletContext);
  const {appMode} = useContext(AppStateContext);

  return (
    <Tab.Navigator
      inactiveColor={theme.colors.onSurface}
      activeColor={theme.colors.onSurface}
      // activeIndicatorStyle={{backgroundColor: theme.colors.primaryContainer}}
      activeIndicatorStyle={{
        backgroundColor: theme.colors.secondaryContainer,
      }}
      // activeColor={theme.colors.primary}
      barStyle={{
        marginHorizontal: -20,
        backgroundColor: theme.colors.inverseOnSurface,
      }}
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
      {appMode === AppMode.INHERITEE ? (
        <>
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
            <Tab.Screen
              component={Contract}
              name={MenuType.CONTRACT}
              options={{
                tabBarLabel: MenuType.CONTRACT,
                tabBarIcon: ({color}) => (
                  <MaterialCommunityIcons name="bell" color={color} size={24} />
                ),
              }}
            />
          )}
        </>
      ) : (
        <Tab.Screen
          name={MenuType.HOME}
          component={Inheritor}
          options={{
            tabBarLabel: MenuType.HOME,
            tabBarIcon: ({color}) => (
              <MaterialCommunityIcons name="home" color={color} size={24} />
            ),
          }}
        />
      )}
      <Tab.Screen
        name={MenuType.HELP}
        options={{
          tabBarLabel: MenuType.HELP,
          tabBarIcon: ({color}) => (
            <MaterialCommunityIcons
              name="account-question"
              color={color}
              size={24}
            />
          ),
        }}>
        {props => (
          <StyledScrollView {...props}>
            <Help />
          </StyledScrollView>
        )}
      </Tab.Screen>
      <Tab.Screen
        name={MenuType.SETTINGS}
        options={{
          tabBarLabel: MenuType.SETTINGS,
          tabBarIcon: ({color}) => (
            <MaterialIcons name="settings" color={color} size={24} />
          ),
        }}>
        {props => (
          <StyledScrollView {...props}>
            <Settings />
          </StyledScrollView>
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
