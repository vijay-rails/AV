import PropTypes from 'prop-types';
import React, { Component } from 'react'
import { View, StyleSheet, Picker } from 'react-native';

import { default as Theme } from '../lib/theme';

export default class PickerFilter extends Component {
  static propTypes = {
    type: PropTypes.string,
    items: PropTypes.array,
  }

  static defaultProps = {
    type: null,
    items: [],
  }
  
  constructor(props){
    super(props);
    this.state = {
      type: props.type,
    };
  }

  getFilter = () => {
    return this.state;
  }
  
  componentWillReceiveProps(nextProps) {
    if (nextProps.type !== this.props.type) {
      this.setState({
        type: nextProps.type,
      });
    }
  }
  
  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.type !== this.props.type 
            || nextState.type !== this.state.type) {
        return true;
    }
    return false;
  }
  
  renderOptions() {    
    return this.props.items.map((item, idx) => {
      return (<Picker.Item key={idx} label={item.value} value={item.key} />);
    }, this);
  }
      
  render(){
    return (
      <View style={styles.container}>
        <Picker
          selectedValue={this.state.type}
          onValueChange={value => this.setState({type: value})}
        >
          {this.renderOptions()}
        </Picker>
      </View>
    )
  }
}
  
const styles = StyleSheet.create({
  container: {
  },
});