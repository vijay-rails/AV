import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { View, StyleSheet, LayoutAnimation, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { default as Theme } from '../../../../lib/theme';
    
export default class Insight extends Component 
{   
  static propTypes = {
    children: PropTypes.element,
    accentColour: PropTypes.string,
    style: PropTypes.object,
    first: PropTypes.bool,
    expandable: PropTypes.bool,
    expandedIcon: PropTypes.node,
    collapsedIcon: PropTypes.node,
    onExpand: PropTypes.func,
    onCollapse: PropTypes.func,
    expandedView: PropTypes.element,
  }

  static defaultProps = {
    first: false,
    accentColour: '#333',
    expandable: false,
    expandedIcon: null,
    collapsedIcon: null,
    onExpand: () => {},
    onCollapse: () => {},
  }
  
  state = {
    expanded: false
  }
  
  componentWillUpdate() {
    LayoutAnimation.configureNext(Theme.Animation.scale);
  }
  
  setNativeProps(props) {
    this.refs['insight'].setNativeProps(props);
  }
  
  renderExpandableIcon() {
    if (!this.props.expandable) {
      return null;
    }
    
    let icon;
    if (this.state.expanded) {
      if (this.props.expandedIcon === null) {
        icon = (
          <Icon
            name={'keyboard-arrow-up'} 
            size={24} 
            color={'#333'} 
            backgroundColor={'transparent'} 
            style={{ marginRight: 0 }}
          />
        );
      }
      else {
        icon = this.props.expandedIcon;
      }
    }
    // collapsed
    else {
      if (this.props.collapsedIcon === null) {
        icon = (
          <Icon 
            name={'keyboard-arrow-down'} 
            size={24} 
            color={'#333'}
            backgroundColor={'transparent'} 
            style={{ marginRight: 0 }}
          />          
        );
      }
      else {
        icon = this.props.collapsedIcon;
      }
    }
    
    return (
      <View style={[{ position: 'absolute', top: 0, right: 0 }]}>
        {icon}
      </View>
    );
  }
  
  renderExpansion() {
    if (!this.state.expanded) {
      return null;
    }
    
    return (
      <View style={{ }}>
        {this.props.expandedView}
      </View>
    );
  }
  
  render() {
    const { first, accentColour } = this.props;

    let style = {};
    if (first) {
      style = { marginTop: 10 };
    }
    
    return (
      <TouchableOpacity ref="insight" activeOpacity={1} focusedOpacity={1} onPress={() => {
        if (!this.state.expanded) {
          this.setState({
            expanded: true
          });
          this.props.onExpand();
        }
        else {
          this.setState({
            expanded: false
          });
          this.props.onCollapse();
        }
      }}>
        <View style={[styles.container, Theme.Styles.elevation, style ]} elevation={3}>
          <View style={{ width: 10, backgroundColor: accentColour }}></View>
          <View style={[ Theme.Styles.f1 ]}>
            {this.props.children}
            {this.renderExpansion()}
            {this.renderExpandableIcon()}
          </View>
        </View>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    marginBottom: 10,
    backgroundColor: Theme.Colours.backgrounds.light,
  }
});
