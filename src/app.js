if (!__DEV__) {
  global.console.log = () => {};
}

import isEqual from 'lodash.isequal';
import AudienceView from './app/audience-view';
import PropTypes from 'prop-types';
import React, { Component, StyleSheet } from 'react';
import { View, Image, Text, NetInfo, Alert, Platform } from 'react-native';
import { COLOR, ThemeProvider } from 'react-native-material-ui';
import SplashScreen from 'react-native-splash-screen'
import { DrawerItems, DrawerNavigator, StackNavigator } from 'react-navigation';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import LoginNavigator from './scene/login/navigator';
import LogoutNavigator from './scene/logout/navigator';
import DashboardNavigator from './scene/dashboard/navigator';
import InsightsNavigator from './scene/insights/navigator';
import EventNavigator from './scene/event/navigator';
import PeopleNavigator from './scene/people/navigator';
import SimpleDialog from './component/simple-dialog';
import { default as Theme } from './lib/theme';
import SimpleModal from './component/simple-modal';
  
//you can set your style right here, it'll be propagated to application
const uiTheme = {
  palette: {
    primaryColor: Theme.Brand.primary
  }
};

const DrawerItemsContainer = (props) => {
  // separate logout from main items
  mainDrawerProps = {
    ...props,
    navigation: {
      ...props.navigation,
      state: {
        ...props.navigation.state,
        routes: props.navigation.state.routes.slice(0, -1)
      }
    },
    items: props.items.slice(0, -1) 
  };
  
  logoutDrawerProps = {
    ...props,
    navigation: {
      ...props.navigation,
      state: {
        ...props.navigation.state,
        routes: [
          props.navigation.state.routes[props.navigation.state.routes.length - 1]
        ]
      }
    },
    items: [
      props.items[props.items.length - 1]
    ]
  };
                                                                                  
  return (
    <View style={{
      backgroundColor: Theme.Colours.backgrounds.light,
      marginVertical: 0,
      flex: 1,
      flexDirection: 'column'
    }}>
      <View style={{flex: 0.20, justifyContent: 'center' }}>
        {/*<Image source={{uri: Theme.Logo}} style={{flex:1, resizeMode: 'contain'}}/>*/}
        <Theme.CustomIcon name="insight_icon" size={Theme.Fonts.h1} color={Theme.Colours.dark} style={{ textAlign: 'center' }}/>
      </View>
      <View style={{flex: 0.55 }}>
        <DrawerItems {...mainDrawerProps} />
      </View>
      <View style={{flex: 0.20}}>
        <DrawerItems {...logoutDrawerProps} />
      </View>
      <View style={{ paddingVertical: 30 }}>
        {/*<Image source={{uri: Theme.Logo}} style={{flex:1, resizeMode: 'contain'}}/>*/}
        <Theme.CustomIcon name="logo" size={Theme.Fonts.h3} color={Theme.Colours.dark} style={{ textAlign: 'center' }}/>
      </View>
    </View>
  );
};

export default class AudienceViewInsightsNative extends Component {
 
  static childContextTypes = {
    app: PropTypes.object.isRequired
  }
 
  constructor(props) {
    super(props);
    
    this.onLocationPermissionGranted = this.onLocationPermissionGranted.bind(this);
    
    // we need to trigger authentication
    this.state = {
      auth: false, // set to null when oauth is re-integrated
      authenticating: false,
      location: null,
      modal: false,
      user: null,
    };
    
    this._avApp = new AudienceView(this);

    this._avApp.isAuthorized()
    .then( result => {
      console.log('--- oAuthManager result', result);
      if (result.status === 'OK') {
        this.setState({
          auth: true,
          authenticating: false,
          user: {
            ...result.data
          }
        });
      }
      else {
        this.setState({
          auth: false,
          authenticating: false,
          user: null,
        });
      }
    })
    .catch( err => {
      console.log('--- oAuthManager error', err);
      this.setState({
        auth: false,
        authenticating: false,
        user: null
      });
    });
    
    this.mainNavigator = DrawerNavigator({
  	  InsightsNavigator: {
	      screen: InsightsNavigator
	    },
  	  DashboardNavigator: {
	      screen: DashboardNavigator,
	    },
  	  PeopleNavigator: {
	      screen: PeopleNavigator,
	    },
  	  EventNavigator: {
	      screen: EventNavigator,
	    },
  	  LogoutNavigator: {
	      screen: LogoutNavigator,
	    },
  	}, {
	    contentComponent: DrawerItemsContainer,
	    contentOptions: {
  	    activeBackgroundColor: '#f1f1f1',
	      inactiveBackgroundColor: Theme.Colours.backgrounds.light,
	      activeTintColor: Theme.Brand.primary,
	      inactiveTintColor: Theme.Brand.primary,
  	  }
	  });
  }

  getChildContext() {
    return {
      app: this._avApp 
    };
  }
  
  onLocationPermissionGranted() {
	  console.log(' --- checking current location permission --- ');
	
    navigator.geolocation.getCurrentPosition( position => {
      console.log('--- GPS POS ---', position);
      this.setState({
    	location: position
      });
    }, error => {
      console.log('--- GPS ERROR ---', error);
      this.setState({
      	location: null
      }, () => {
       	Alert.alert('Location Error', 'Location Services Are Disabled, Please Enable.', [], { 
          cancelable: true 
        });
      });
    }, {
      // enableHighAccuracy: false, 
      timeout: 60000, 
      // maximumAge: 30000
    });
    
    /*
    this._geoWatchID = navigator.geolocation.watchPosition( position => {
    	console.log('--- GPS WATCH ---', position);
      if (!isEqual(this.state.location, position)) {
	    this.setState({
	      location: position
	    });
      }
    });
    */
  }
  
  componentWillMount() {
  	this._avApp.connect('permission-location-granted', this.onLocationPermissionGranted)
  	// this._avApp.connect('permission-storage-granted', this._avApp.onStoragePermissionGranted)
	
    NetInfo.isConnected.addEventListener('connectionChange', this._avApp.onNetworkChange);
    NetInfo.isConnected.fetch().then(this._avApp.onNetworkChange);
  }
  
  componentDidMount() {
    SplashScreen.hide();

    if (Platform.OS == 'android') {
      this._avApp.checkAndRequestLocationPermission();
      this._avApp.checkAndRequestStoragePermission();
    }
  }

  componentWillUnmount() {
	this._avApp.disconnect('permission-location-granted', this.onLocationPermissionGranted)
	  // this._avApp.disconnect('permission-storage-granted', this._avApp.onStoragePermissionGranted)
	  
    NetInfo.isConnected.removeEventListener('change', this._avApp.onNetworkChange);
    // navigator.geolocation.clearWatch(this._geoWatchID);
  }
  
  renderLogin() {
    return (
      <LoginNavigator screenProps={this.state} />
    );
  }

  renderNavigation() {
    const MainDrawerNavigator = this.mainNavigator;
    
    return (
      <MainDrawerNavigator ref="navigation" />
    );
  }
  
  renderModal() {
    if (this.state.modal === false) {
      return null;
    }
    return this.state.modal;
  }
  
  renderUser() {
    if (this.state.auth === false) {
      return (
        <View style={{ flex: 1 }}>
          {this.renderLogin()}
          {this.renderModal()}
        </View>
      );
    }
    else if (this.state.auth === true) {
      return (
        <View style={{ flex: 1 }}>
          {this.renderNavigation()}
          {this.renderModal()}
        </View>
      );
    }
  }

  render() {
    return (
      <ThemeProvider uiTheme={uiTheme}>
        {this.renderUser()}
      </ThemeProvider>
    );
  }
}
