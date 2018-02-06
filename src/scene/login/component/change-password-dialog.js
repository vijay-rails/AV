import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { 
  StyleSheet, View, Text, TextInput
} from 'react-native';
import { Button } from 'react-native-material-ui';
import SimpleDialog from '../../../component/simple-dialog';
import { default as Theme } from '../../../lib/theme';
import PasswordTextInput from '../../../component/password-text-input';

export default class ChangePasswordDialog extends Component {

  static contextTypes = {
    app: PropTypes.object.isRequired
  }
  
  static propTypes = {
    onPressVoid: PropTypes.func,
    onCancel: PropTypes.func,
    onUpdate: PropTypes.func,
  }

  static defaultProps = {
    onPressVoid: () => {},
    onCancel: () => {},
    onUpdate: () => {},
  }

  static styles = StyleSheet.create({
  
  });
  
  state = {
  }
  
  render() {
    return (
      <SimpleDialog 
        visible 
        onPressVoid={this.props.onPressVoid}
        overlayStyle={{ backgroundColor: 'transparent' }}
      >
        <View style={Theme.Styles.column}>
          <Text style={[ Theme.Styles.textLarge, { color: Theme.Colours.black } ]}>Update Password</Text>
        
          <PasswordTextInput
            ref="oldPassword"
            style={[{ borderBottomWidth: 0, lineHeight: 30, flexDirection: 'column', paddingLeft: 5, paddingTop: 20, paddingBottom: 0, margin: 0 }]}
            textAlignVertical={'bottom'}
            placeholder="Previous Password"
            placeholderTextColor={Theme.Colours.cardBackground_Grey}
            returnKeyType="next"
          />

          <PasswordTextInput
            ref="newPassword"
            style={[{ borderBottomWidth: 0, lineHeight: 30, flexDirection: 'column', paddingLeft: 5, paddingTop: 20, paddingBottom: 0, margin: 0 }]}
            textAlignVertical={'bottom'}
            placeholder="New Password"
            placeholderTextColor={Theme.Colours.cardBackground_Grey}
            returnKeyType="next"
          />

          <PasswordTextInput
            ref="confirmPassword"
            style={[{ borderBottomWidth: 0, lineHeight: 30, flexDirection: 'column', paddingLeft: 5, paddingTop: 20, paddingBottom: 0, margin: 0 }]}
            textAlignVertical={'bottom'}
            placeholder="Confirm New Password"
            placeholderTextColor={Theme.Colours.cardBackground_Grey}
            returnKeyType="done"
          />
                     
          <View style={Theme.Styles.row}>
            <View style={[Theme.Styles.f1, { paddingVertical: 20 } ]} >
              <Button 
                text="CANCEL"
                style={{ container: { justifyContent: 'flex-end' }, text: { color: Theme.Colours.primary }  }} 
                onPress={this.props.onCancel} 
              />
            </View>
            <View style={[Theme.Styles.f1, { paddingVertical: 20} ]} >
              <Button 
                raised primary
                text="UPDATE"
                style={{ text: [Theme.Styles.textSmall, { color: Theme.Colours.white }]  }} 
                onPress={() => {
                  const { oldPassword, newPassword, confirmPassword } = this.refs;
                  
                  if (!oldPassword.value() || oldPassword.value().length === 0) {
                    this.context.app.alert('Update Password Error', 'Previous Password is required.');
                  }
                  else if (!newPassword.value() || newPassword.value().length === 0) {
                    this.context.app.alert('Update Password Error', 'New Password is required.');
                  }
                  if (!confirmPassword.value() || confirmPassword.value().length === 0 || confirmPassword.value() != newPassword.value()) {
                    this.context.app.alert('Update Password Error', 'Confirm New Password is required or does not match New Password.');
                  }
                  else {
                    this.context.app.changeUserPassword(oldPassword.value(), newPassword.value(), confirmPassword.value())
                    .then( res => {
                      this.props.onUpdate(res);
                    })
                    .catch( err => {
                      if (err && err.hasOwnProperty('message')) {
                        this.context.app.alert('Update Password Error', err.message);
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