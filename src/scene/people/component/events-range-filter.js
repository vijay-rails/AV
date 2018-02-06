import PropTypes from 'prop-types';
import React, { Component } from 'react'
import { View, Text, StyleSheet } from 'react-native';
import NumberRangeSliderFilter from '../../../component/number-range-slider-filter';

import { default as Theme } from '../../../lib/theme';

export default class EventsRangeFilter extends Component {

  static propTypes = {
    min: PropTypes.number,
    max: PropTypes.number,
  }

  static defaultProps = {
    min: 0,
    max: null
  }
  
  getFilter = () => {
    return Object.assign({}, this.refs.numberEventsRange.getFilter());
  }
  
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>{'Number of Events Attended'}</Text>
        <NumberRangeSliderFilter ref="numberEventsRange" min={this.props.min} max={this.props.max} />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {

  },
  heading: {
	fontFamily: 'Roboto',
	fontSize: Theme.Fonts.fontLarge,
  }
});