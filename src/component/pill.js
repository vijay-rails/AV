import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { 
  StyleSheet, View, TouchableHighlight
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { default as Theme } from '../lib/theme';

export default class Pill extends Component {
  static propTypes = {
    children: PropTypes.node,
    style: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.number,
      PropTypes.array,
    ]),
    onPress: PropTypes.func,
  }

  static defaultProps = {
    onPress: () => {}
  }

  render() {
    return (
      <TouchableHighlight onPress={this.props.onPress} underlayColor={'transparent'} style={[styles.container, styles.pill, this.props.style]}>
        <View style={{ flexDirection: 'row' }} >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {this.props.children}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon name={'close'} size={22} color={Theme.Colours.white} />          
          </View>
        </View>
      </TouchableHighlight>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 5,
    flexDirection: 'row'
  },
  pill: {
    backgroundColor: Theme.Brand.primaryDark, paddingHorizontal: 5, paddingVertical: 5, marginRight: 8
  }
});
