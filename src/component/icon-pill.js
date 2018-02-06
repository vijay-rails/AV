import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { 
  StyleSheet, View, TouchableHighlight
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Pill from './pill';
import { default as Theme } from '../lib/theme';

export default class IconPill extends Component {
  static propTypes = {
    icon: PropTypes.string,
    style: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.number,
      PropTypes.array,
    ]),
    onRemove: PropTypes.func
  }

  static defaultProps = {
    onRemove: () => {}
  }

  render() {
    return (
      <Pill style={this.props.style} onPress={this.props.onRemove}>
        <Icon name={this.props.icon} size={28} color={Theme.Colours.white} />
      </Pill>
    );
  }
}