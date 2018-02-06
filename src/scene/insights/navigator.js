
import React, { Component } from 'react';
import { StackNavigator } from 'react-navigation';
import Insights from './component/insights';
import Person from '../people/component/person';
import DrawerLabel from '../../navigator/drawer-label';
import CustomDrawerIcon from '../../navigator/custom-drawer-icon';

const InsightsNavigator = StackNavigator({
  Insights: {
    screen: Insights, 
  },
  PeoplePerson: {
    screen: Person
  }
}, {
  navigationOptions: ({navigation, screenProps}) => {
    return {
      drawerLabel: ({ focused, tintColor }) => (<DrawerLabel focused={focused} color={tintColor} label={'Insights Menu Label'} />),
      drawerIcon : ({ focused, tintColor }) => (<CustomDrawerIcon name="eye" color={tintColor} />),
      style : ({ width: 300 }) 
    };
  }
});

export default InsightsNavigator;
