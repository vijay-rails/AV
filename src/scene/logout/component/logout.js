import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {
  View,
  Alert,
  StyleSheet,
  Platform, 
  UIManager, 
  LayoutAnimation
} from 'react-native';

import BackgroundImage from '../../../component/background-image';
import SimpleActivityIndicator from '../../../component/simple-activity-indicator';
import { default as Theme } from '../../../lib/theme';
// import ImageTile from '../../../component/image-tile';

export default class Logout extends Component {

  static contextTypes = {
    app: PropTypes.object.isRequired
  }

  componentDidMount() {
    const text = this.context.app.getRegistryConfigValue('Registry::Insights::Scene::Logout', 'Confirmation Text');
    const title = this.context.app.getRegistryConfigValue('Registry::Insights::Scene::Logout', 'Confirmation Title');
    
    Alert.alert(
      title,
      text,
      [{
        text: 'OK', 
        onPress: () => {
          this.context.app.trackScreenView('Logout');  
          this.context.app.onLogout();
        }
      }, {
        text: 'Cancel',
        onPress: () => {
          this.props.navigation.goBack('LogoutNavigator');
        }
      }],
      { 
        cancelable: true,
	    onDismiss: () => {
          this.props.navigation.goBack('LogoutNavigator');
		}
	  }
    );
  }

  componentWillUnmount() {
	LayoutAnimation.configureNext(Theme.Animation.spring);
  }
  
  render() {
    return (
      <BackgroundImage
		source={require('../../../res/img/login-bg.png')}
		// style={[styles.image, this.props.style ]}
      >
	  <View style={styles.container}>
		{/*}<ImageTile 
			source={require('../../../res/img/background.png')} 
			imageWidth={200} 
			imageHeight={200}
		>{*/}
		<SimpleActivityIndicator animating />
		{/*}</ImageTile>{*/}
	  </View>
	</BackgroundImage>
    );
  }
}
  
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
});
