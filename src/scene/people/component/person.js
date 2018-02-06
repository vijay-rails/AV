import * as d3 from 'd3-format';
import { default as ACC } from 'accounting'; 
import Moment from 'moment';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Platform,
  TouchableHighlight,
  Button,
  UIManager,
  LayoutAnimation,
  ScrollView,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Communications from 'react-native-communications';
import MaterialInitials from 'react-native-material-initials/native';
import getDirections from 'react-native-google-maps-directions'
import { TabBarTop, TabNavigator } from 'react-navigation';
// import randomColor from 'randomcolor';s
import { default as Theme } from '../../../lib/theme';
import PersonActivity from './person-activity';
import PersonDetails from './person-details';
import PersonEvents from './person-events';
import ShareButton from '../../../component/share-button';

import PopoverView from '../../../component/popover-view';
import PopoverViewMenuButton from '../../../component/popover-view-menu-button';

import { Animation } from '../../../lib/animation';
import { captureScreen  } from "react-native-view-shot";
import Share from 'react-native-share';


const ICON_SIZE = Theme.Fonts.h3;

const HEADER_MAX_HEIGHT = 123;
const HEADER_MIN_HEIGHT = Platform.OS === 'ios' ? 20 : 43;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

const IS_TOP_MENU_NAV = 1;
const IS_TOGGLE_MENU_NAV = 2;

const winWidth = Dimensions.get('window').width;

const HeaderIcon = (name, onPress) => (
<TouchableHighlight onPress={onPress} underlayColor={'rgba(127,127,127,0.5)'} style={{ borderRadius: 50, padding: 10 }} >
  <Icon 
    name={name} 
    size={ICON_SIZE} 
    color={Theme.Colours.white} 
    backgroundColor={'transparent'}
    // iconStyle={{marginLeft: 10}}
    borderRadius={0}
  />
</TouchableHighlight>  
);

const ToggleMenuItem = (icon, label, props, onPress) => (
  <PopoverViewMenuButton label={label} showIcon={icon} action={onPress} onClosed={props} style={{ marginRight: 25, marginLeft: 10 }} /> 
);

const PersonDetailsNavigator = TabNavigator({
  PersonDetailsTab: {
    screen: PersonDetails
  },
  PersonEventsTab: {
    screen: PersonEvents
  },
  PersonActivityTab: {
    screen: PersonActivity
  },
},{
  lazy: true,
  tabBarPosition: 'top',
  tabBarOptions: {
    activeTintColor: '#fff',
    inactiveTintColor: Theme.Colours.tabs.inactive,
    indicatorStyle: {
      backgroundColor: Theme.Colours.tabs.active,
      height: 5
    },
    style: {
      backgroundColor: Theme.Colours.backgrounds.primary,
      borderTopWidth: 0,
      borderTopColor: 'transparent'
    },
    labelStyle: {
      fontFamily: 'Roboto',
      fontSize: Theme.Fonts.fontMedium,
    },
    tabStyle: {
      paddingBottom: Platform.OS === 'android' ? 10 : 15
    }
  },
  tabBarComponent: props => {
    let tabBarOptionsStyle = [
      Theme.Styles.elevation, {
      backgroundColor: Theme.Brand.primary,
      borderTopWidth: 0,
      borderTopColor: 'transparent',
      // actions: PropTypes.arrayOf(PropTypes.string).isRequired,
      // onPressPopUpMenu: PropTypes.func.isRequired
    }];

    if (props.navigationState.routes[props.navigationState.index].key == 'PersonEventsTab') {
      tabBarOptionsStyle.push({
        elevation: 0,
        shadowColor: 'transparent',
        shadowOffset: {
          width: 0,
          height: 0
        },
      });
    }
    
    return (
      <TabBarTop 
        {...props} 
        indicatorStyle={{ backgroundColor: Theme.Colours.white, height: 5 }}
        style={[ tabBarOptionsStyle ]}
      />
    );
  }
});

export default class Person extends Component {

  static contextTypes = {
    app: PropTypes.object.isRequired
  }

  constructor(props, context) {
    super(props, context);

    this.toggleMenu = this.toggleMenu.bind(this);
    this.toggleHeader = this.toggleHeader.bind(this);
    this.renderShareIcon = this.renderShareIcon.bind(this);

    const { params: customer } = this.props.navigation.state;
    
    this.state = {
      favourite: this.context.app.isFavouritePerson(customer.customerid),
      isHidden: false,
      collapseHidden: false,
      scrollPosition: 0,
      headerDisplay: false,

      loading: true,
      error: false,
      mostRecentOrder: null,
      mostRecentGift: null,
      totalSpend: null,
      totalPledged: null, 
      totalGiven: null,
      scrolling: false,
    }

    if (Platform.OS === 'android') {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }

  static navigationOptions = ({ navigation }) => ({
    header: false
  });

  renderPhoneIcon(customer, nav) { 
    let phone = null;
    if (customer.phone3.length > 0) {
      phone = customer.phone3;
    }
    else if (customer.phone1.length > 0) {
      phone = customer.phone1;
    }
    else if (customer.phone2.length > 0) {
      phone = customer.phone2;
    }
    if (phone === null) {
      return null;
    }

    if(nav === IS_TOP_MENU_NAV) {
      return HeaderIcon('phone', () => {    
        Communications.phonecall(phone, true);
      });
    } 
    else if (nav === IS_TOGGLE_MENU_NAV) {
      return ToggleMenuItem('phone', "Phone", null, () => {     
        Communications.phonecall(phone, true);
      });
    }
  }

  renderSMSIcon(customer, nav) { 
    let phone = null;
    if (customer.phone3.length > 0) {
      phone = customer.phone3;
    }
    else if (customer.phone1.length > 0) {
      phone = customer.phone1;
    }
    else if (customer.phone2.length > 0) {
      phone = customer.phone2;
    }
    if (phone === null) {
      return null;
    }

    if(nav === IS_TOP_MENU_NAV) {
      return HeaderIcon('textsms', () => {    
        Communications.text(phone);
      });
    }
    else if (nav === IS_TOGGLE_MENU_NAV) {
      return ToggleMenuItem('textsms', "SMS", null, () => {     
        Communications.text(phone);
      });
    }
  }
  
  renderEmailIcon(customer, nav) {
    if (customer.email.length == 0) {
      return null;
    }

    if(nav === IS_TOP_MENU_NAV) {
      return HeaderIcon('email', () => {
        Communications.email([customer.email], null, null, null, null);
      });
    } 
    else if (nav === IS_TOGGLE_MENU_NAV) {
      return ToggleMenuItem('email', "Email", null, () => {
        Communications.email([customer.email], null, null, null, null);
      });
    }
  }
  
  renderInitials(customer) {
    const name = customer.firstname.concat(' ', customer.lastname);
    const color = Theme.Rainbow[customer.hashCode % 15]; // randomColor.randomColor();
    
    return (
      <MaterialInitials
        style={{alignSelf: 'center'}}
        backgroundColor={color}
        color={Theme.Colours.white}
        size={75}
        text={name}
        single={false}
      />
    );
  }  

  renderGetDirectionsIcon(customer, nav) {
    /*
     * if (customer.addresslng.length == 0 || customer.addresslat.length == 0) {
     * return null; }
     */
    const userLocation = this.context.app.getLocation();

    // console.log(' --- user location --- ', userLocation);

    if (userLocation === null || !userLocation.hasOwnProperty('coords')) {
      return null;
    }

    if ( nav === IS_TOP_MENU_NAV ) {
      return HeaderIcon('directions', () => {
        const userLocation = this.context.app.getLocation();

        if (userLocation === null || !userLocation.hasOwnProperty('coords')) {
          return;
        }

        const data = {
            source: {
              latitude: Number(userLocation.coords.latitude),
              longitude: Number(userLocation.coords.longitude),
            },
            destination: {
              latitude: 31.801889, // Number(customer.addresslat),
              longitude: -85.9572283, // Number(customer.addresslng),
            }
        };

        getDirections(data);
      });
    } 
    else if (nav === IS_TOGGLE_MENU_NAV) {
      return ToggleMenuItem('directions', "Directions", null, () => {
        const userLocation = this.context.app.getLocation();

        if (userLocation === null || !userLocation.hasOwnProperty('coords')) {
          return;
        }

        const data = {
            source: {
              latitude: Number(userLocation.coords.latitude),
              longitude: Number(userLocation.coords.longitude),
            },
            destination: {
              latitude: 31.801889, // Number(customer.addresslat),
              longitude: -85.9572283, // Number(customer.addresslng),
            }
        };

        getDirections(data);
      });
    }
  }
  
  renderShareIcon(refs, nav) {
    if (nav == IS_TOP_MENU_NAV) {
      return (
        HeaderIcon('share', () => {
          captureScreen ({
            format: "webm",
            quality: 0.8
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
        })
      )
    }
    else if (nav == IS_TOGGLE_MENU_NAV) {
      let that = this;
      var sharePressed = false;

      return (
        ToggleMenuItem('share', "Share", 
        () => {
          if (sharePressed) {
            setTimeout(() => {
              captureScreen ({
                format: "webm",
                quality: 0.8
              })
              .then(
                  uri => {
                    console.log("--- Image saved to", uri);
                    Share.open({  
                      url: uri
                    })
                    .catch((err) => { err && console.log('--- share err', err); })
                  },
                  error => console.error("--- Oops, snapshot failed. What did you do?", error)
                )
                .catch(err => console.log(err)
              )
            }, 10).bind(this);
          }
        },
        () => {
          sharePressed = true;
          that.toggleMenu(); 
        })
      )
    }
  } 

  renderFaveIcon(customer, nav) {
    let FaveIconButton, fave, icon = null;

    if (this.state.favourite) {
      fave = false;
      icon = 'star';
    }
    else { 
      fave = true;
      icon = 'star-border';
    }

    if(nav === IS_TOP_MENU_NAV) {

      return FaveIconButton = HeaderIcon(icon, () => {
        this.FaveIconAttr(fave, customer);
      });
    }
    else if (nav === IS_TOGGLE_MENU_NAV) {

      let label = "Favorite";

      return FaveIconButton = ToggleMenuItem(icon, label, null, () => {
        this.FaveIconAttr(fave, customer);
      }); 
    }
  }
  
  FaveIconAttr(fave, customer) {
    this.context.app.unsetFavouritePerson(customer.customerid);
    this.setState({
      favourite: fave
    });
    this.context.app.emit('list-item-updated', { 
      customerid: customer.customerid,
      command: 'favourite',
      state: {
      favourite: fave 
      }
    })
  }

  toggleMenu() {
    this.setState({
      isHidden: !this.state.isHidden
    })
  }
  
  toggleHeader(event) {
    if (event.nativeEvent.contentOffset.y == 0) {
      this.setState({
        headerDisplay: false
      })
    }
    else {
      this.setState({
        headerDisplay: true
      })
    }
  } 

  componentWillUpdate(nextProps, nextState) {
    if (this.state.headerDisplay != nextState.headerDisplay) {

      if (Platform.OS === 'android') {
        LayoutAnimation.configureNext(Animation.scale);
      } else {
        LayoutAnimation.configureNext(Animation.scaleIOS);
      }
    } 
  }
  
  setViewShot(ref) {
    this.setState({
        viewShotRef: ref
    })
  } 
  
  renderPopup (customer) {
      if (this.state.isHidden) {
          return (
            <PopoverView visible={true} onPress={this.toggleMenu} style={{ position: 'absolute', right: 0, top: 0, paddingRight: 8 }}>
              {this.renderFaveIcon(customer, IS_TOGGLE_MENU_NAV)}
              {this.renderPhoneIcon(customer, IS_TOGGLE_MENU_NAV)}
              {this.renderSMSIcon(customer, IS_TOGGLE_MENU_NAV)}
              {this.renderEmailIcon(customer, IS_TOGGLE_MENU_NAV)}
              {this.renderGetDirectionsIcon(customer, IS_TOGGLE_MENU_NAV)}
              {this.renderShareIcon(() => this.refs["person"], IS_TOGGLE_MENU_NAV)}
            </PopoverView>
          );
      } else {
          return null;
      } 
  }

  renderHeader(customer, CloseIconButton) {
    let nameCutOffMain = winWidth * 0.70;
    let nameCutOffToggle = winWidth * 0.75;
    console.log(`Name CUTOFF MAIN: ${nameCutOffMain}`);
    console.log(`Name CUTOFF TOGGLE: ${nameCutOffToggle}`);

    // let firstName = 'RichardsonMike';
    // let lastName = 'YongSueYoungeLiangL';
    let firstName = customer.firstname;
    let lastName = customer.lastname;
    let fullName = firstName.concat(' ', lastName);

    console.log(`Name Length: ${fullName.length}`);
       if (this.state.headerDisplay) {

            return(
              <View style={[styles.headerCollapse, { flexDirection: 'row' }]}>
    
                    <View style={{ flexDirection: 'column', alignSelf: 'flex-start', zIndex: 1000, top: 8}}>
                      {CloseIconButton}
                    </View>
                      
                    <View style={{ flexDirection: 'column', justifyContent: 'center', width: nameCutOffToggle, top: -3 }}>
                      <Text numberOfLines={1} ellipsizeMode="tail" style={styles.headerNameCollapse}>{fullName}</Text>
                    </View>

                      <View style={{ flexDirection: 'column', justifyContent: 'center', position: 'absolute', right: 0, top: 8 }}>
                        <TouchableHighlight onPress={this.toggleMenu} underlayColor={'rgba(127,127,127,0.5)'} style={{ borderRadius: 50, padding: 10 }}>
                          <Icon
                          style={{ flex: 1 }}
                            name={'more-vert'} 
                            size={ICON_SIZE} 
                            ref={this.onRef}
                            color={Theme.Colours.white} 
                            backgroundColor={'transparent'} 
                            iconStyle={{marginLeft: 0, marginRight: 0, marginTop: 0, marginBottom: 0}}
                            borderRadius={0}
                            onPress={this.toggleMenu}
                          />
                        </TouchableHighlight>
                      </View> 
                </View>
            );
       } else {

          return(
            <View style={[ styles.header ]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View style={{ flexDirection: 'row', alignSelf: 'flex-start', zIndex: 1000 }}>
                    {CloseIconButton}
                  </View>
      
                    <View style={{ flexDirection: 'row', alignSelf: 'flex-end' }}>
                      {this.renderFaveIcon(customer, IS_TOP_MENU_NAV)}
                      {this.renderPhoneIcon(customer, IS_TOP_MENU_NAV)}
                      {this.renderSMSIcon(customer, IS_TOP_MENU_NAV)}
                      {this.renderEmailIcon(customer, IS_TOP_MENU_NAV)}
                      {this.renderGetDirectionsIcon(customer, IS_TOP_MENU_NAV)}
                      {this.renderShareIcon(() => this.refs["person"], IS_TOP_MENU_NAV)}
                    </View>
                </View>
                
               <View style={{ flexDirection: 'row' }}>
                    <View style={{ flexDirection: 'row', paddingHorizontal: 10 }}>
                      {this.renderInitials(customer)}
                    </View>
      
                    <View style={{ flexDirection: 'row' }}>
                      <View style={{ flexDirection: 'column', justifyContent: 'center' }}>
                        <View style={{width: nameCutOffMain}}>
                          <Text numberOfLines={1} ellipsizeMode="tail" style={styles.headerName}>{fullName}</Text>
                        </View>
                        <Text numberOfLines={1} style={[ styles.headerLocation ]}>{customer.addresscity.concat(', ', customer.addressstate)}</Text>
                      </View>
                    </View>
                </View> 
            </View>
          )
       }
  }


  static renderHeadCollapse() {
    
    let styles = [{ flexDirection: 'column', backgroundColor: Theme.Brand.primary }];
    if (Platform.OS === 'ios') {
      styles.push(Theme.Styles.elevation);
    }
    
    return (
      <View style={[ styles.headerCollapse ]} elevation={5}>
      
        <View style={{ flexDirection: 'row', alignSelf: 'flex-start', zIndex: 1000, top: 8}}>
          {CloseIconButton}
        </View>

            <Text numberOfLines={1} style={styles.headerNameCollapse}>{customer.firstname.concat(' ', customer.lastname)}</Text>

            <View style={{ flexDirection: 'column', justifyContent: 'center', position: 'absolute', right: 0, top: 8 }}>

            <TouchableHighlight onPress={this.toggleMenu} underlayColor={'rgba(127,127,127,0.5)'} style={{ borderRadius: 50, padding: 10 }}>
              <Icon
                style={{ flex: 1 }}
                name={'more-vert'} 
                size={ICON_SIZE} 
                ref={this.onRef}
                color={Theme.Colours.white} 
                backgroundColor={'transparent'} 
                iconStyle={{marginLeft: 0, marginRight: 0, marginTop: 0, marginBottom: 0}}
                borderRadius={0}
                onPress={this.toggleMenu}
              />
            </TouchableHighlight>
            </View> 
      </View>
    );  
  }

  render() {

    const { params: customer } = this.props.navigation.state;
    
    const CloseIconButton = HeaderIcon('arrow-back', () => {
      this.props.navigation.goBack(); 
    });

    return (
      <View style={[styles.container]} ref="person">
        {this.renderHeader(customer, CloseIconButton)}
        <PersonDetailsNavigator 
          screenProps={{
            customer: customer, 
            toggleHeader: this.toggleHeader,
          }} 
        />
        {this.renderPopup(customer)}  
      </View>      
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    backgroundColor: Theme.Colours.backgrounds.primary,
  },
  rowCentered: {
    flexDirection: 'row', 
    justifyContent: 'flex-end', 
    alignItems: 'center'
  },
  header: {
    // flex: 0.25,
    flexDirection: 'column',
    backgroundColor: Theme.Brand.primary,
  },
  headerCollapse: {
    // flex: 0.25,
    flexDirection: 'column',
    backgroundColor: Theme.Brand.primary
  },
  avatar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    borderRadius: 50,
    margin: 10
  },
  headerName: {
    fontSize: Theme.Fonts.h4,
    fontFamily: Theme.PrimaryFontBolded,
    color: Theme.Colours.white
  },
  headerNameCollapse: {
    fontSize: Theme.Fonts.h4,
    fontFamily: Theme.PrimaryFontBolded,
    color: Theme.Colours.white,
    position: 'absolute',
    top: 18,
    left: 0
  },
  headerLocation: {
    fontSize: Theme.Fonts.fontMedium,
    color: Theme.Colours.white
  },
  menuButton: {
    marginLeft: 0, marginRight: 0, paddingLeft: 0, paddingRight: 15, marginVertical: 2
  },
    menuText: {
    color: Theme.Colours.black,
    fontWeight: "300",
    fontFamily: 'System',
  },
});
