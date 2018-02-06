import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { takeSnapshot } from "react-native-view-shot";
import ShareButton from '../share-button';
import { default as Theme } from '../../lib/theme';

export default class GaugeTile extends Component {
  
  static propTypes = {
    icon: PropTypes.string,
    label: PropTypes.string,
    title: PropTypes.string,
    textColour: PropTypes.string,
    children: PropTypes.node,
    legend: PropTypes.array
  }

  static defaultProps = {
    legend: [],
    title: null,
    icon: null
  }

  state = {
    height: 0
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
  
  renderLabel() {
    const { label, textColour } = this.props;
    
    if (typeof label === 'undefined' || label === null || label.length === 0) {
      return null;
    }

    return (
      <Text style={[styles.label, { color: textColour }]}>{label}</Text>
    );
  }
  
  renderLegend() {
    if (this.props.legend.length === 0) {
      return null;
    }
    
    return this.props.legend.map( (data,i) => {
      return (
        <View key={i} style={{ flex: 1, flexDirection: 'row', margin: 8 }}>
          <View style={{ height: 20, width: 20, backgroundColor: data.colour }}>
          </View>
          <View style={{ justifyContent: 'center' }}>
            <Text style={[Theme.Styles.h6, { marginLeft: 5, color: Theme.Colours.black }]}>{data.value}</Text>
          </View>
        </View>
      );
    });
  }
  
  renderTitle() {
    const { title } = this.props;
    
    if (typeof title === 'undefined' || title === null || title.length === 0) {
      return null;
    }
    
    return (
      <View style={{ }}>
         <Text style={{ fontFamily: Theme.PrimaryFontBolded, fontSize: Theme.Fonts.h2, color: Theme.Colours.black, textAlign: 'center' }}>{title}</Text>
      </View>
    );
  }
  
  render() {
    const { style, children, title } = this.props;
    const height = this.state.height;
    
    return (
      <View 
        ref="tile" 
        style={[Theme.Styles.column, style, { height: height, overflow: 'hidden' }]} 
        onLayout={ e => { this.setState({ height: e.nativeEvent.layout.width }); }}
      >
        <View style={[Theme.Styles.row, { flex: 0.8, alignItems: 'center' }]}>
        {this.renderIcon()}
        {this.renderLabel()}
        </View>
        <View style={[Theme.Styles.column, { flex: 7.2  }]}>
          {children}
          {this.renderTitle()}
        </View>
        <View style={[Theme.Styles.column, { flex: 2 }]}>
        {this.renderLegend()}
        </View>
        <View style={{ position: 'absolute', right: 0, bottom: 0 }}>
          <ShareButton viewRef={() => this.refs["tile"]} />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  label: {
    textAlign: 'left',
    fontSize: Theme.Fonts.h6,
    lineHeight: Theme.Fonts.leadSmall1,
    marginLeft: 5,
    marginTop: 0,
    padding: 0,
  }
});