import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { View, Text, StyleSheet, FlatList, LayoutAnimation } from 'react-native';
import BasicActivityIndicator from './basic-activity-indicator';
import SimpleCard from './simple-card';

import { default as Theme } from '../lib/theme';

export default class AnimatedActivityIndicator extends Component {

  static propTypes = {
    animating: PropTypes.bool,
    style: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.number,
    ]),
  }

  static defaultProps = {
    animating: false
  }

  state = {
    data: []
  }
  
  onInterval = () => {
    if (this.state.data.length >= 10) {
      this.setState({
        data: [{}]
      });
    }
    else {
      this.setState({
        data: this.state.data.concat({})
      });
    }
  }
  
  componentWillMount() {
    this._interval = setInterval(this.onInterval, 250);
  }
  
  componentWillUnmount() {
    clearInterval(this._interval);
  }
  
  componentWillUpdate() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    // LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }
  
  _keyExtractor = (item, index) => index;
  
  render() {
    if (!this.props.animating) {
      return null;
    }

    const { data } = this.state;
    
    return (
      <View style={[Theme.Styles.f1, Theme.Styles.center]}>

        <View style={[styles.wrapper]}>
          <FlatList
            data={data}
            keyExtractor={this._keyExtractor}
            renderItem={({item, index}) => {
              return (
                <View style={[Theme.Styles.row, { padding: 10, borderBottomWidth: 1, borderBottomColor: '#333' }]}>
                  <View style={[Theme.Styles.f1]}>
                    <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: '#333' }} >
                    </View>
                  </View>
                 
                  <View style={[Theme.Styles.f4, Theme.Styles.row, { paddingVertical: 15, paddingHorizontal: 5 }]}>
                    <View style={[Theme.Styles.f3, { backgroundColor: '#333' }]} >
                    </View>
                    <View style={[Theme.Styles.f1]} >
                    </View>
                  </View>
                 
                  <View style={[Theme.Styles.f1, Theme.Styles.center]}>
                    <View style={{ width: 30, height: 30, backgroundColor: '#333' }} >
                    </View>
                  </View>
                </View>
              );
            }}
          />
        </View>

        <View style={[styles.wrapper, { backgroundColor: 'rgba(127, 127, 127, 0.4)'}]}>
          {/* overlay */}
        </View>
        
        <SimpleCard style={{ height: 50, width: 50, borderRadius: 25, backgroundColor: Theme.Colours.cardItemBackground_White }}>
          <BasicActivityIndicator animating />
        </SimpleCard>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wrapper: { 
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    flexDirection: 'row',
  }
});