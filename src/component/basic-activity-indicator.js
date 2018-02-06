import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { View, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { default as Theme } from '../lib/theme';

export default class BasicActivityIndicator extends Component {

  static propTypes = {
    animating: PropTypes.bool,
    style: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.number,
    ]),
  }

  static defaultProps = {
    animating: false
  }

  render() {
    return (
      <View style={[styles.wrapper]}>
      <ActivityIndicator
        animating={this.props.animating}
        style={[styles.centering, this.props.style]}
        size="large"
        color={Theme.Brand.primary}
      />
      </View>
    );
  }
};

const styles = StyleSheet.create({
  wrapper: {
	flex: 1,
	justifyContent: 'center',
	alignItems: 'center'
  },
  centering: {
    alignSelf: 'center',
    marginLeft: Platform.OS === 'android' ? 0 : 3,
    marginTop: Platform.OS === 'android' ? 0 : 3,
  },
});