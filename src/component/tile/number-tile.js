import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { View, Text, StyleSheet, PixelRatio, TouchableHighlight } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ExpandCorner from './expand-corner';
import { default as Theme } from '../../lib/theme';

export default class NumberTile extends Component {
  
  static propTypes = {
    icon: PropTypes.string,
    label: PropTypes.string,
    value: PropTypes.string,
    alignValue: PropTypes.string,
    textColour: PropTypes.string,
    backgroundColour: PropTypes.string,
    gridHeight: PropTypes.number,
    maxFontSize: PropTypes.number,
    expandable: PropTypes.bool,
    onExpand: PropTypes.func,
    children: PropTypes.element,
  }

  static defaultProps = {
    icon: null,
    alignValue: 'left',
    gridHeight: 4,
    maxFontSize: 64,
    backgroundColour: Theme.Colours.white,
    expandable: false,
    onExpand: () => {}
  }

  state = {
    height: 0,
    width: 0,
  }
  
  setNativeProps(props) {
    this.refs['tile'].setNativeProps(props);
  }
  
  renderIcon() {
    const { icon, textColour } = this.props;
    
    if (typeof icon === 'undefined' || icon === null || icon.length === 0) {
      return null;
    }

    return (
      <View style={{ marginLeft: 5 }}>
        <Icon name={icon} size={22} color={textColour} style={{ marginLeft: 0, marginRight: 0 }}/>
      </View>
    ); 
  }
  
  renderExpandable() {
    const { textColour, backgroundColour, expandable } = this.props;
    
    if (!expandable) {
      return null;
    }
    
    return (<ExpandCorner textColour={textColour} backgroundColour={backgroundColour}  />);
  }
  
  renderLabel() {
    const { label, textColour, backgroundColour, expandable } = this.props;
    
    if (typeof label === 'undefined' || label === null || label.length === 0) {
      return null;
    }

    let fontSize = (PixelRatio.getPixelSizeForLayoutSize(this.state.width) / label.length) / (PixelRatio.get() / 1.1);
    if (fontSize > 13) {
      fontSize = 13;
    }
    
    return (
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-start'}}>
        <View style={{ margin: 5 }}>
          <Text style={[styles.label, { color: textColour }]}>{label}</Text>
        </View>
        {this.renderExpandable()}
      </View>
    );
  }
  
  renderValue() {
    let { value } = this.props;
    const { textColour, maxFontSize } = this.props;
    
    if (typeof value === 'undefined' || value === null || value.length === 0) {
      return null;
    }

    let fontSize = (PixelRatio.getPixelSizeForLayoutSize(this.state.width) / value.length) / (PixelRatio.get() / 1.5);
    if (fontSize > maxFontSize) {
      fontSize = maxFontSize;
    }

    return (
      <View style={{ flexDirection: 'row', paddingVertical: 5, paddingHorizontal: 10 }}>
        <Text style={[styles.value, { flex: 1, color: textColour, fontSize: fontSize, textAlign: this.props.alignValue }]}>{value}</Text>
      </View>
    );
  }
  
  render() {
    const { style, children, backgroundColour, gridHeight, expandable } = this.props;
    
    const height = this.state.height;

    const { onExpand } = this.props;
    let onPress = () => {};
    if (expandable) {
      onPress = onExpand;
    }
    
    return (
      <TouchableHighlight 
        ref="tile"         
        style={[{flexDirection: 'column', backgroundColor: backgroundColour, height: height, overflow: 'hidden' }]}
        underlayColor={backgroundColour}
        onLayout={ e => {
          this.setState({ height: (e.nativeEvent.layout.width * (gridHeight / 4)), width: e.nativeEvent.layout.width }); 
        }}
        onPress={onPress}
      >
        <View style={{ flex: 1, padding: 5 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {this.renderIcon()}
          {this.renderLabel()}
          </View>
          <View style={{ flexDirection: 'row', flex: 1, alignItems: 'flex-start' }}>
          {this.renderValue()}
          </View>
          {this.props.children}
        </View>
      </TouchableHighlight>
    );
  }
}

const styles = StyleSheet.create({
  label: {
    fontSize: Theme.Fonts.fontMedium,
    // lineHeight: Theme.Fonts.leadSmal2,
    textAlign: 'left',
    marginTop: 0,
    padding: 0,
  },
  value: { 
    fontSize: Theme.Fonts.h2,
    // lineHeight: Theme.Fonts.leadLarge2,
    textAlign: 'left',
    marginLeft: 0,
    fontWeight: '500',
    margin: 0,
    // lineHeight: 64,
  }
});