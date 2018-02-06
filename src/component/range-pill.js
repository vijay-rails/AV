import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { 
  StyleSheet, Text, View, TouchableHighlight
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Pill from './pill';

import { default as Theme } from '../lib/theme';

export default class RangePill extends Component {
  static propTypes = {
    icon: PropTypes.string,
    min: PropTypes.string,
    max: PropTypes.string,
    style: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.number,
      PropTypes.array,
    ]),
    onRemove: PropTypes.func
  }

  static defaultProps = {
    icon: 'account-circle',
    onRemove: () => {}
  }

  render() {
    return (
      <Pill style={this.props.style} onPress={this.props.onRemove}>
        <View style={{ flexDirection: 'row' }}>
          <Icon name={this.props.icon} size={28} color={Theme.Colours.white} style={{ alignSelf: 'center', paddingRight: 5 }}/>        
          <Text style={styles.pillText}>{this.props.min}</Text>
          <Text style={styles.pillText}> - </Text>
          <Text style={styles.pillText}>{this.props.max}</Text>
        </View>
      </Pill>
    );
  }
}

const styles = StyleSheet.create({
  pillText: {
    color: Theme.Colours.white,
    alignSelf: 'center'
  }
});