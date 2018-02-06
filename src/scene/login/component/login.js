import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  LayoutAnimation,
  UIManager,
  Platform,
  Keyboard,
  Alert,
  ActivityIndicator
} from 'react-native';

import KeyboardSpacer from 'react-native-keyboard-spacer';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Animatable from 'react-native-animatable';
import { Button } from 'react-native-material-ui';
import SimpleDialog from '../../../component/simple-dialog';
import ImageTile from '../../../component/image-tile';
import BackgroundImage from '../../../component/background-image';
import UrlTextInput from '../../../component/url-text-input';
import UsernameTextInput from '../../../component/username-text-input';
import PasswordTextInput from '../../../component/password-text-input';
import { default as Theme } from '../../../lib/theme';
import ForgotPasswordDialog from './forgot-password-dialog';
import ChangePasswordDialog from './change-password-dialog';
import LoginDialog from './login-dialog';
import ServerDialog from './server-dialog';

const AnimatedIcon = Animatable.createAnimatableComponent(Icon);

const CustomLayoutAnimation = {
  duration: 450,
  create: {
    type: LayoutAnimation.Types.easeInEaseOut,
    property: LayoutAnimation.Properties.scaleXY,
  },
  update: {
    type: LayoutAnimation.Types.easeInEaseOut,
    property: LayoutAnimation.Properties.scaleXY,
  },
};

const LoggedInAnimation = {
  duration: 250,
  delete: {
    type: LayoutAnimation.Types.linear,
    property: LayoutAnimation.Properties.opacity,
  },
};

export default class Login extends Component {

  static contextTypes = {
    app: PropTypes.object.isRequired
  }

  constructor(props, context) {
    super(props, context);
    
    this._mountAnimation = this._mountAnimation.bind(this);
    this._keyboardDidShow = this._keyboardDidShow.bind(this);
    this._keyboardDidHide = this._keyboardDidHide.bind(this);
    this.doLogin = this.doLogin.bind(this);
    this.checkServer = this.checkServer.bind(this);
    this.previousServerUrl = null;
    
    this.state = {
      keyboardVisible: false,
      forgotPassword: false,
      changePassword: false,
      animationSequenceIndex: 0,
      authenticating: props.screenProps.authenticating,
      authenticated: false,
      authentication: null,
      user: {
        firstName: null
      },
      serverSet: false,
      serverChecking: false,
      serverUrl: null,
      serverChange: false,
    }
    
    if (Platform.OS === 'android') {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
    
    this._loginButtonPressed = false;
    this._alertOptions = {
      OK: {
        text: 'OK',
        onPress: () => {
          this._loginButtonPressed = false;
        }
      }
    }
    
    context.app.getServers().then( data => { 
      console.log('--- getServers data', data);
      
      if (data.hasOwnProperty('url') && data.url && data.url.length > 0) {
        const url = data.protocol + '//' + data.url;
        
        context.app.checkServer(url)
        .then( res => {
          console.log('--- getServers', res);
          this.previousServerUrl = url;
          this.setState({
            serverUrl: url,
            serverSet: true 
          });
        })
        .catch(error => {
          console.log('--- getServers Error', error);
          if (error.hasOwnProperty('message')) {
            Alert.alert('Server Error', error.message, [{
              OK: {
			    text: 'OK',
			    ...props
			  }
			}], { 
              cancelable: true 
            });
            this.previousServerUrl = url;
            this.setState({
              serverUrl: url,
              serverSet: false 
            });
          }
          else if (error && error.hasOwnProperty('status') && error.status === '99') {
          this.previousServerUrl = url;
            this.setState({
              serverUrl: url,
              serverSet: true 
            });
          }
        });
      } 
    });
  }
  
  componentWillMount () {
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
  }
  
  componentWillReceiveProps(nextProps) {
    if (nextProps.authenticating !== this.state.authenticating) {
      this.setState({
        authenticating: nextProps.screenProps.authenticating,
        user: {
          ...nextProps.screenProps.user
        },
      });
    } 
  }
  
  componentDidMount() {
    this.context.app.trackScreenView('Login');
    setTimeout(this._mountAnimation, 1650);
  }
  
  componentWillUpdate(nextProps, nextState) {
    // LayoutAnimation.configureNext(CustomLayoutAnimation);
    if (!nextState.authenticating && this.state.authenticating) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    }
  }
  
  componentDidUpdate(prevProps, prevState) {
    if (!prevState.authenticated && this.state.authenticated) {
      setTimeout(() => {
          LayoutAnimation.configureNext(LoggedInAnimation);
      }, 650);
    }
  }
  
  componentWillUnmount () {
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
  }

  _mountAnimation() {
    LayoutAnimation.configureNext(CustomLayoutAnimation);
    // LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    this.setState({
      animationSequenceIndex: 1
    });
  }

  _keyboardDidShow () {
    // LayoutAnimation.configureNext(CustomLayoutAnimation);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    this.setState({
      keyboardVisible: true,
      animationSequenceIndex: 2
    });
  }

  _keyboardDidHide () {
    // LayoutAnimation.configureNext(CustomLayoutAnimation);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    this.setState({
      keyboardVisible: false,
      animationSequenceIndex: 1,
    });
  }

  doLogin() {

    if (this._loginButtonPressed) {
      return;
    }
    this._loginButtonPressed = true;
    
    const username = this.refs.login.username();
    const password = this.refs.login.password();
    
    if (!this.state.serverSet) {
      Alert.alert(
        'Invalid Server',
        'Server Address is not valid.',
        [this._alertOptions.OK],
        { cancelable: false }
      );
    }
    else if (username === null || username.length == 0) {
      Alert.alert(
        'Missing Username',
        'Username is required',
        [this._alertOptions.OK],
        { cancelable: false }
      );
    }
    else if (password === null || password.length == 0) {
      Alert.alert(
        'Missing Password',
        'Password is required',
        [this._alertOptions.OK],
        { cancelable: false }
      );
    }
    else {
      this.context.app.doAuthentication(username, password)
      .then( response => {
    	  this._loginButtonPressed = false;
          this.setState({
              authenticated: true,
              authentication: {
              	server: this.state.serverUrl,
              	data: response,
              },
              user: response.data
          });
      })
      .catch( error => {
    	  this._loginButtonPressed = false;
      });
    }
  }

  checkServer() {

    let server = this.state.serverUrl.trim();

    if (server === null || server.length == 0) {
      Alert.alert(
        'Missing Server',
        'Server Address is required',
        [this._alertOptions.OK],
        { cancelable: false }
      );
    }
    else {
      this.setState({
        serverSet: false,
        serverChecking: true,
      }, () => {
        this.context.app.checkServer(server)
        .then( data => { 
        
          console.log('--- checkserver', data);
          if (data.hasOwnProperty('result') && data.result.status === '0') {
            this.setState({
              serverSet: true,
              serverChecking: false
            });
          }
          else {
            this.setState({
              serverSet: false,
              serverChecking: false
            });
          }
        })
        .catch( error => {
          console.log('--- checkserver error', error);
          if (error.hasOwnProperty('message')) {
            Alert.alert('Server Error', error.message, [this._alertOptions.OK], { cancelable: true });
          }
          else {
            Alert.alert('Network Error', 'Unable to Connect', [this._alertOptions.OK], { cancelable: true }); 
	      }
          this.setState({
            serverSet: false,
            serverChecking: false
          });
	    });
      });
    }
  }
  
  renderAuthorizing() {
    if (!this.state.authenticating) {
      return null;
    }
    
    return (
      <SimpleDialog visible>
        <View style={{ alignSelf: 'center' }}>
          <View style={{ flexDirection: 'row' }} >
            <AnimatedIcon name={'security'} size={36} color={Theme.Brand.primary} style={{ alignSelf: 'center' }} animation="pulse" easing="ease-out" iterationCount="infinite" />
            <Text style={{ alignSelf: 'center' }}>Authorizing...</Text>
          </View>
        </View>
      </SimpleDialog>
    );
  }
  
  renderLogo() {  
    if (this.state.keyboardVisible) {
    	return null; 
    }
    
	const logoWrapper = animationSequences[this.state.animationSequenceIndex].logoWrapper;
	const logoStyle = animationSequences[this.state.animationSequenceIndex].logoStyle;

    return (
      <View style={[logoWrapper]}>
        <Theme.CustomIcon name="logo" size={32} color={Theme.Colours.white} style={logoStyle} />
      </View>
    );
  }
  
  successIcon = () => (<Icon name={'check'} size={22} color={Theme.Colours.green} style={{ alignSelf: 'center' }} />)
  
  errorIcon = () => (<Icon name={'close'} size={22} color="red" style={{ alignSelf: 'center' }} />)
  
  checkIcon = () => (<ActivityIndicator animating color={Theme.Colours.cardItemBackground_White} size="small" />)

  renderChangePassword() {
    return (
    <ChangePasswordDialog
      onCancel={() => {
        this.setState({
          forgotPassword: false,
          changePassword: false,
        });
      }}
      onPressVoid={() => {
        this.setState({
          forgotPassword: false,
          changePassword: false,
        });
      }}
      onUpdate={(res) => {
        // show success dialog then hide
        alert('updated');
      }}
    />
    );
  }
  
  renderForgotPassword() {
    return (
      <ForgotPasswordDialog
        onCancel={() => {
          this.setState({
            forgotPassword: false,
            changePassword: false,
          });
        }}
        onPressVoid={() => {
          this.setState({
            forgotPassword: false,
            changePassword: false,
          });
        }}
        onReset={() => {
          this.setState({
            forgotPassword: false,
            changePassword: true
          });
        }}
      />
    );
  }
  
  renderServer() {
	return (
	  <ServerDialog
	    placeholder="Server Address"
        serverUrl={this.state.serverUrl}
        serverChange={this.state.serverChange}
        enabled={this.state.serverUrl !== null && this.state.serverUrl.length > 0}
        onCancel={() => {
          this.setState({
            serverUrl: this.previousServerUrl,
            serverSet: true,
            serverChecking: false,
            serverChange: false,
          });
        }}
        onChangeServerUrl={ text => { 
          this.setState({ 
            serverUrl: text,
            enabled: true
          });
        }}
	    checkServer={this.checkServer}
	  />
	);
  }

  isEnabled(text) {

    if(text !== this.state.serverUrlOriginal) {
      return true
    } 

    return false
  }
  
  renderUser() {
    let serverIcon = null;
    if (this.state.serverChecking) {
      serverIcon = this.checkIcon();
    }
    //else if (this.state.serverSet) {
    //  //serverIcon = this.successIcon();
    //}
    else {
      //serverIcon = this.errorIcon();
      serverIcon = null;
    }

    return (
      <LoginDialog
        ref="login"
        serverUrl={this.state.serverUrl} 
        serverStatusIcon={serverIcon}
        enabled={!this.state.serverChecking && this.state.serverSet}
        changeServer={() => {
          this.setState({
            serverSet: false,
            serverChecking: false,
            serverChange: true,
          });
        }}
        login={this.doLogin}
        forgotPassword={() => {
          this.setState({
            forgotPassword: true,
            changePassword: false,
          });
        }} 
      />


    );
  }
  
  renderLogin() {
    const appLogoWrapper = animationSequences[this.state.animationSequenceIndex].appLogoWrapper;
    const formWrapper = animationSequences[this.state.animationSequenceIndex].formWrapper;
    
    let content = null;
    if (this.state.forgotPassword) {
      content = this.renderForgotPassword();
    }
    else if (this.state.changePassword) {
      content = this.renderChangePassword();
    }
    else if (!this.state.serverSet && !this.state.serverChecking) {
      content = this.renderServer();
    }
    else {
      content = this.renderUser();
    }
    
    return (
      <View style={[styles.viewWrapper]} >
        <View style={formWrapper}>
          <View style={[appLogoWrapper]}>
            <Theme.CustomIcon name="insight_icon" size={48} color={Theme.Colours.white} style={{ textAlign: 'center', backgroundColor: 'transparent' }} />
          </View>
          {content}
        </View>
        {this.renderLogo()}
        {this.renderAuthorizing()}
      </View>
    );
  }
  
  renderSpacer() {    
    if (Platform.OS === 'android') {
      return null;
    }
    return (<KeyboardSpacer />);
  }
  
  render() {
    return (
    <BackgroundImage
      source={require('../../../res/img/login-bg.png')}
      // style={[styles.image, this.props.style ]}
    >
      <View style={styles.container}>
        {this.renderLogin()}
        <SimpleDialog visible={this.state.authenticated}>
          <View style={{ alignSelf: 'center' }}>
            <Icon name={'done'} size={36} color={Theme.Colours.green} style={{ alignSelf: 'center' }} />
            <View style={{ alignSelf: 'center' }}>
              <Text>Welcome {this.state.user.firstName}</Text>
            </View>
          </View>
        </SimpleDialog>
        {this.renderSpacer()}
      </View>
    </BackgroundImage>
    );
  }
}

  
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    // alignItems: 'center',
  },
  viewWrapper: {
    flex: 1,
    flexDirection: 'column',
    // backgroundColor: Theme.Colours.backgrounds.dark,
  },
  appLogoInitial: {
    flexDirection: 'column', flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 20
  },
  logoInitial: {
    textAlign: 'center',
    backgroundColor: 'transparent'
  },
  logoWrapperInitial: {
    flex: 1,
    // flexGrow: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  formWrapperInitial: {
    flex: 0.0001,
    flexDirection: 'column',
    opacity: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appLogoDefault: {
    flexDirection: 'column', flex: 1, justifyContent: 'flex-start', alignItems: 'center', marginTop: 20
  },
  logoDefault: {
    textAlign: 'center',
    backgroundColor: 'transparent'
  },
  logoWrapperDefault: {
    flexDirection: 'column',
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center'
  },
  formWrapperDefault: {
    flex: 1,
    flexDirection: 'column',
    opacity: 1,
    // alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  appLogoKeyboard: {
    flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginTop: 20
  },
  logoKeyboard: {
    textAlign: 'center',
    backgroundColor: 'transparent'
  },
  logoWrapperKeyboard: {
    // flex: 1,
    // flexGrow: 1,
    flexDirection: 'column',
    paddingHorizontal: 20,
    height: 0,
  },
  formWrapperKeyboard: {
    flex: 1,
    flexDirection: 'column',
    opacity: 1,
    // alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
});


const animationSequences = [{
    appLogoWrapper: styles.appLogoInitial,
    logoStyle: styles.logoInitial, 
    logoWrapper: styles.logoWrapperInitial,
    formWrapper: styles.formWrapperInitial,
  }, {
    appLogoWrapper: styles.appLogoDefault,
    logoStyle: styles.logoDefault,
    logoWrapper: styles.logoWrapperDefault,
    formWrapper: styles.formWrapperDefault,
  }, {
    appLogoWrapper: styles.appLogoKeyboard,
    logoStyle: styles.logoKeyboard,
    logoWrapper: styles.logoWrapperKeyboard,
    formWrapper: styles.formWrapperKeyboard      
  }];