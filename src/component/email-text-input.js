import PropTypes from 'prop-types';
import React, { Component } from 'react'; 
import {
  View, TextInput
} from 'react-native';
import { default as Theme } from '../lib/theme';

export default class EmailTextInput extends Component {

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
  }

  static defaultProps = {
    autoFocus: false
  }

  state = {
    value: '',
    focused: false
  }

  value() {
    return this.state.value
  }

  render() {
    const underlineColour = this.state.focused ? Theme.Brand.primary : this.props.placeholderTextColor;
    
    let style = [this.props.style, Theme.Styles.column, { 
      borderBottomWidth: 0, 
      lineHeight: 30, 
      paddingLeft: 5, 
      paddingTop: 20, 
      paddingBottom: 0, 
      margin: 0 
    }];
    /*
    if (Array.isArray(this.props.style)) {
      this.props.style.reduce((s, item) => {
        s.unshift(item);
        return s;
      }, style);
    }
    else {
      style.unshift(this.props.style);
    }
    */
    
    return (
      <View style={{ borderBottomWidth: 1, borderBottomColor: underlineColour }}>
        <TextInput 
        onFocus={() => {
          this.setState({ focused: true });
        }}
        onBlur={() => {
          this.setState({ focused: false });
        }}
        style={style}
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
    ); 
  }
}
