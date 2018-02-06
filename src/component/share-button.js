import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { takeSnapshot } from "react-native-view-shot";
import Share from 'react-native-share';
import { default as Theme } from '../lib/theme';

export default class ShareButton extends Component {
  
  static propTypes = {
    viewRef: PropTypes.func,
    color: PropTypes.string,
    size: PropTypes.number
  }

  static defaultProps = {
    size: 24,
    color: Theme.Colours.backgrounds.primary
  }
    
  render() {    
    return (
      <Icon.Button 
        name={'share'} 
        size={this.props.size} 
        color={this.props.color} 
        backgroundColor="transparent"
        iconStyle={{marginLeft: 0, marginRight: 0}} 
        onPress={() => {
          
          takeSnapshot(this.props.viewRef(), {
            format: "png",
            result: "data-uri",
            // snapshotContentContainer: true
          })
          .then(
             uri => { 
               console.log("--- Image saved to", uri);
               Share.open({
                 url: uri
               })
               .catch((err) => { err && console.log('--- share err', err); })
             },
             error => console.error("--- Oops, snapshot failed", error)
          );

        }}
      />
    );
  }
}

const styles = StyleSheet.create({

});