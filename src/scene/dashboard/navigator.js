
import React from 'react';
import { StackNavigator } from 'react-navigation';
import { DefaultNavigationOptions } from '../../navigator/headers';
import Dashboard from './component/dashboard';
import DrawerLabel from '../../navigator/drawer-label';
import CustomDrawerIcon from '../../navigator/custom-drawer-icon';

const DashboardNavigator = StackNavigator({
  Dashboard: {
    screen: Dashboard,
  }
}, {
  navigationOptions: ({navigation, screenProps}) => {
    return {
      drawerLabel: ({ focused, tintColor }) => (<DrawerLabel focused={focused} color={tintColor} label={'Dashboards Menu Label'} />),
      drawerIcon : ({ focused, tintColor }) => (<CustomDrawerIcon name="view-dashboard" color={tintColor} />),
    };
  }
});

export default DashboardNavigator;
