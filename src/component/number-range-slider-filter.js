import * as d3 from 'd3-format';
import isEqual from 'lodash.isequal';
import PropTypes from 'prop-types';
import React, { Component } from 'react'
import { View, StyleSheet, Text, Dimensions } from 'react-native';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import FilterMarker from './filter-marker';
import { default as Theme } from '../lib/theme';


export default class NumberRangeSliderFilter extends Component {

  static propTypes = {
    min: PropTypes.number,
    max: PropTypes.number,
    values: PropTypes.object,
    label: PropTypes.string,
  }

  static defaultProps = {
    label: '',
    min: 0,
    max: 5000000,
    values: {
      min: 0,
      max: 5000000
    },
  }

  state = {
    min: this.props.min,
    max: this.props.max,
    values: {
      min: (this.props.values.hasOwnProperty('min') && Number.isNaN(this.props.values.min) || !this.props.values.hasOwnProperty('min')) ? 
        this.props.min : this.props.values.min,
      max: (this.props.values.hasOwnProperty('max') && Number.isNaN(this.props.values.max) || !this.props.values.hasOwnProperty('max')) ?
        this.props.max : this.props.values.max
    },
    width: 100
  }

  getFilter() {
    return this.state;
  }
  
  componentWillReceiveProps(nextProps) {
    let state = {};
    
    if (nextProps.values.min !== this.props.values.min && !Number.isNaN(this.props.values.min)) {
      state.values.min = nextProps.values.min;
    }
    
    if (nextProps.values.max !== this.props.values.max && !Number.isNaN(this.props.values.max)) {
      state.values.max = nextProps.values.max;
    }
    
    this.setState(state);
  }
  
  shouldComponentUpdate(nextProps, nextState) {
    if (!isEqual(nextProps, this.props)) {
      return true;
    }
    
    if (!isEqual(nextState, this.state)) {
      return true;
    }
    
    return false;
  }
  
  render() {
    const d3f = d3.format('.0s');

    const min = d3f(this.state.values.min);
    let max = d3f(this.state.values.max);  
    
    // apply '+' character to max value
    if (this.state.max == this.state.values.max) {
      max = max.concat('+');
    }
    
    const { width, height } = Dimensions.get('screen');
    
    return (
      <View style={styles.container} onLayout={ event => {
        this.setState({
          width: event.nativeEvent.layout.width - 20
        });
      }}>
        <View >
          <Text style={[Theme.Styles.textMedium, { color: Theme.Colours.black }]}>{this.props.label}</Text>
          <MultiSlider 
            min={this.props.min}
            max={this.props.max}
            values={[this.state.values.min, this.state.values.max]}
            step={25}
            customMarker={() => (
              <FilterMarker enabled 
                markerStyle={{
                  height: 20, width: 20, borderRadius: 20, backgroundColor: Theme.Brand.primary
                }}
              />
            )}          
            selectedStyle={{
              backgroundColor: Theme.Brand.primary
            }}
            unselectedStyle={{
             // backgroundColor: 'silver',
             }}
            containerStyle={{
              // height:30,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            trackStyle={{
              // height:10,
              // backgroundColor: 'red',
            }}
            markerStyle={{
              height: 20, width: 20, borderRadius: 20, backgroundColor: Theme.Brand.primary
            }}
            touchDimensions={{
              height: 50,
              width: 50,
              borderRadius: 50,
              slipDisplacement: height,
            }}
            sliderLength={this.state.width}
            onValuesChange={ change => {
              this.setState({
                values: {
                  min: change[0],
                  max: change[1]
                }
              });
            }}
            onValuesChangeFinish={ change => {
              this.setState({
                values: {
                  min: change[0],
                  max: change[1]
                }
              });
            }}
            />
          </View>
          <View style={{ flexDirection: 'row' }}>
            <View style={{flex:1}}>
              <Text style={[Theme.Styles.textMedium, { color: Theme.Colours.black }]}>{min}</Text>
            </View>
            <View style={{flex:1, alignItems: 'flex-end'}}>
              <Text style={[Theme.Styles.textMedium, { color: Theme.Colours.black }]}>{max}</Text>
            </View>
          </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    // flex: -1,
    // flexDirection: 'column',
    // alignItems: 'center',
  },
});