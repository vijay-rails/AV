import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { 
  View, Text, StyleSheet 
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { Card } from 'react-native-material-ui';
import Icon from 'react-native-vector-icons/MaterialIcons';
import InsightCard from './insight-card';
import { default as Theme } from '../lib/theme';

const rightInsightIcon = (name) => {
  return (<Icon name={name} size={26} color={Theme.Colours.white} style={{marginRight: 12}} />);
};
const leftInsightIcon = (name) => {
  return (<Icon name={name} size={26} color={Theme.Colours.white} style={{marginLeft: 12}} />);
};

export default class FundInsightCard extends Component {

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

  renderBody() {
    const { data } = this.props;
    
    return (
      <View style={styles.cardContent}>
        <View style={styles.cardBodyLeft}>
          <View style={styles.avatarContainer}>
            <Icon name={'monetization-on'} size={26} color={Theme.Colours.white} style={{marginRight: 12}} />
          </View>
        </View>
        <View style={styles.cardBodyRight}>
          <Text style={styles.heading}>{data.title}</Text>
        </View>
      </View>
    );
  }
  
  render() {
    return (
      <InsightCard style={{backgroundColor: Theme.Styles.green}}
        cardContent={this.renderBody()}
        drawerContent={this.renderDrawer()}
      />
    );
  }
}

const styles = StyleSheet.create({
  avatar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    borderRadius: 50,
  },
  avatarContainer: {
    flex: 1,
    width: '75%',
    justifyContent: 'center',
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
