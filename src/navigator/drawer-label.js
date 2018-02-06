import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { 
  StyleSheet, Text, View
} from 'react-native';

import { default as Theme } from '../lib/theme';

export default class DrawerLabel extends Component {
  
  static contextTypes = {
    app: PropTypes.object.isRequired
  }

  static propTypes = {
    label: PropTypes.string,
    focused: PropTypes.bool,
    color: PropTypes.string,
  }

  static defaultProps = {

  }
  
  state = {
    label: this.context.app.getRegistryConfigValue('Registry::Insights::Scene::Navigation', this.props.label)
  }
  
  render() {   
    const { focused, color } = this.props;
  
    let labelStyle = {};
    let textStyle = { color: color };
    
    if (focused) {
      labelStyle['borderRightWidth'] = 8;
      labelStyle['borderRightColor'] = color;
      textStyle['fontFamily'] = Theme.PrimaryFontBolded;
    }
  
    return (
      <View style={[Theme.Styles.f1, Theme.Styles.column, Styles.label, labelStyle]}>
        <Text style={[Styles.text, textStyle]}>{this.state.label}</Text>
      </View>
    );
  }
}

const Styles = StyleSheet.create({
  label: {
    height: 65, 
    justifyContent: 'center'
  },
  text: {
    fontSize: Theme.Fonts.h6
  }
});