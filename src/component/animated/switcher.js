import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Animated,
  Easing
} from 'react-native';

import { default as Theme } from '../../lib/theme';

export default class Switcher extends Component {

  static propTypes = {
    children: PropTypes.node,    
  }
  
  constructor(props) {
    super(props);
    
    this.step = this.step.bind(this);
    
    this.state = {
      step: 0,
    };
    
    this._animation = new Animated.Value(0);
  }
  
  step() {
    let { step } = this.state;
  
    this._animation = new Animated.Value(0);
    const startValue = 1;
    const endValue = 2; // step === 1 ? 0 : 2;

    Animated.sequence([
      Animated.timing(            
          this._animation, 
          {
            toValue: startValue,
            easing: Easing.in(Easing.exp),
          } 
      ),
      Animated.timing(            
          this._animation, 
          {
            toValue: endValue,
            easing: Easing.out(Easing.exp),
          } 
      ),
    ]).start();   
    
    if (step == this.props.children.length) {
      step = -1;
    }
    
    this.setState({
      step: ++step // === 0 ? 1 : 0
    });
  }
  
  renderChildren() {
    
    const { step } = this.state;
    
    return this.props.children.map( (c, i) => {
      
      let outputRange;
      switch (i) {
        case step:
          outputRange = [
            '0deg', '90deg', '90deg'
          ];
          break;
        case (step+1):
          outputRange = [
            '-90deg', '-90deg', '0deg'
          ];
          break;
        default:
          return null;
      }
    
      return (
        <Animated.View 
          key={i}
          style={[styles.fhw, { transform: [
              {rotateY: this._animation.interpolate({
                inputRange: [0, 1, 2],
                outputRange: outputRange,
              })}
            ]
          }]}
        >
        {c}
        </Animated.View>
      ); 
    });
  }
  
  render() {
    return (
      <View style={{ flex: 1 }}>
        {this.renderChildren()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  fhw: {
    position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 
  }
});