import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import BasicActivityIndicator from './basic-activity-indicator';
import SimpleCard from './simple-card';

import { default as Theme } from '../lib/theme';

export default class SimpleActivityIndicator extends Component {
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
    if (!this.props.animating) {
      return null;
    }
    return (
      <SimpleCard style={{ height: 50, width: 50, borderRadius: 25, backgroundColor: Theme.Colours.cardItemBackground_White }}>
        <BasicActivityIndicator animating={this.props.animating} />
      </SimpleCard>
    );
  }
}