
import React from 'react';
import { StackNavigator } from 'react-navigation';
import Logout from './component/logout';
import DrawerLabel from '../../navigator/drawer-label';
import CustomDrawerIcon from '../../navigator/custom-drawer-icon';

const LogoutNavigator = StackNavigator({
  Logout: {
    screen: Logout,
  }
}, {
  headerMode: 'none',
  navigationOptions: ({navigation, screenProps}) => {
    return {
      drawerLabel: ({ focused, tintColor }) => (<DrawerLabel focused={focused} color={tintColor} label={'Logout Menu Label'} />),
      drawerIcon : ({ focused, tintColor }) => (<CustomDrawerIcon name="logout-variant" color={tintColor} />),
    };
  }
});

export default LogoutNavigator;