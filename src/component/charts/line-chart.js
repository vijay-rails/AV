import React, { Component } from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';

import { default as Theme } from '../../lib/theme';

import { VictoryAxis, VictoryLine, VictoryBar, VictoryChart, VictoryTheme  } from "victory-native";

export default class LineChart extends Component {
  render() {
    return (
      <View style={this.props.style}>
        <VictoryChart padding={30} style={{
          parent: {
            borderColor: Theme.Colours.white
          }
        }}>
          <VictoryLine
            style={{
              data: {
                stroke: Theme.Colours.white
                // fill: "blue"
              }
            }}
            data={this.props.data}
            x={this.props.x}
            y={this.props.y}
         />
       </VictoryChart>
      </View>
    );
  }
}