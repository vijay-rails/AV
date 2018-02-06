import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { View, Text, StyleSheet, Image, WebView } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { Card } from 'react-native-material-ui';
import Icon from 'react-native-vector-icons/MaterialIcons';
import InsightCard from './insight-card';
import AutoWebView from './auto-webview';

import { default as Theme } from '../lib/theme';

const leftInsightIcon = (name) => {
  return (<Icon name={name} size={26} color={Theme.Colours.white} style={{marginLeft: 12}} />);
};

export default class EventInsightCard extends Component {

  static propTypes = {
    data: PropTypes.object,
  }

  renderDrawer() {   
    return (
      <View style={styles.cardContent}>
        <View style={styles.leftIcons}>
          {leftInsightIcon('share')}
        </View>
        <View style={styles.rightIcons}>
        </View>
      </View>
    );
  }
  
  renderWebView() {
    const { data } = this.props;
    
    if (data.insighthtml == null || data.insighthtml.length == 0) {
      return null;
    }

    return (
      <AutoWebView html={data.insighthtml} style={{ backgroundColor: 'transparent' }} />
    );
  }
  
  renderBody() {
    const { data } = this.props;

    if (!data) {
        return null;
    }

    return (
      <View style={styles.cardContent}>
        <View style={styles.cardBodyLeft}>
          <View style={styles.iconContainer}>
            <Icon name={'event'} size={36} color={Theme.Colours.white} />
          </View>
        </View>
        <View style={styles.cardBodyRight}>
          <Text style={styles.heading}>{data.title}</Text>
          {this.renderWebView()}
        </View>
      </View>
    );
  }
  
  render() {
    return (
      <InsightCard style={{backgroundColor: Theme.Colours.chartColor2_Purple}}
        cardContent={this.renderBody()}
        drawerContent={this.renderDrawer()}
      />
    );
  }
}

const styles = StyleSheet.create({
  icon: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  iconContainer: {
    flex: 1,
    width: '75%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  heading: {
    color: Theme.Colours.white,
    fontSize: Theme.Fonts.fontLarge,
    fontWeight: 'bold'
  },
  cardContent: {
    flex: 1, 
    flexDirection: 'row', 
  },
  cardBodyLeft: {
    flex: 0.20,
    alignItems: 'center',
  },
  cardBodyRight: {
    flex: 0.80,
    justifyContent: 'center',
  },
  cardFooter: {
    flex: 0.25,
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(28, 31, 42, 0.207843)',
    paddingVertical: 8
  },
  leftIcons: {
    flex: 0.15,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  rightIcons: {
    flex: 0.85,
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexDirection: 'row',
  }
});
