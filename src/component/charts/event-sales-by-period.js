
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';

import { default as Theme } from '../../lib/theme';

import { Bar } from 'react-native-pathjs-charts'

/**
 * Does not work. react-native-pathjs-charts is broken atm with respect to 0 values.
 */
export default class EventSalesByPeriod extends Component {

  static propTypes = {
    width: PropTypes.number,
    height: PropTypes.number,
    data: PropTypes.array,
    // colour: PropTypes.string,
    // backgroundColour: PropTypes.string,
  }

  static defaultProps = {
    width: 300,
    height: 100,
    data: []
    // colour: Theme.Colours.black,
    // backgroundColour: Theme.Colours.black,
  }

  state = {
  }
  
  setNativeProps(props) {
    this.refs['graph'].setNativeProps(props);
  }
  
  render() {
    let data = [
      [{
        "v": 65,
        "name": "apple"
      }],
      [{
        "v": 50,
        "name": "banana"
      }],
      [{
        "v": 0.0001,
        "name": "grape"
      }]
    ]

    let options = {
      width: this.props.width,
      height: this.props.height,
      margin: {
        top: 20,
        left: 25,
        bottom: 50,
        right: 20
      },
      color: '#388E3C', // '#2980B9', // #689F38
      gutter: 20,
      animate: {
        type: 'oneByOne',
        duration: 200,
        fillTransition: 3
      },
      axisX: {
        showAxis: true,
        showLines: true,
        showLabels: true,
        showTicks: true,
        zeroAxis: true,
        orient: 'bottom',
        label: {
          fontFamily: 'Arial',
          fontSize: 8,
          fontWeight: true,
          fill: '#34495E',
          rotate: -45
        }
      },
      axisY: {
        showAxis: true,
        showLines: true,
        showLabels: true,
        showTicks: true,
        zeroAxis: false,
        orient: 'left',
        label: {
          fontFamily: 'Arial',
          fontSize: 8,
          fontWeight: true,
          fill: '#34495E'
        }
      }
    }

    return (
      <View ref="graph" style={styles.container}>
        <Bar data={data} options={options} accessorKey='v'/>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.Colours.backgrounds.light,
  },
});
