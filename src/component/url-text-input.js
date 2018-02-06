import PropTypes from 'prop-types';
import React, { Component } from 'react'; 
import {
  View, TextInput
} from 'react-native';
import { default as Theme } from '../lib/theme';

export default class UrlTextInput extends Component {

  static propTypes = {
    style: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.number,
      PropTypes.array,
    ]),
    autoFocus: PropTypes.bool,
    placeholder: PropTypes.string,
    placeholderTextColor: PropTypes.string,
    returnKeyType: PropTypes.string,
    value: PropTypes.string,
    onChangeText: PropTypes.func,
  }

  static defaultProps = {
    autoFocus: false,
    onChangeText: () => {}, 
  }
		
  state = {
    value: '',
    focused: false
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.value !== this.state.value) {
      this.setState({
        value: nextProps.value
      });
    }
  }
  
  value() {
    return this.state.value
  }

  render() {
    const underlineColour = this.state.focused ? Theme.Brand.primary : this.props.placeholderTextColor;
    
    return (
      <View style={{ borderBottomWidth: 1, borderBottomColor: underlineColour }}>
        <TextInput
        onFocus={() => {
          this.setState({ focused: true });
        }}
        onBlur={() => {
          this.setState({ focused: false });
        }}
        style={[this.props.style, { borderBottomWidth: 0, lineHeight: 30, flexDirection: 'column', paddingLeft: 5, paddingTop: 20, paddingBottom: 0, margin: 0 }]}
        keyboardType="url"
        keyboardAppearance="dark"
        autoCapitalize="none"
        autoCorrect={false}
        autoFocus={this.props.autoFocus}
        placeholder={this.props.placeholder}
        placeholderTextColor={this.props.placeholderTextColor}
        underlineColorAndroid={'transparent'}
        onChangeText={ text => this.setState({value: text}, () => { this.props.onChangeText(text); }) }
        value={this.state.value}
        returnKeyType={this.props.returnKeyType}
        selectionColor={Theme.Brand.primary}
        />
      </View>
    ); 
  }
}
