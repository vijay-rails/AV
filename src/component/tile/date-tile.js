import Moment from 'moment';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { View, Text, StyleSheet, PixelRatio, TouchableHighlight } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ExpandCorner from './expand-corner';

export default class DateTile extends Component {

  static propTypes = {
    icon: PropTypes.string,
    label: PropTypes.string,
    date: PropTypes.string,
    alignValue: PropTypes.string,
    textColour: PropTypes.string,
    backgroundColour: PropTypes.string,
    gridHeight: PropTypes.number,
    maxFontSize: PropTypes.number,
    expandable: PropTypes.bool,
    onExpand: PropTypes.func,
  }

  static defaultProps = {
    icon: null,
    alignValue: 'left',
    gridHeight: 4,
    maxFontSize: 64,
    backgroundColour: '#fff',
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
        <Icon name={icon} size={22} color={textColour} />
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
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        <View style={{ flex: 1, margin: 5 }}>
          <Text style={[styles.label, { color: textColour, fontSize: fontSize }]}>{label}</Text>
        </View>
        {this.renderExpandable()}
      </View>
    );
  }
  
  renderValue() {
    let { date } = this.props;
    const { textColour, maxFontSize } = this.props;
    
    /*
    if (typeof date === 'undefined' || date === null || date.length === 0) {
      return null;
    }
    */
   
    let valueLine1 = 'N/A';
    let valueLine2 = null;
    
    if (date !== null) {
      dateMoment = Moment(date); // .format('MMM Do YYYY');
      valueLine1 = dateMoment.format('MM/DD');
      valueLine2 = dateMoment.format('YYYY');
    }

    let fontSize = (PixelRatio.getPixelSizeForLayoutSize(this.state.width) / valueLine1.length) / (PixelRatio.get() / 1.5);
    if (fontSize > maxFontSize) {
      fontSize = maxFontSize;
    }
    
    let fontSizeLine2 = fontSize + (fontSize - (fontSize * 1.35)); 

    const marginBottom = (valueLine2 && valueLine2.length > 0) ? -10 : 0

    return (
      <View style={{ flex: 1, flexDirection: 'column', paddingVertical: 5, paddingHorizontal: 10, justifyContent: 'flex-end' }}>
        <Text
          numberOfLines={1}
          style={[styles.value, { color: textColour, fontSize: fontSize, textAlign: this.props.alignValue, marginBottom: marginBottom }]}
        >{valueLine1}</Text>
        {valueLine2 !== null ?
        <Text
          numberOfLines={1} 
          style={[styles.value, { color: textColour, fontSize: fontSizeLine2, textAlign: this.props.alignValue }]}
        >{valueLine2}</Text> : null}
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
          <View style={{ flexDirection: 'row', flex: 1, alignItems: 'flex-end' }}>
          {this.renderValue()}
          </View>
        </View>
      </TouchableHighlight>
    );
  }
}

const styles = StyleSheet.create({
  label: {
    textAlign: 'left',
    marginTop: 0,
    padding: 0,
  },
  value: {
    textAlign: 'left',
    marginLeft: 3,
    fontWeight: '500',
    margin: 0,
    // lineHeight: 64,
  }
});