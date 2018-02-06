import PropTypes from 'prop-types';
import React, { Component } from 'react'; 
import {
  View, TextInput
} from 'react-native';
import { default as Theme } from '../lib/theme';

export default class PasswordTextInput extends Component {

  static propTypes = {
    style: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.number,
      PropTypes.array,
    ]),
    placeholder: PropTypes.string,
    placeholderTextColor: PropTypes.string,
    returnKeyType: PropTypes.string,
  }

  static defaultProps = {
    autoFocus: false
  }

  state = {
    value: '',
    focused: false,
    visible: false
  }
  
  value() {
    return this.state.value
  }

  render() {
    const underlineColour = this.state.focused ? Theme.Brand.primary : this.props.placeholderTextColor;
    const secure = !this.state.visible;
    const iconColour = secure ? this.props.placeholderTextColor : Theme.Brand.primary;  
    
    let style = [this.props.style, Theme.Styles.column, { 
      borderBottomWidth: 0, 
      lineHeight: 30, 
      paddingLeft: 5, 
      paddingTop: 20, 
      paddingBottom: 0, 
      margin: 0 
    }];
    
    return (
      <View style={{  }}>
        <View style={{ borderBottomWidth: 1, borderBottomColor: underlineColour }}>
          <TextInput 
          onFocus={() => {
            this.setState({ focused: true });
          }}
          onBlur={() => {
            this.setState({ focused: false });
          }}
          style={style}
          secureTextEntry={secure}
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus={this.props.autoFocus}
          placeholder={this.props.placeholder}
          placeholderTextColor={this.props.placeholderTextColor}
          underlineColorAndroid={'transparent'}
          onChangeText={ text => this.setState({value: text}) }
          returnKeyType={this.props.returnKeyType}
          selectionColor={Theme.Brand.primary}
          />
        </View>
        <View style={{ position: 'absolute', top: 0, right: 0, bottom: 0 }} >
          <View style={{ flex: 1, flexDirection: 'row' }}>
            <Theme.Icon.Button 
            name={'remove-red-eye'} 
            size={28} 
            backgroundColor={'transparent'}
            color={iconColour} 
            style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 5, paddingBottom: 3 }}
            iconStyle={{ marginRight: 0, margin: 0, padding: 0 }}
            borderRadius={0}
            onPress={() => {
              this.setState({
                visible: !this.state.visible
              });
            }}
            />
          </View>
        </View>
      </View>
    ); 
  }
}