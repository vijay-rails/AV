import PropTypes from 'prop-types';
import isEqual from 'lodash.isequal';
import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Animated,
  Easing,
  TouchableHighlight,
  UIManager,
  Platform,
  LayoutAnimation
} from 'react-native';
import { Animation } from '../../lib/animation';

import { default as Theme } from '../../lib/theme';

export default class Flipper extends Component {

  static propTypes = {
    children: PropTypes.node,
  }

  constructor(props) {
    super(props);
    
    this.step = this.step.bind(this);
    
    this.state = {
      step: 0,
      height: 0
    };
    
    this._animation = new Animated.Value(0);
       
    if (Platform.OS === 'android') {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }
  
  step() {
    const { step } = this.state;
    
    const startValue = 1;
    const endValue = step === 1 ? 0 : 2;

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
    
    this.setState({
      step: step === 0 ? 1 : 0
    });
  }
  
  /*
  shouldComponentUpdate(nextProps, nextState) {
    return ! ( isEqual(nextProps, this.props) && isEqual(nextState, this.state) );
  }
  */
  
  componentWillUpdate(nextProps, nextState) {
    // LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    LayoutAnimation.configureNext(Animation.scale);
    // LayoutAnimation.configureNext(Animation.spring);
  }
    
  renderChildren() {
    return this.props.children.map( (c, i) => {
      
      let outputRange;
      switch (i) {
        case 0:
          outputRange = [
            '0deg', '90deg', '90deg'
          ];
          break;
        case 1:
          outputRange = [
            '-90deg', '-90deg', '0deg'
          ];
          break;
      }
    
      return (
        <Animated.View 
          key={i}
          style={[styles.fhw, { height: this.state.height, transform: [
              {rotateY: this._animation.interpolate({
                inputRange: [0, 1, 2],
                outputRange: outputRange,
              })}
            ]
          }]}
          onLayout={(e) => { this.setState({ height: e.nativeEvent.layout.width });  }}
        >
          <TouchableHighlight style={{ flex: 1 }} onPress={this.step} underlayColor={'transparent'}>
          {c}
          </TouchableHighlight>
        </Animated.View>
      ); 
    });
  }
  
  render() {
    return (
      <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center' }}>
        {this.renderChildren()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  fhw: {
    position: 'absolute', 
    top: 0, left: 0, bottom: 0, right: 0,
    // alignSelf: 'center',
  }
});