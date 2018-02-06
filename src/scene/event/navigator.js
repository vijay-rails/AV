
import React from 'react';
import { StackNavigator } from 'react-navigation';
import Events from './component/events';
import Event from './component/event';
import Person from '../people/component/person';
import DrawerLabel from '../../navigator/drawer-label';
import DrawerIcon from '../../navigator/drawer-icon';

const EventNavigator = StackNavigator({
  Events: {
    screen: Events,
  },
  EventsEvent: {
	screen: Event
  },
  EventPeoplePerson: {
    screen: Person
  }
}, {
  navigationOptions: ({navigation, screenProps}) => {
    return {
      drawerLabel: ({ focused, tintColor }) => (<DrawerLabel focused={focused} color={tintColor} label={'Events Menu Label'} />),
      drawerIcon : ({ focused, tintColor }) => (<DrawerIcon name="event" color={tintColor} />),
    };
  }
});

export default EventNavigator;