import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { 
  StyleSheet, View, Text, TextInput, TouchableHighlight 
} from 'react-native';
import { Button } from 'react-native-material-ui';
import SimpleDialog from '../../../component/simple-dialog';
import { default as Theme } from '../../../lib/theme';
import UsernameTextInput from '../../../component/username-text-input';
import PasswordTextInput from '../../../component/password-text-input';

import Icon from 'react-native-vector-icons/MaterialIcons';

const ICON_SIZE = Theme.Fonts.h4;

export default class LoginDialog extends Component {

  static contextTypes = {
    app: PropTypes.object.isRequired
  }
  
  static propTypes = {
    onPressVoid: PropTypes.func,
    serverUrl: PropTypes.string,
    serverStatusIcon: PropTypes.node,
    changeServer: PropTypes.func,
    login: PropTypes.func,
    enabled: PropTypes.bool,
    forgotPassword: PropTypes.func
  }

  static defaultProps = {
    onPressVoid: () => {}, 
    changeServer: () => {
      this.setState({ 
        serverChange: true,
      })
    }, 
    login: () => {}, 
    forgotPassword: () => {}, 
    enabled: false
  }

  static styles = StyleSheet.create({
  
  });
  
  state = {
  }
  
  username = () => this.refs.username.value()
  
  password = () => this.refs.password.value()
  
  render() {
    const inputHeight = 50; // this.state.keyboardVisible ? 50 : 60;
    
    return (
      <SimpleDialog 
        visible 
        onPressVoid={this.props.onPressVoid}
        overlayStyle={{ backgroundColor: 'transparent' }}
        style={{paddingTop: 15}}>
        
        <View style={Theme.Styles.column}>

          <View style={Theme.Styles.row}>
            <View style={styles.dialogHead}>
              <View style={{ left: 0 }}>
                <Text style={[ Theme.Styles.textLarge, { color: Theme.Colours.black } ]}>LOGIN</Text>
              </View>

              <View style={{ right: 30, position: 'absolute', top: 0 }}>
                {this.props.serverStatusIcon}
              </View>

              <View style={{ right: 0, justifyContent: 'flex-end'}}>
              
                <Icon
                  name={'settings'} 
                  size={ICON_SIZE} 
                  ref={this.onRef}
                  color={Theme.Colours.primary} 
                  backgroundColor={'transparent'} 
                  // iconStyle={{paddingBottom: 10, right: 0, width: 90, position: 'absolute'}}
                  borderRadius={0}
                  onPress={this.props.changeServer}
                />
              </View>
          </View>
        </View>
          <View >
            <UsernameTextInput
              ref="username"
              style={[Theme.Styles.textLarge, {color: '#333', height: inputHeight, borderBottomWidth: 2, borderBottomColor: Theme.Brand.primary }]}
              textAlignVertical={'bottom'}
              placeholder="Username"
              placeholderTextColor={"#ccc"}
              returnKeyType="next"
            />
            <PasswordTextInput
              ref="password"
              style={[Theme.Styles.textLarge, {color: '#333',height: inputHeight, borderBottomWidth: 2, borderBottomColor: Theme.Brand.primary }]}
              textAlignVertical={'bottom'}
              placeholder="Password"
              placeholderTextColor={"#ccc"}
              returnKeyType="done"
            />
          </View>
        </View>
        <View style={[Theme.Styles.row, { paddingTop: 30 } ]}>
          <View style={[Theme.Styles.f1]}>
            <TouchableHighlight 
              style={{ justifyContent: 'flex-start', paddingLeft: 0, paddingVertical: 10 }} >
                <Text onPress={this.props.forgotPassword} style={{color: Theme.Brand.primaryDark}}>FORGOT PASSWORD</Text>
            </TouchableHighlight>
          </View>
          <View>
          <Button raised primary disabled={!this.props.enabled} text="Login" onPress={this.props.login} />
          </View>
        </View>
      </SimpleDialog>
    );
  }
}

const styles = StyleSheet.create({
  dialogHead: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 20
  }
});