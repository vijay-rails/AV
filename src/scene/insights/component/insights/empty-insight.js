import Moment from 'moment';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { default as Theme } from '../../../../lib/theme';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default class EmptyInsight extends Component 
{
  static propTypes = {
    style: PropTypes.object
  }
	
  setNativeProps(props) {
    this.refs['insight'].setNativeProps(props);
  }

  render() {   
    let colour = Theme.Colours.black;
    return (
      <View ref="insight" style={[styles.container, Theme.Styles.elevation]} elevation={3}>
        <View style={{ width: 10, backgroundColor: colour }}></View>
        <View style={[ Theme.Styles.row, Theme.Styles.f1, { paddingHorizontal: 5, paddingVertical: 10 } ]}>
          <View style={{ marginRight: 5 }}>
            <Icon 
              name={'notifications-none'} 
              size={24}
              color={colour} 
            />
          </View>
          <View style={[ Theme.Styles.column, Theme.Styles.f1, { justifyContent: 'center' } ]}>
            <Text style={[styles.description]}>{'There are no Insights available at the moment'}</Text>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    marginVertical: 10,
    backgroundColor: Theme.Colours.backgrounds.light,
  },
  date: {
    fontSize: Theme.Fonts.fontMedium,
    color: Theme.Colours.black,
    textAlign: 'right',
  },
  description: {
    fontSize: Theme.Fonts.fontLarge,
    color: Theme.Colours.black,
    fontWeight: '400',
  },
});
