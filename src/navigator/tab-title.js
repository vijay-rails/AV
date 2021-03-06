import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { default as Theme } from '../lib/theme';

export default class TabTitle extends Component {
  
  static contextTypes = {
    app: PropTypes.object.isRequired
  }
  
  static propTypes = {
    node: PropTypes.string,
    value: PropTypes.string,
  }
  
  state = {
    value: this.context.app.getRegistryConfigValue(this.props.node, this.props.value)
  }
  
  render() {   
    return (
      <View style={[Theme.Styles.f1, Theme.Styles.row]}>
        <View style={[Theme.Styles.f1, Theme.Styles.column, Theme.Styles.center]}>
          <Text style={[{ color: Theme.Colours.white, fontSize: Theme.Fonts.fontMedium }]}>{this.state.value}</Text>
        </View>
      </View>
    );
  }
}