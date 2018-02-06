import Moment from 'moment';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  LayoutAnimation,
  TouchableHighlight,
  Platform,
  UIManager,
  Dimensions,
} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialIcons';
import { TabBarTop, TabNavigator } from 'react-navigation';
// import EventInsights from './event-insights';
import { default as Theme } from '../../../lib/theme';
import EventStats from './event-stats';
import EventPeople from './event-people';

import PopoverView from '../../../component/popover-view';
import PopoverViewMenuButton from '../../../component/popover-view-menu-button';

import { Animation } from '../../../lib/animation';
import { takeSnapshot } from "react-native-view-shot";
import Share from 'react-native-share';

const ICON_SIZE = Theme.Fonts.h3;

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
    borderRadius={0}
  />
</TouchableHighlight>  
);

const ToggleMenuItem = (icon, label, props, onPress) => (
  <PopoverViewMenuButton label={label} showIcon={icon} action={onPress} onClosed={props} style={{ marginRight: 25, marginLeft: 10 }} /> 
);

const EventDetailsNavigator = TabNavigator({
  /*
  EventInsightsTab: {
	screen: EventInsights,
	navigationOptions: {
	  title: 'Insights',
	}
  },
  */
  EventStatsTab: {
    screen: EventStats,
  },
  EventPeopleTab: {
    screen: EventPeople,
  }
}, {
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
      backgroundColor: Theme.Brand.primaryDark,
      borderTopWidth: 0,
      borderTopColor: 'transparent',
    },
    labelStyle: {
        fontFamily: 'System',
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
      }
    ];

    if (props.navigationState.routes[props.navigationState.index].key == 'EventPeopleTab') {
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

export default class Event extends Component {

  static contextTypes = {
    app: PropTypes.object.isRequired
  }

  constructor(props, context) {
    super(props, context);

    this.toggleMenu = this.toggleMenu.bind(this);
    this.toggleHeader = this.toggleHeader.bind(this);
    this.renderShareIcon = this.renderShareIcon.bind(this);

    const { params: event } = this.props.navigation.state;
    
    this.state = {
      favourite: context.app.isFavouriteEvent(event.id),
      isHidden: false,
      assetDomain: context.app.getAssetServerDomain(),
      headerDisplay: false,
    }

    if (Platform.OS === 'android') {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }
  
  static navigationOptions = ({ navigation }) => {
    return ({
      header: false
    });
  }

  renderAvatar(uri) {
    return (
      <View style={styles.avatarContainer}>
        <Image 
          resizeMode="contain"
          source={{uri: uri}} 
          style={styles.avatar}
        />
      </View>
    );
  }
  
  renderIcon() {
    return (
      <View style={[styles.avatarContainer, { justifyContent: 'center' } ]}>
        <Icon name={"local-play"} size={36} color={Theme.Colours.border} style={{ alignSelf: 'center' }} />
      </View>
    )
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
    // LayoutAnimation.configureNext(Animation.slideFast);
  } 

  componentWillUpdate(nextProps, nextState) {
    if (this.state.headerDisplay != nextState.headerDisplay) {
      if (Platform.OS === 'android') {
        LayoutAnimation.configureNext(Animation.scale);
      } 
      else {
        LayoutAnimation.configureNext(Animation.scaleIOS);
      }
    }
  }
  
  renderPopup (event) {
    if (this.state.isHidden) {
        return (
          <PopoverView visible={true} onPress={this.toggleMenu} style={{ position: 'absolute', right: 0, top: 0, paddingRight: 8 }}>
            {this.renderFaveIcon(event, IS_TOGGLE_MENU_NAV)}
            {this.renderShareIcon(() => this.refs["event"], IS_TOGGLE_MENU_NAV)}
          </PopoverView>
        );
    } else {
        return null;
    } 
  }

  renderShareIcon(refs, nav) {

      if (nav == IS_TOP_MENU_NAV) {

        return (
          HeaderIcon('share', () => {

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
          })
        )
      }
      else if (nav == IS_TOGGLE_MENU_NAV) {
        let that = this;
        var sharePressed = false;
        
        return (
          ToggleMenuItem('share', "Share", 
          () => {
            console.log("Inside Togggle Menu Item ", sharePressed)
             if (sharePressed) {
              setTimeout(() => {
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
              }, 10);
            }
          },() => {
            sharePressed = true;
            this.toggleMenu(); 
          })
        )
      }
  }

  renderFaveIcon(event, nav) {
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
        this.FaveIconAttr(fave, event);
      });
    }
    else if (nav === IS_TOGGLE_MENU_NAV) {

      let label = "Favorite";

      return FaveIconButton = ToggleMenuItem(icon, label, null, () => {
        this.FaveIconAttr(fave, event);
      }); 
    }
  }
  
  FaveIconAttr(fave, event) {

    this.context.app.unsetFavouriteEvent(event.id);
    this.setState({
      favourite: fave
    });
    this.context.app.emit('list-item-updated', 
    { id: event.id, 
      favourite: fave 
    });
  }
  
  renderHeader() {

    const { params: event } = this.props.navigation.state;

    const CloseIconButton = HeaderIcon('arrow-back', () => {
      this.props.navigation.goBack(); 
    });
    
    let eventDate = Moment(event.startDate[0]).format('MMM Do YYYY, h:mm a');
    
    let venueDesc = null;
    if (event.group.length > 0) {
      venueDesc = event.group.concat(' @ ', event.venueDesc);
    }
    /*
    else if (event.category.length > 0) {
      venueDesc = event.category.concat(' @ ', event.venueDesc);
    }
    */
    else {
      venueDesc = event.venueDesc;
    }
     
    let avatar = null;
    if (typeof event.logoOne === 'string' && event.logoOne.length > 0) {
      avatar = this.renderAvatar(this.state.assetDomain + event.logoOne);
    }
    else if (typeof event.logoTwo === 'string' && event.logoTwo.length > 0) {
      avatar = this.renderAvatar(this.state.assetDomain + event.logoTwo);
    }
    else {
      avatar = this.renderIcon();
    }
    
    let nameCutOffMain = winWidth * 0.70;
    let nameCutOffToggle = winWidth * 0.75;
    let descCutOff = winWidth * 0.75;

    if (this.state.headerDisplay) {
      return (
        <View style={[ styles.headerCollapse ]}>
          <View style={[styles.collapseBackBtn, { zIndex: 1000 }]}>
            {CloseIconButton}
          </View>

          <View style={{ flexDirection: 'column', justifyContent: 'center', width: nameCutOffToggle }}>          
            <Text numberOfLines={1} style={[styles.headerTitleCollapse]}>{event.shortDescription}</Text>
          </View>

          <Text Text style={[styles.headerTimeCollapse ]}>{eventDate}</Text>

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

    return(
      <View style={[ styles.header ]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignSelf: 'flex-start', zIndex: 1000 }}>
            {CloseIconButton}
          </View>
          <View style={{ flexDirection: 'row', alignSelf: 'flex-end' }}>
            {this.renderFaveIcon(event, IS_TOP_MENU_NAV)}
            {this.renderShareIcon(() => this.refs["event"], IS_TOP_MENU_NAV)}
          </View>
        </View>
              
        <View style={{ flexDirection: 'row' }}>
          <View style={{ flexDirection: 'row', paddingLeft: 15, paddingRight: 5 }}>
            {avatar}            
          </View>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ flexDirection: 'column', justifyContent: 'center' }}>
                <View style={{width: nameCutOffMain}}>
                  <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.title]}>{event.shortDescription}</Text>
                </View>
                <Text Text style={styles.subTitle}>{eventDate}</Text>
                <View style={{width: descCutOff}}>
                  <Text Text numberOfLines={1} ellipsizeMode="tail" style={[styles.subTitle]}>{venueDesc}</Text>
                </View>
            </View>
          </View>
        </View> 
      </View>  
    );
  }
  
  render() {
    const { params: event } = this.props.navigation.state;
    return (
      <View style={[styles.container]} ref="event">
        {this.renderHeader()}
          <EventDetailsNavigator 
            screenProps={{ 
              event: event, 
              toggleHeader: this.toggleHeader,
              getRegistryConfigValue: this.context.app.getRegistryConfigValue 
            }} 
          />
        {this.renderPopup(event)}  
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
    height: 80,
    flexDirection: 'column',
    backgroundColor: Theme.Brand.primary
  },
  headerTitleCollapse: {
    fontSize: Theme.Fonts.h4,
    fontFamily: Theme.PrimaryFontBolded,
    color: Theme.Colours.white,
    position: 'absolute',
    top: 12,
    left: 50
  },
  headerTimeCollapse: {
    color: Theme.Colours.white,
    fontSize: Theme.Fonts.fontMedium,
    color: Theme.Colours.white,
    position: 'absolute',
    top: 40,
    left: 50
  },
  collapseBackBtn: {
    position: 'absolute',
    top: 15,
    left: 0
  },
  menuButton: {
    marginLeft: 0, marginRight: 0, paddingLeft: 0, paddingRight: 15, marginVertical: 2
  },
  menuText: {
    color: Theme.Colours.black,
    fontWeight: "300",
    fontFamily: 'System',
  },
  avatarContainer: {
    borderRadius: Platform.OS == 'android' ? 70 : 35,
    width: 70,
    height: 70,
    alignSelf: 'center',
    backgroundColor: Theme.Colours.white,
  },
  avatar: {
    borderRadius: Platform.OS == 'android' ? 70 : 35,
    width: 70,
    height: 70,
    alignSelf: 'center',
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
  title: {
    fontSize: Theme.Fonts.h4,
    fontFamily: Theme.PrimaryFontBolded,
    color: Theme.Colours.white,
    marginLeft: 10
  },
  subTitle: {
    fontSize: Theme.Fonts.fontMedium,
    color: Theme.Colours.white,
    marginLeft: 10
  },
});