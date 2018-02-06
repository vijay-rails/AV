import isEqual from 'lodash.isequal';
import PropTypes from 'prop-types';
import React, { Component } from 'react'
import { View, Text, StyleSheet, Picker } from 'react-native';

import { default as Theme } from '../lib/theme';

/**
 * @todo This picker is a WIP and requires more work around picker selection
 * 
 * The MultiPickerFilter will recursively build a Picker Selection
 */
export default class MultiPickerFilter extends Component {

  static propTypes = {
    selection: PropTypes.object,
    format: PropTypes.array.isRequired,
    items: PropTypes.object.isRequired,
  }

  static defaultProps = {
    selection: {},
    format: [],
    items: {},
  }

  constructor(props){
    super(props);
    
    this.itemsToState = this.itemsToState.bind(this);
    
    let state = {};

    props.format.forEach( (prop) => {
      state[prop] = props.selection.hasOwnProperty(prop) ? props.selection[prop] : null;
    });

    this.itemsToState(state, props.items, props.format, 0);
    
    this.state = state;
  }

  itemsToState(state, items, formats, level) {
    if (Array.isArray(items)) {
      if (items.length == 1) {
    	if (state[formats[level]] === null) {
    	  state[formats[level]] = items[0];
    	}
      }
    }
    else {
      this.itemsToState(state, Object.keys(items), formats, level);
      if (items.hasOwnProperty(state[formats[level]])) {
    	this.itemsToState(state, items[state[formats[level]]], formats, level + 1);
      }
    }  
  }
  
  getFilter() {
    return this.state;
  }
  
  componentWillReceiveProps(nextProps) {
    if (nextProps.selection !== this.props.selection) {
      let state = {};

      nextProps.format.forEach(prop => {
    	state[prop] = nextProps.selection.hasOwnProperty(prop) ? nextProps.selection[prop] : null;
      });

      this.itemsToState(state, nextProps.items, nextProps.format, 0);
      
      this.setState({
        ...this.state,
        ...state,
      });
    }
  }
  
  shouldComponentUpdate(nextProps, nextState) {
    if (!isEqual(nextProps, this.props) || !isEqual(nextState, this.state)) {
        return true;
    }
    return false;
  }
  
  renderOptions(items) {
    return Object.keys(items).map((prop, idx) => {
      return (<Picker.Item key={idx} label={prop} value={prop} />);
    }, this);
  }
      
  renderPickers(items, key = null, parentLevel = 0) {
	let props;
	if (Array.isArray(items)) {
		props = items;
	}
	else {
		props = key ? Object.keys(items[key]) : Object.keys(items);
	}
	
    if (props.length === 0) {
  	  return null;
    }
    else if (props.length === 1 && !Array.isArray(items)) {
      const propItems = items[props[0]];
      return (
    	<View>
          <Text>{props[0]}</Text>
          {this.renderPickers(propItems)}
        </View>
      );
    }
    else if (props.length === 1 && Array.isArray(items)) {
      return (
        <Text>{props[0]}</Text>
      );
    }
    return (
      <Picker
        selectedValue={this.state[prop]}
        onValueChange={value => {
          let state = {};
      	  state[prop] = value;
          this.setState(state);
        }}
      >
        {this.renderOptions(items[prop])}
      </Picker>
    ); 
  }
  
  render(){
    return (
      <View style={styles.container}>
        {this.renderPickers(this.props.items)}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
  },
});