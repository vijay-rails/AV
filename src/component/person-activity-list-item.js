import Moment from 'moment';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Avatar } from 'react-native-material-ui';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { default as Theme } from '../lib/theme';

const activityTypeIconMap = {
  'AdHoc': {
    icon: 'note',
    colour: '#29B6F6'
  },
  // 'both': '',
  'Business Intelligence': {
    icon: 'playlist-add-check',
    colour: '#1A76AB',
  },
  'CallLog': {
    icon: 'phone',
    colour: Theme.Colours.chartColor3_TurquoiseGreen,
  },
  'Delivery': {
    icon: 'local-shipping',
    colour: Theme.Colours.chartColor3_TurquoiseGreen,
  },
  'Email': {
    icon: 'email',
    colour: '#904799',
  },
  'Forwarding': {
    icon: 'forward',
    colour: '#4CAF50',
  },
  // 'Gifter': '',
  // 'Invoice': '',
  'Message': {
    icon: 'message',
    colour: Theme.Colours.chartColor5_Pink,
  },
  'Offer': {
    icon: 'offer',
    colour: Theme.Colours.chartColor5_Pink,
  },
  // 'Referrer': '',
  // 'Settlement': '',
  // 'normal': '',
  'TaxRecipient': {
    icon: 'receipt',
    colour: '#673AB7',
  },
  'ThankYouLetter': {
    icon: 'mail_outline',
    colour: '#29B6F6',
  }
};

export default class PersonActivityListItem extends Component {

  static propTypes = {
    data: PropTypes.object,
    style: PropTypes.object
  }

  static defaultProps = {
  }
	
  setNativeProps(props) {
    this.refs['item'].setNativeProps(props);
  }

  renderIcon() {

    const { data } = this.props;

    console.log('------------ ICON CALLED');

    if (!activityTypeIconMap.hasOwnProperty(data.correspondenceType)) {
      console.log('----------- ICON CALLED ERR')
      return null;
    }
    
    const { icon } = activityTypeIconMap[data.correspondenceType];

    return (<Icon name={icon} size={36} color={Theme.Colours.black} />)
  }
  
  renderActivityDate(data) {
	let sentDate = null;
	if (data.sent && data.sent.length > 0 && data.sent[0].length > 0) {
	  sentDate = Moment(data.sent[0]).format('MMM Do YYYY, h:mm a');
	}
	else {
	  return null;
	}
	
    return (
      <Text style={[styles.date]}>{sentDate}</Text>
    );
  }

  renderDescription(data) {
    //const { data } = this.props;
    
    console.log('------------ ICON ACT: ', data);
    
    let text = null;
    if (data.desc.length > 0) {
      text = data.desc;
    }
    else if (data.messageSubject.length > 0) {
      text = data.messageSubject;
    }
    else if (data.messageDesc.length > 0) {
      text = data.messageDesc; 
    }
    
    return (
      <Text style={[styles.description]} numberOfLines={3}>{text}</Text>
    );
  }
    
  render() {
    const { data } = this.props;
    if (!data) {
        return null;
    }
    
    let colour = Theme.Colours.black;
    if (activityTypeIconMap.hasOwnProperty(data.correspondenceType)) {
      colour = activityTypeIconMap[data.correspondenceType].colour;
    }
    
    return (
      <View style={[styles.container, Theme.Styles.elevation]} ref="item" elevation={3}>
        <View style={[ Theme.Styles.row, Theme.Styles.f1, { padding: 10 } ]}>
          <View style={{ marginRight: 10 }}>
            {this.renderIcon()}
          </View>
          <View style={[ Theme.Styles.column, Theme.Styles.f1, { justifyContent: 'center' } ]}>
            {/*<Text style={[styles.description]}>{data.correspondenceType}</Text>*/}
            {this.renderDescription(data)}
            {this.renderActivityDate(data)}
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    marginBottom: 6,
    backgroundColor: Theme.Colours.backgrounds.light,
    borderRadius: 2
  },
  date: {
    fontSize: Theme.Fonts.fontMedium,
    color: Theme.Colours.cardBackground_Grey,
    textAlign: 'left',
    // fontWeight: '500',
  },
  description: {
    fontSize: Theme.Fonts.fontMedium,
    color: Theme.Colours.black,
    fontWeight: '400',
  },
});
