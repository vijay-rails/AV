import React from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { default as Theme } from '../lib/theme';

export function DefaultNavigationOptions({ navigation }) {
  return {
    headerTitle: navigation.state.routeName,
    headerLeft: (<Icon.Button 
      name={'menu'} 
      size={22} 
      color={Theme.Colours.white} 
      backgroundColor={'rgba(127,127,127,0)'} 
      iconStyle={{marginLeft: 10}}
      borderRadius={0}
      onPress={() => {
        navigation.navigate('DrawerOpen');
      }}
    />),
    headerTitleStyle : {
      color: Theme.Colours.white,
    },
    headerStyle: {
      backgroundColor: Theme.Brand.primary,
    },
  };
};

export function PageNavigationOptions({ navigation }) {
  return {
    headerTitle: navigation.state.params.getTitle(),
    headerLeft: null,
	  headerRight: (<Icon.Button 
	    name={'close'} 
	    size={22} 
	    color={Theme.Colours.buttons.primary}
	    backgroundColor={'rgba(127,127,127,0)'} 
	    iconStyle={{marginLeft: 10}}
	    borderRadius={0}
	    onPress={() => {
	      navigation.goBack();
	    }}
	  />)
  };
};