import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableHighlight, PixelRatio } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ExpandCorner from './expand-corner';
import { default as Theme } from '../../lib/theme';

export default class SimpleTile extends Component {

  static propTypes = {
    icon: PropTypes.string,
    label: PropTypes.string,
    textColour: PropTypes.string,
    backgroundColour: PropTypes.string,
    gridHeight: PropTypes.number,
    expandable: PropTypes.bool,
    onExpand: PropTypes.func,
    onLayout: PropTypes.func,
    children: PropTypes.node,
  }
  
  static defaultProps = {
    icon: null,
    gridHeight: 4,
    backgroundColour: Theme.Colours.white,
    expandable: false,
    onExpand: () => {},
    onLayout: () => {}
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
        <View style={[Theme.Styles.f1, Theme.Styles.column]}>
          <View style={[Theme.Styles.f2, Theme.Styles.row, { alignItems: 'center' }]}>
            {this.renderIcon()}
            {this.renderLabel()}
          </View>
          <View style={[Theme.Styles.f9, Theme.Styles.row]} onLayout={this.props.onLayout}>
            {children}
          </View>
        </View>
      </TouchableHighlight>
    );
  }
}

const styles = StyleSheet.create({
  label: {
    textAlign: 'left',
    fontSize: Theme.Fonts.fontMedium,
    padding: 0,
  }
});