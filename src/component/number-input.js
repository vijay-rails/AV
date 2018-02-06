import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {
  View, TextInput
} from 'react-native';
import { default as Theme } from '../lib/theme';

export default class NumberInput extends Component {

  static propTypes = {
    style: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.number,
    ]),
    containerStyle: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.number,
    ]),
    defaultValue: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
    placeholder: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
    onChanged: PropTypes.func,
  }

  static defaultProps = {
    defaultValue: null,
    placeholder: '',
  }

  constructor(props) {
    super(props);
    
    this.onChanged = this.onChanged.bind(this);
    
    this.state = {
      value: props.defaultValue
    }
  }
  
  getValue = () => {
    return this.state.value;
  }

  onChanged(text) {
    let value = null;
    if (text.length >= 1) {
      value = text.replace(/\D/g,'');
    }
    this.setState({ value: value });
    this.props.onChanged(value);
  }
  
  render() {
    return (
      <View style={[{ flex: 1, borderBottomWidth: 1, borderBottomColor: Theme.Brand.primary }, this.props.containerStyle]}>
      <TextInput 
        style={this.props.style}
        keyboardType='numeric'
        returnKeyType='done'
        onChangeText={this.onChanged}
        value={this.state.value}
        maxLength={12}
        underlineColorAndroid={'transparent'}
        placeholder={this.props.placeholder}
        selectionColor={Theme.Brand.primary}
      />
      </View>
    );
  }
};

