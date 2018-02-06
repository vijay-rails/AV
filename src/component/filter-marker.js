import PropTypes from 'prop-types';
import React from 'react';
import { View, StyleSheet, Platform, TouchableHighlight, ViewPropTypes } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { default as Theme } from '../lib/theme';

export default class FilterMarker extends React.Component {
  static propTypes = {
    pressed: PropTypes.bool,
    pressedMarkerStyle: ViewPropTypes.style,
    markerStyle: ViewPropTypes.style,
    enabled: PropTypes.bool,
  };

  render() {
    return (
      <TouchableHighlight>
        <View
          style={this.props.enabled ? [
            styles.markerStyle,
            this.props.markerStyle,
            this.props.pressed && styles.pressedMarkerStyle,
            this.props.pressed && this.props.pressedMarkerStyle,
          ] : [styles.markerStyle, styles.disabled]}
        />
      </TouchableHighlight>
    );
  }
}

const styles = StyleSheet.create({
  markerStyle: {
    ...Platform.select({
      ios: {
        height: 30,
        width: 30,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: Theme.Colours.border,
        backgroundColor: Theme.Colours.white,
        // shadowColor: Theme.Colours.black,
        shadowOffset: {
          width: 0,
          height: 3,
        },
        shadowRadius: 1,
        shadowOpacity: 0.2,
      },
      android: {
        height: 12,
        width: 12,
        borderRadius: 12,
        backgroundColor: Theme.Colours.greenTurquoise,
      },
    }),
  },
  pressedMarkerStyle: {
    ...Platform.select({
      ios: {},
      android: {
        height: 20,
        width: 20,
        borderRadius: 20,
      },
    }),
  },
  disabled: {
    backgroundColor: Theme.Colours.greyLight,
  },
});
