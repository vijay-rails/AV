
import React from 'react';
import { StackNavigator } from 'react-navigation';
import People from './component/people';
import Person from './component/person';
import Event from '../event/component/event';
import DrawerLabel from '../../navigator/drawer-label';
import DrawerIcon from '../../navigator/drawer-icon';

const PeopleNavigator = StackNavigator({
  People: {
    screen: People,
  },
  PeoplePerson: {
    screen: Person
  },
  PersonEventsEvent: {
    screen: Event
  }
}, {
  navigationOptions: ({navigation, screenProps}) => {
    return {
      drawerLabel: ({ focused, tintColor }) => (<DrawerLabel focused={focused} color={tintColor} label={'People Menu Label'} />),
      drawerIcon : ({ focused, tintColor }) => (<DrawerIcon name="person" color={tintColor} />),
    };
  }
});

export default PeopleNavigator;