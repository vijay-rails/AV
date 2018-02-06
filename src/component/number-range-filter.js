import PropTypes from 'prop-types';
import React, { Component } from 'react'
import { View, StyleSheet, Text } from 'react-native';
import NumberInput from './number-input';

import { default as Theme } from '../lib/theme';

export default class NumberRangeFilter extends Component {

  static propTypes = {
    min: PropTypes.number,
    max: PropTypes.number,
  }

  static defaultProps = {
    min: 0,
    max: null
  }
  
  constructor(props){
    super(props);
    this.state = {
      min: props.min,
      max: props.max,
    };
  }

  getFilter = () => {
    return this.state;
  }
  
  componentWillReceiveProps(nextProps) {
    if (nextProps.min !== this.props.min) {
      this.setState({
        min: nextProps.min,
      });
    }
    
    if (nextProps.max !== this.props.max) {
      this.setState({
        max: nextProps.max,
      });
    }
  }
  
  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.min !== this.props.min 
            || nextProps.max !== this.props.max
            || nextState.min !== this.state.min
            || nextState.max !== this.state.max) {
        return true;
    }
    return false;
  }
  
  render() { 
	let min = 0; 
    if (this.state.min !== null) {
      min = this.state.min.toString();
    }
    let max = null;
    if (this.state.max !== null) {
      max = this.state.max.toString();
    }
    
    return (
      <View style={styles.container}>
        <NumberInput 
          ref={ c => this._minInput = c }
          style={{flex: 1 }} 
          defaultValue={min} 
          onChanged={value => this.setState({ min: value })} 
          placeholder={'Minimum'} />
        <Text style={{ marginHorizontal: 10, alignSelf: 'center' }}>-</Text>
        <NumberInput 
          ref={ c => this._maxInput = c }
          style={{flex: 1}}
          defaultValue={max}
          onChanged={value => this.setState({ max: value })} 
          placeholder={'Maximum'} />
      </View>
    )
  }
}
  
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    // flex: 1,
    paddingVertical: 10,
    height: 60,
  },
});