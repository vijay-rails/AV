import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { View, StyleSheet  } from 'react-native';
import { default as Theme } from '../lib/theme';

export default class PopoverViewDivider extends Component {
  static propTypes = {
    style: PropTypes.object,
  }
    
  render() {
    return (
      <View style={[styles.container, this.props.style]} />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: 1,
    borderBottomWidth: 1,
    borderBottomColor: Theme.Brand.quaternary
  }
});
