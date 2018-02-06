import tinycolor from 'tinycolor2';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableHighlight } from 'react-native';
import { AnimatedGaugeProgress, GaugeProgress } from 'react-native-simple-gauge';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { default as Theme } from '../../lib/theme';

const SIZE_RATIO = 1.75; // guestimated

export default class CircleGauge extends Component {
  static propTypes = {
    icon: PropTypes.string,
    colour: PropTypes.string,
    backgroundColour: PropTypes.string,
    width: PropTypes.number,
    fill: PropTypes.number,
    style: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.number,
      PropTypes.array,
    ]),
  }

  static defaultProps = {
    icon: 'favourite',
    width: 35,
    fill: 0,
    colour: Theme.Colours.black,
    backgroundColour: Theme.Colours.black,
  }

  state = {
    size: 0
  }
  
  setNativeProps(props) {
    this.refs['gauge'].setNativeProps(props);
  }
  
  renderIcon() {
    const { icon, colour } = this.props;
    
    if (typeof icon === 'undefined' || icon === null || icon.length === 0) {
      return null;
    }
    
    const iconSize = Math.floor(this.state.size / 4);
    
    return (
      <View style={[styles.layer, styles.center ]}>
        <Icon name={icon} size={iconSize} color={colour} />
      </View>
    ); 
  } 
  
  render() {
    const { style, width, fill, colour, backgroundColour } = this.props;
    return (
      <View style={[{ alignItems: 'center' }, style]} onLayout={(e) => { this.setState({ size: Math.floor(e.nativeEvent.layout.width / SIZE_RATIO) }); }}>
        <AnimatedGaugeProgress
          size={this.state.size}
          width={width}
          fill={fill}
          rotation={270}
          cropDegree={0}
          tintColor={colour}
          backgroundColor={backgroundColour}
          strokeCap="butt"
        />
        {this.renderIcon()}
      </View>
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
});