import PropTypes from 'prop-types';
import React, { Component } from 'react'
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import SelectMultiple from 'react-native-select-multiple';
import Tags from '../../../component/tags-input';
import SimpleActivityIndicator from '../../../component/simple-activity-indicator';
import { default as Theme } from '../../../lib/theme';

const popupHeight = Dimensions.get('window').height * 0.6;

export default class CustomerProfileFilter extends Component {
  
  static contextTypes = {
    app: PropTypes.object.isRequired
  }

  static propTypes = {
    customerTags: PropTypes.arrayOf(PropTypes.string),
    onCustomerTagPress: PropTypes.func
  }

  static defaultProps = {
    onCustomerTagPress: () => {}
  }
  
  state = { 
    items: [],
    loading: true,
    selected: [] 
  }

  componentWillMount() {
    this.context.app.getCustomerKeywords()
    .then( data => {
      const items = [];
      for ( prop in data ) {
        items.push({
          label: data[prop],
          value: prop
        });
      }
      
      const selected = [];
      this.props.customerTags.forEach( item => {
        // if the item is in data, add item to selected
        if (data.hasOwnProperty(item)) {
          selected.push({
            label: data[item],
            value: item
          })
        }
      });
      
      this.setState({
        items: items,
        loading: false,
        selected: selected
      });
    });
  }
  
  onSelectionsChange = (selected) => {
    // selectedFruits is array of { label, value }
    this.setState({ selected })
  }
  
  getFilter() {
    // return Object.assign({}, { customerTags: this.refs.customerTags.getTags() });
    return Object.assign({}, { customerTags: this.state.selected.map( item => item.value ) });
  }
  
  renderLoading() {
    return (<SimpleActivityIndicator animating />);
  }
  
  renderSelector() {
    const { loading } = this.state;
    
    if (loading) {
      return this.renderLoading();
    }
    
    return (
      <SelectMultiple
        items={this.state.items}
        selectedItems={this.state.selected}
        onSelectionsChange={this.onSelectionsChange} />
    );
  }
  
  render() {
    return (
      <View style={[styles.container, Theme.Styles.column]}>
        <Text>{'Customer Keywords'}</Text>
        <ScrollView style={{height: popupHeight, marginTop: 5}}>
          {/*<Tags ref="customerTags" initialTags={this.props.customerTags} onTagPress={this.props.onCustomerTagPress} />*/}
          {this.renderSelector()}
        </ScrollView>
      </View>
    )
  }
}


const styles = StyleSheet.create({
  container: {

  },
});