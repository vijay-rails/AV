// import Moment from 'moment';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { View, Text, StyleSheet, Image, TouchableHighlight, Platform } from 'react-native';
import { NavigationActions } from 'react-navigation';
import Communications from 'react-native-communications';
import MaterialInitials from 'react-native-material-initials/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { default as Theme } from '../../../../lib/theme';
import Insight from './insight';

import { takeSnapshot } from "react-native-view-shot";
import Share from 'react-native-share';

const ICON_COLOR = Theme.Colours.cardBackground_Grey;
const ICON_COLOR_NULL = Theme.Colours.border;
const TAP_COLOR = 'rgba(127,127,127,0.5)';
const TAP_COLOR_NULL = 'rgba(0,0,0,0)';

const ICON_PERSON = 24;
const ICON_SIZE = 26;

const TapIcon = (name, color, tapColor, onPress) => (
  <TouchableHighlight onPress={onPress} underlayColor={tapColor} style={{ borderRadius: 50, padding: 10 }} >
    <Icon 
      name={name} 
      size={ICON_SIZE} 
      style={ { backgroundColor: 'transparent', color: color } }
      borderRadius={0}
    />
  </TouchableHighlight>  
);

export default class PersonInsight extends Component 
{
  static contextTypes = {
    app: PropTypes.object.isRequired
  }
	
  static propTypes = {
    data: PropTypes.object,
    style: PropTypes.object,
    first: PropTypes.bool,
    accentColour: PropTypes.string,
  }

  static defaultProps = {
    first: false,
    accentColour: Theme.Colours.chartColor1_Green
  }

  constructor(props, context) {
    super(props, context);
    
    this.state = {
      assetDomain: context.app.getAssetServerDomain()
    };
  }

  setNativeProps(props) {
    this.refs['insight'].setNativeProps(props);
  }

  renderAvatar(uri) {
    return (
      <Image 
        resizeMode="contain"
        source={{uri: uri}} 
        style={styles.avatar}
      />
    );
  }

  renderIcon() {
    
    const { data, accentColour } = this.props;

    return (<Icon name={"person"} size={ICON_PERSON} color={accentColour} style={{ alignSelf: 'center' }} />)
    
    let name = data.firstname.concat(' ', data.lastname).trim().toUpperCase();
    if (name.length == 0) {
        name = data.company.toUpperCase();
    }
    if (name.length == 0) {
        name = data.organization.toUpperCase();
    }

    let avatar = null;
    if (typeof data.logoOne === 'string' && data.logoOne.length > 0) {
      avatar = this.renderAvatar(this.state.assetDomain + data.logoOne);
    }
    else if (typeof data.logoTwo === 'string' && data.logoTwo.length > 0) {
      avatar = this.renderAvatar(this.state.assetDomain + data.logoTwo);
    }

    return (
      <View style={styles.avatarContainer}>
        {avatar}
      </View>
    );
  }  

  renderShareIcon(refs) {
    color = ICON_COLOR;
    tapColor = TAP_COLOR;

    let icon = TapIcon('share', color, tapColor, () => {   	
      takeSnapshot(refs(), {
        format: "png",
        result: "data-uri",
        //snapshotContentContainer: true
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
      )
      .catch(err => console.log(err))
    });

    return (
      <View style={styles.expandedIcon}>
        {icon}
      </View>
    );
  }

  renderEventIcon() {
    color = ICON_COLOR;
    tapColor = TAP_COLOR;

    let icon = TapIcon('event', color, tapColor, () => {   	
      null;
    });

    return (
      <View style={styles.expandedIcon}>
        {icon}
      </View>
    );
  }
  
  renderPhoneIcon(customer) { 
    let phone, color, tapColor;

    if (customer.phone3.length > 0) {
      phone = customer.phone3;
    }
    else if (customer.phone1.length > 0) {
      phone = customer.phone1;
    }
    else if (customer.phone2.length > 0) {
      phone = customer.phone2;
    }

    color = ICON_COLOR;
    tapColor = TAP_COLOR;

    let icon = TapIcon('phone', color, tapColor, () => {   	
      Communications.phonecall(phone, true);
    });
    
    if (phone == null) {
      color = ICON_COLOR_NULL;
      tapColor = TAP_COLOR_NULL;

      icon = TapIcon('phone', color, tapColor, () => {   
        null;
      });
    }

    return (
      <View style={styles.expandedIcon}>
        {icon}
      </View>
    );
  }

  renderSMSIcon(customer) { 
    
    let phone, color, tapColor;

    if (customer.phone3.length > 0) {
      phone = customer.phone3;
    }
    else if (customer.phone1.length > 0) {
      phone = customer.phone1;
    }
    else if (customer.phone2.length > 0) {
      phone = customer.phone2;
    }

    color = ICON_COLOR;
    tapColor = TAP_COLOR;

    let icon = TapIcon('textsms', color, tapColor, () => {   	
      Communications.text(phone);
    });
    
    if (phone == null) {
      color = ICON_COLOR_NULL;
      tapColor = TAP_COLOR_NULL;

      icon = TapIcon('textsms', color, tapColor, () => {   	 	
        null;
      });
    }

    return (
      <View style={styles.expandedIcon}>
        {icon}
      </View>
    );
  }

  renderEmailIcon(customer) {
  
    let color, tapColor;

    color = ICON_COLOR;
    tapColor = TAP_COLOR;

    const name = customer.firstname.concat(' ', customer.lastname);

    let icon = TapIcon('email', color, tapColor, () => {
      Communications.email([customer.email], null, null, "Checkout Who's attending tonights event!", "Hey "+name+", guess what..."); 
    });
    
    if (customer.email.length === 0) {
      color = ICON_COLOR_NULL;
      tapColor = TAP_COLOR_NULL;

      icon = TapIcon('email', color, tapColor, () => {
        null;
      });
    } 

    return (
      <View style={styles.expandedIcon}>
        {icon}
      </View>
    );
  }
        
  renderDetailIcon(customer) { 

	  const icon = TapIcon('person', Theme.Colours.primaryDark, TAP_COLOR, () => {
      this.context.app.getPerson({ customerid: customer.customer_id })
      .then( data => {
        this.context.app.navigation.navigate('InsightsNavigator', {}, NavigationActions.navigate({
          routeName: 'PeoplePerson',
          params: {
            getTitle: () => {
              return data.firstname.concat(' ', data.lastname);
            },
            ...data
          }
        }));
      });
    });

    return (
      <View style={styles.expandedIcon}>
        {icon}
      </View>
    );
  }
  
  render() {

    const { data, first, accentColour } = this.props;

    const name = data.firstname.concat(' ', data.lastname);

    let style = {};
    // if (first) {
    //   style = { marginTop: 10 };
    // }

    let refStr = new String('snapshot-' + data.customer_id);
    
    return (
      <Insight 
        ref="insight-card"
        expandable
        accentColour={accentColour} 
        first={first}
        expandedView={
          <View style={[{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5, paddingHorizontal: 15 }]}>
            <View style={{ flexDirection: 'row',  justifyContent: 'space-between'}}>
              {this.renderShareIcon(() => this.refs["insight-card"])}
              {this.renderEventIcon()}
              {this.renderPhoneIcon(data)}
              {this.renderSMSIcon(data)}
              {this.renderEmailIcon(data)}
            </View>

            <View style={{ flexDirection: 'row'}}>
              {this.renderDetailIcon(data)}
            </View>
          </View>
        } 
      >
        <View ref="insight" style={[style]} elevation={3}>
          <View style={{ width: 10, backgroundColor: accentColour }}></View>
            <View style={[ Theme.Styles.column, Theme.Styles.f1]}>
              <View style={[Theme.Styles.row, { justifyContent: 'center', alignItems: 'center' }]}>
                <View style={{ padding: 5 }}>
                  {this.renderIcon()}
                </View>

                <View style={[Theme.Styles.f1]}>
                  <Text style={[styles.description]}>{name}</Text>
                </View>
              </View>

              <View style={[ Theme.Styles.column, Theme.Styles.f1, { paddingHorizontal: 10, paddingBottom: 5, justifyContent: 'center' } ]}>              
                <Text style={[styles.description2]}>Is attending {data.performance_name}</Text>
              </View>
            </View>
        </View>
      </Insight>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    marginBottom: 10,
    backgroundColor: Theme.Colours.backgrounds.light,
  },
  date: {
    fontSize: Theme.Fonts.fontMedium,
    color: Theme.Colours.black,
    textAlign: 'right',
  },
  description: {
    fontSize: Theme.Fonts.fontLarge,
    color: Theme.Colours.chartColor1_Green,
    fontWeight: '400',
  },
  description2: {
    fontSize: Theme.Fonts.fontMedium,
    color: Theme.Colours.cardBackground_Grey,
    fontWeight: '400',
  },
  avatar: {
    borderRadius: Platform.OS == 'android' ? 40 : 20,
    height: 40,
    width: 40,
    alignSelf: 'center',
  },
});
