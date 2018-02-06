
import React, { Component } from 'react';
import {Select, Option} from "react-native-chooser";
import {
  StyleSheet,
  Text,
  View
} from 'react-native';

import { default as Theme } from '../lib/theme';

export default class TimeframeDropdown extends Component {
  constructor(props) {
    super(props);

    this.onSelect = this.onSelect.bind(this);
  }
  
  onSelect(data) {
    alert(data);
  }

  render() {
    return (
      <View >
        <Select
          onSelect={this.onSelect}
          defaultText="Select Me Please"
          style={{ borderWidth: 0 }}
          textStyle={[Theme.Fonts.textLarge, { color: Theme.Colours.black }]}
          backdropStyle={{backgroundColor : "transparent"}}
          optionListStyle={{backgroundColor : Theme.Colours.cardItemBackground_White}}
        >
          <Option value="yesterday">Yesterday</Option>
          <Option value="last-week">Last Week</Option>
          <Option value="last-month">Last Month</Option>
          <Option value="last-year">Last Year</Option>
          <Option value="custom">Custom</Option>
        </Select>
      </View>
    );
  }
}

TimeframeDropdown.propTypes = {

};