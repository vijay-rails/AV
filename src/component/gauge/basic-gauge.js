import tinycolor from 'tinycolor2';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableHighlight } from 'react-native';
import { AnimatedGaugeProgress, GaugeProgress } from 'react-native-simple-gauge';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { default as Theme } from '../../lib/theme';

export default class BasicGauge extends Component {

  static propTypes = {
    icon: PropTypes.string,
    gaugeColour: PropTypes.string,
    label: PropTypes.string,
    value: PropTypes.string,
    textColour: PropTypes.string,
    size: PropTypes.number,
    fill: PropTypes.number,
    style: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.number,
      PropTypes.array,
    ]),
    onPress: PropTypes.func,
  }

  static defaultProps = {
    size: 200,
    fill: 0,
    gaugeColour: Theme.Colours.black,
    textColour: '#1c1f2a',
    animationType: 'fadeInRight',
    easingType: 'ease-in-out-cubic',
    onPress: () => {},
  }
  
  state = {
    iconOffset: 0,
    valueOffset: 0,
    fill: 0
  }
  
  setNativeProps(props) {
    this.refs['gauge'].setNativeProps(props);
  }
  
  componentWillUpdate(nextProps) {
    if (nextProps.fill !== this.state.fill) {
      this.setState({
        fill: nextProps.fill
      });
    }
  }
  
  componentDidMount() {
    this.setState({
      fill: this.props.fill
    });
  }
  
  renderIcon() {
    const { icon, gaugeColour, size } = this.props;
    
    if (typeof icon === 'undefined' || icon === null || icon.length === 0) {
      return null;
    }
    
    const { iconOffset } = this.state;
    const iconSize = Math.floor(size / 4);
    const iconColour = tinycolor(gaugeColour).lighten(10).toString();
    
    return (
      <View style={[styles.layer, styles.center]}>
        <Icon name={icon} size={iconSize} color={iconColour} style={{ paddingBottom: iconOffset }}/>
      </View>
    ); 
  }
  
  renderLabel() {
    const { label, size, textColour } = this.props;
    
    if (typeof label === 'undefined' || label === null || label.length === 0) {
      return null;
    }
    
    const fontSize = Math.floor(size / 12);
    
    return (
      <Text style={[styles.label, { color: textColour, fontSize: fontSize }]} onLayout={event => {
        if (this.state.iconOffset != event.nativeEvent.layout.height) {
          this.setState({
            iconOffset: event.nativeEvent.layout.height
          });
        }
      }}>{label}</Text>
    );
  }
  
  renderValue() {
    const { value, size, textColour } = this.props;
    const { iconOffset, valueOffset } = this.state;
    
    if (typeof value === 'undefined' || value === null || value.length === 0) {
      return null;
    }
    
    const fontSize = Math.floor(size / 7);
    
    return (
      <View style={{ marginTop: valueOffset * -0.6 }} onLayout={event => {
        if (this.state.valueOffset != event.nativeEvent.layout.height) {
          this.setState({
            valueOffset: event.nativeEvent.layout.height
          });
        }
      }}>
        <Text style={[styles.value, { color: textColour, fontSize: fontSize } ]}>{value}</Text>
      </View>
    );
  }
  
  render() {
    const { style, size, gaugeColour, animationType, easingType, onPress } = this.props;
    const { fill } = this.state;
    
    const gaugeBackgroundColour = tinycolor(gaugeColour).lighten(30).toString();
    
    return (
      <TouchableHighlight ref="gauge" style={[style, styles.center]} onPress={onPress} underlayColor={'transparent'}>
        <View>
          <AnimatedGaugeProgress
            size={size}
            width={15}
            fill={fill}
            rotation={90}
            cropDegree={90}
            tintColor={gaugeColour}
            backgroundColor={gaugeBackgroundColour}
            strokeCap="butt"
          />
          {this.renderIcon()}
          {this.renderValue()}
          {this.renderLabel()}
        </View>
      </TouchableHighlight>
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
  bottom: {
    alignItems: 'center',
    justifyContent: 'flex-end',    
  },
  label: {
    textAlign: 'center'
  },
  value: {
    textAlign: 'center'
  }
});