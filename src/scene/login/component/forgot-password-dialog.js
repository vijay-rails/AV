import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { 
  StyleSheet, View, Text, TextInput, TouchableHighlight, Platform
} from 'react-native';
import { Button } from 'react-native-material-ui';
import SimpleDialog from '../../../component/simple-dialog';
import UsernameTextInput from '../../../component/username-text-input';
import EmailTextInput from '../../../component/email-text-input';
import { default as Theme } from '../../../lib/theme';

export default class ForgotPasswordDialog extends Component {

  static contextTypes = {
    app: PropTypes.object.isRequired
  }
  
  static propTypes = {
    onPressVoid: PropTypes.func,
    onCancel: PropTypes.func,
    onReset: PropTypes.func,
  }

  static defaultProps = {
    onPressVoid: () => {},
    onCancel: () => {},
    onReset: () => {},
  }

  static styles = StyleSheet.create({
  
  });
  
  state = {
    username: null,
    email: null
  }
  
  componentWillMount() {
    
  }
  
  render() {

    let inputPadding;

    if(Platform.OS === 'android') {
      inputPadding = 0;
      inputPaddingTop = 20;
    } else {
      inputPadding = 15;
      inputPaddingTop = 35;
    }

    return (
      <SimpleDialog 
        visible 
        onPressVoid={this.props.onPressVoid}
        overlayStyle={{ backgroundColor: 'transparent' }}
      >
        <View style={Theme.Styles.column}>
          <Text style={[ Theme.Styles.textLarge, { color: Theme.Colours.black } ]}>FORGOT PASSWORD</Text>
          <Text style={[ Theme.Styles.textSmall, { color: Theme.Colours.dark, marginTop: 15 } ]}>A temporary password will be sent to your email</Text>

          <View style={{ borderBottomWidth: 1, borderBottomColor: Theme.Brand.primary }}>
            <UsernameTextInput 
              ref="username"
              style={[{ borderBottomWidth: 0, lineHeight: 30, paddingLeft: 5,  height: 50,
                        paddingTop: inputPaddingTop, paddingBottom: inputPadding, margin: 0, fontSize: Theme.Fonts.fontLarge }]}
              // autoCapitalize="none"
              // autoCorrect={false}
              // autoFocus={this.props.autoFocus}
              placeholder={"Username"}
              placeholderTextColor={"#ccc"}
              underlineColorAndroid={'transparent'}
              onChangeText={ text => this.setState({ username: text }) }
              returnKeyType="next"
              selectionColor={Theme.Brand.primary}
            />
          </View>
          
          <View style={{ borderBottomWidth: 1, borderBottomColor: Theme.Brand.primary }}>
            <EmailTextInput 
              ref="email"
              style={[{ lineHeight: 50, height: 50, paddingTop: inputPaddingTop, paddingBottom: inputPadding, fontSize: Theme.Fonts.fontLarge }]}
              // autoCapitalize="none"
              // autoCorrect={false}
              // autoFocus={this.props.autoFocus}
              placeholder={"Email Address"}
              placeholderTextColor={"#ccc"}
              underlineColorAndroid={'transparent'}
              onChangeText={ text => this.setState({ email: text }) }
              returnKeyType="done"
              selectionColor={Theme.Brand.primary}
            />
          </View>
          
          <View style={Theme.Styles.row}>
            <View style={[Theme.Styles.f1, { paddingTop: 30, left: 10 } ]} >

              <TouchableHighlight 
                style={{ justifyContent: 'flex-start' }}>
                <Text onPress={this.props.onCancel} style={{color: Theme.Brand.primary, textAlign: 'center'}}>CANCEL</Text>
              </TouchableHighlight>

            </View>
            <View style={[{ paddingVertical: 20, flex: 1.8} ]} >
              <Button 
                raised primary
                text="RESET PASSWORD"
                style={{ 
                  text: [Theme.Styles.textMedium]  
                }} 
                onPress={() => {
                  const { username, email } = this.state;
                  
                  if (!username || username.length === 0) {
                    this.context.app.alert('Forgot Password Error', 'Username is required.');
                  }
                  else if (!email || email.length === 0) {
                    this.context.app.alert('Forgot Password Error', 'Email is required.');
                  }
                  else {
                    this.context.app.renewPassword(username, email)
                    .then( res => {
                      this.props.onReset(res);
                    })
                    .catch( err => {
                      if (err && err.hasOwnProperty('message')) {
                        this.context.app.alert('Forgot Password Error', err.message);
                      }
                    });
                  }
                }} 
              />
            </View>
          </View>
        </View>
      </SimpleDialog>
    );
  }
}