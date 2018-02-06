import tinycolor from 'tinycolor2';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableHighlight } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { default as Theme } from '../../lib/theme';

export default class BasicCurrency extends Component {

  static propTypes = {
    label: PropTypes.string,
    value: PropTypes.string,
    textColour: PropTypes.string,
    style: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.number,
      PropTypes.array,
    ]),
    onPress: PropTypes.func,
  }

  static defaultProps = {
    textColour: '#1c1f2a',
    onPress: () => {},
  }

  state = {
  }
  
  setNativeProps(props) {
    this.refs['gauge'].setNativeProps(props);
  }
  
  renderLabel() {
    const { label, textColour } = this.props;
    
    if (typeof label === 'undefined' || label === null || label.length === 0) {
      return null;
    }
        
    return (
      <Text style={[styles.label, { color: textColour }]} >{label}</Text>
    );
  }
  
  renderValue() {
    const { value, textColour } = this.props;
    
    if (typeof value === 'undefined' || value === null || value.length === 0) {
      return null;
    }
        
    return (
      <View >
        <Text style={[styles.value, { color: textColour } ]}>{value}</Text>
      </View>
    );
  }
  
  render() {
    const { style, onPress } = this.props;
        
    return (
      <TouchableHighlight ref="gauge" style={[style, styles.center]} onPress={onPress} underlayColor={'transparent'}>
        <View>
          {this.renderValue()}
          {this.renderLabel()}
        </View>
      </TouchableHighlight>
    );
  }
}

const styles = StyleSheet.create({
  layer: { 
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',    
  },
  bottom: {
    alignItems: 'center',
    justifyContent: 'flex-end',    
  },
  label: {
    textAlign: 'center'
  },
  value: {
    textAlign: 'center'
  }
});