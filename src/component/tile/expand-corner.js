import tinycolor from 'tinycolor2';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { default as Theme } from '../../lib/theme';

export default class ExpandCorner extends Component {

  static propTypes = {
    textColour: PropTypes.string,
    backgroundColour: PropTypes.string,
    onPress: PropTypes.func
  }
  
  setNativeProps(props) {
    this.refs['corner'].setNativeProps(props);
  }
  
  render() {
    const { textColour, backgroundColour, onPress } = this.props;
    const sliceColour = tinycolor(backgroundColour).darken(15).toString();

    return (
      <View style={{
        position: 'absolute', right: 0, top: 0, bottom: 0
      }}>
        <View 
          style={[{
            width: 25, 
            height: 25, 
            backgroundColor: 'transparent', 
            justifyContent: 'center',
          }]}
        >
          <Icon 
            name={'arrow-drop-down'} 
            size={36} 
            color={Theme.Colours.greyLight} 
            style={[{ 
              alignSelf: 'center', 
              transform: [
                { rotateZ: '-135deg' }, 
                { translateX: -5 }, 
                { translateY: 5 }
              ] 
            }]} 
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  shadow: {
    shadowColor: Theme.Colours.border,
    shadowOffset: {
      width: 0,
      height: 1
    },
    shadowRadius: 1,
    shadowOpacity: 0.5, // 0.75,
    elevation: 3
  }
});
