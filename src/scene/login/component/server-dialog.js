import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { 
  StyleSheet, View, Text, TextInput
} from 'react-native';
import { Button } from 'react-native-material-ui';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import SimpleDialog from '../../../component/simple-dialog';
import { default as Theme } from '../../../lib/theme';
import UrlTextInput from '../../../component/url-text-input';

export default class ServerDialog extends Component {

  static contextTypes = {
    app: PropTypes.object.isRequired
  }
  
  static propTypes = {
    onPressVoid: PropTypes.func,
    cancel: PropTypes.func,
    checkServer: PropTypes.func,
    serverChange: PropTypes.bool,
    onChangeServerUrl: PropTypes.func,
    serverUrl: PropTypes.string,
    serverNewUrl: PropTypes.string,
    placholder: PropTypes.string,
    enabled: PropTypes.bool,
  }

  static defaultProps = {
    onPressVoid: () => {},
    cancel: () => {},
    checkServer: () => {},
    onChangeServerUrl: () => {},
    onCancel: () => {},
    enabled: false
  }

  renderCancelBtn() {
    if (this.props.serverChange) {
      return (
        <Button raised primary text="Cancel"
          onPress={() => {
            this.props.serverUrl = "test";
            this.props.onCancel();
          }}
        />
      );
    }
    return null;
  }
  
  render() {
  
    const inputHeight = 50; // this.state.keyboardVisible ? 50 : 60;

    let promptMsg = 'ENTER';
    let continueBtnTxt = 'NEXT';

    let textValue = '';
    
    let placeholder = this.props.placeholder;

    if (this.props.serverUrl && this.props.serverUrl.length > 0) {
      placeholder = this.props.serverUrl;
    }

    if (this.props.serverChange) { 
      promptMsg = 'CHANGE';
      continueBtnTxt = 'UPDATE'
    }
    
    console.log('SERVERURL -------------------------------');
    console.log(this.props.serverUrl);
    
    return (
      <SimpleDialog 
        visible 
        onPressVoid={this.props.onPressVoid}
        overlayStyle={{ backgroundColor: 'transparent' }}
      >
        <View style={Theme.Styles.column}>
          <Text style={[ Theme.Styles.textLarge, { color: Theme.Colours.black } ]}>{promptMsg} SERVER</Text>
        
          <View style={[ Theme.Styles.column, { justifyContent: 'center' } ]}>
            <UrlTextInput
              ref="server"
              style={[Theme.Styles.textLarge, Theme.Styles.leadSmall, { height: inputHeight, color: Theme.Colours.black, borderBottomWidth: 2, borderBottomColor: Theme.Brand.primary }]}
              textAlignVertical={'bottom'}
              placeholder={placeholder}
              placeholderTextColor={Theme.Colours.dark}
              returnKeyType="next"
              value={this.props.serverUrl}
              onChangeText={
                this.props.onChangeServerUrl
              }
            />
          </View>
          <View style={[ Theme.Styles.row ]}>
          <View style={ styles.buttons }>
          <View style={{ paddingTop: 30, paddingBottom: 10, left: 0 }}>
            {this.renderCancelBtn()}
            </View>
          <View style={{ paddingTop: 30, paddingBottom: 10, right: 0 }}>
            <Button raised primary text={continueBtnTxt}
              disabled = {!this.props.enabled}
              onPress={this.props.checkServer} 
            />
            </View>
          </View>
        </View>
          
        </View>
      </SimpleDialog>
    );
  }
}

const styles = StyleSheet.create({
  buttons: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  }
});