import Moment from 'moment';
import isEqual from 'lodash.isequal';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { View, Text, StyleSheet, Image, Platform, TouchableHighlight, LayoutAnimation } from 'react-native';
import { Avatar } from 'react-native-material-ui';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { default as Theme } from '../lib/theme';
import SimpleActivityIndicator from './simple-activity-indicator';
  
const TAP_COLOR = 'rgba(127,127,127,0.5)';

const ICON_SIZE = 26;

const TapIcon = (name, color, tapColor, onPress) => (
  <TouchableHighlight onPress={onPress} underlayColor={tapColor} style={{ borderRadius: 50, padding: 10 }} >
    <Theme.CustomIcon 
      name={name} 
      size={ICON_SIZE} 
      style={ { backgroundColor: 'transparent', color: color } }
      borderRadius={0}
    />
  </TouchableHighlight>  
);

export default class PersonEventsListItem extends Component {
  
  static contextTypes = {
    app: PropTypes.object.isRequired
  }

  static propTypes = {
    data: PropTypes.object,
    style: PropTypes.object,
    onPressDetails: PropTypes.func,
    expandedStyle: PropTypes.object,
  }

  static defaultProps = {
    detailType: null,
    onPressDetails: () => null,
    expanded: false
  }
  
  constructor(props, context) {
    super(props, context);
      
    this.listItemUpdated = this.listItemUpdated.bind(this);
      
    this.state = {
      expanded: false,
      admissionsLoading: false,
      admissionsData: null,
      assetDomain: context.app.getAssetServerDomain()
    };
  }
  
  setNativeProps(props) {
    this.refs['item'].setNativeProps(props);
  }

  listItemUpdated(props) {
    if (this.props.data.id === props.id) {
      if (props.hasOwnProperty('command')) {
        switch (props.command) {
          case 'expand':
          
            const admissionsDataIsNull = this.state.admissionsData === null;
              
            this.setState({
                expanded: !this.state.expanded,
                admissionsLoading: admissionsDataIsNull
            });

            if (admissionsDataIsNull) {
                // fetch details on expand
                this.context.app.getEventPersonAdmissions({
                  customerId: props.customerid,
                  eventId: this.props.data.id, 
                })
                .then( results => {
                   this.setState({
                     admissionsData: results.data,
                     admissionsLoading: false
                   });
                });
            }

            break;
        }
      }
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (!isEqual(nextProps, this.props)) {
      return true;
    }
    if (!isEqual(nextState, this.state)) {
      return true;
    } 
    return false;
  }
    
  componentWillMount() {
    this.context.app.connect('person-events-list-item-updated', this.listItemUpdated);
  }

  componentWillUpdate() {
    //LayoutAnimation.configureNext(Theme.Animation.scaleExpandedIcons);
  }
  
  componentWillUnmount() {
    this.context.app.disconnect('person-events-list-item-updated', this.listItemUpdated);
  }
  
  renderAdmissions() {
    if (this.state.admissionsLoading || this.state.admissionsData === null) {
      return (
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 5 }}>
          <SimpleActivityIndicator animating />
        </View>
      );
    } 
    
    const renderTicketData = () => {
      return this.state.admissionsData.map( (item, i) => {
        const ticketTime = item.ticketDate.length > 0 ? Moment(item.ticketDate).format('h:mm a') : null;
        
        const color = item.ticketStatus == 'Scanned' ? Theme.Colours.green : Theme.Colours.black;
        
        return (
          <View key={i} style={{ flexDirection: 'row', paddingHorizontal: 15, marginTop: 5 }}>
            <View style={{ flexDirection: 'column', justifyContent: 'center' }}>
              <Icon name={'event-seat'} size={16} color={color} style={{ marginRight: 5 }}/>
            </View>
            <View style={{ flexDirection: 'row', flex: 1 }}>
              <View style={{ flex: 1, flexShrink: 0.25, paddingRight: 5 }}>
                <Text numberOfLines={1}>{item.seatSection}</Text>
              </View>
              <View style={{ flex: 0.25, paddingRight: 5 }}>
                <Text >{item.seatRow}</Text>
              </View>
              <View style={{ flex: 0.25, paddingRight: 5  }}>
                <Text >{item.seatSeat}</Text>
              </View>
              <View style={{ flex: 0.50, paddingRight: 5 }}>
                <Text >{item.amountPaid}</Text>
              </View>
            </View>
            <Text style={{ flex: 0.30, textAlign: 'right', color: color }}>{item.ticketStatus}</Text>
          </View>
        );
      });
    };

    return (
      <View style={[{ flexDirection: 'column', alignItems: 'center', paddingVertical: 10 }]}>
        <View style={{ flexDirection: 'row', paddingHorizontal: 15, marginTop: 5 }}>
          <View style={{ flexDirection: 'column', justifyContent: 'center' }}>
            <Icon name={'event-seat'} size={16} color={'transparent'} style={{ marginRight: 5 }}/>
          </View>
          <View style={{ flexDirection: 'row', flex: 1 }}>
            <Text style={[Theme.Styles.tableHead, { flex: 1, flexShrink: 0.25 }]}>SECTION</Text>
            <Text style={[Theme.Styles.tableHead,{ flex: 0.30}]}>ROW</Text>
            <Text style={[Theme.Styles.tableHead,{ flex: 0.35}]}>SEAT</Text>
            <Text style={[Theme.Styles.tableHead,{ flex: 0.50}]}>PRICE</Text>
          </View>
          <View style={{ flexDirection: 'column', flex: 0.30 }}></View>
        </View>        
        {renderTicketData()}
      </View>
    );
  }

  renderDetailIcon() { 
    
    const icon = TapIcon('event_info', Theme.Colours.primaryDark, TAP_COLOR, () => {
      this.props.onPressDetails();
    });

    return (
        <View style={styles.expandedIcon}>
          {icon}
        </View>
    );
  }

  
  renderExpanded() { 
    if (!this.state.expanded) {
      return null;
    }
    
    const { data } = this.props;
    
    return (
      <View style={[{ flexDirection: 'column' }, this.props.expandedStyle]}> 
        <View style={[{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5, paddingHorizontal: 15 }]}>
          <View style={{ flexDirection: 'row',  justifyContent: 'space-between', flex: 1.5, right: 5}}>          
          </View>

          <View style={{ flexDirection: 'row', flex: 0.65, left: 10}}>
            {this.renderDetailIcon()}
          </View>
        </View>
        {this.renderAdmissions()} 
      </View>
    );
  }
  
  renderAvatar() {
    const { data } = this.props;
    
    let avatar = null;
    if (typeof data.logoOne === 'string' && data.logoOne.length > 0) {
      avatar = this.state.assetDomain + data.logoOne;
    }
    else if (typeof data.logoTwo === 'string' && data.logoTwo.length > 0) {
      avatar = this.state.assetDomain + data.logoTwo;
    }
    else {
      return (<Icon name={"local-play"} size={36} color={Theme.Colours.greyLight} style={{ alignSelf: 'center' }} />)
    }
      
    return (
      <Image
        style={styles.avatar}
        source={{uri: avatar}}
      />
    );
  }
  
  render() {
    const { data } = this.props;

    if (!data) {
        return null;
    }

    let startDate = null;
    if (data.startDate.length > 0) {
      startDate = Moment(data.startDate[0]).format('MMM Do YYYY');
    }
    
    let expandIcon = "expand-more";
    if (this.state.expanded) {
      expandIcon = "expand-less";
    }
    
    return (
      <View style={styles.container} ref="item">
        <View style={{ flex: 1, flexDirection: 'row', paddingVertical: 10}}>
          <View style={styles.bodyLeft}>
            <View style={styles.avatarContainer}>
              {this.renderAvatar()}
            </View>
          </View>
          <View style={styles.bodyMiddle}>
            <View style={[Theme.Styles.column]}>
  	          <View style={[Theme.Styles.row ]}>
	            <Text style={[Theme.Styles.listItemTitle]} numberOfLines={1}>{data.shortDescription}</Text>
  	          </View>
	          <View style={[Theme.Styles.column]}>
	            <Text style={Theme.Styles.listItemLocation} numberOfLines={1}>{startDate} @ {data.venueName}</Text>
	          </View>
	        </View>
          </View>
          <View style={[styles.bodyRight, { justifyContent: 'flex-start' }]}>
            <Icon name={expandIcon} size={24} color={Theme.Colours.border} style={{ alignSelf: 'center' }} />
          </View>
        </View>
        {this.renderExpanded()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: Theme.Colours.backgrounds.secondary,
    borderBottomWidth: 1,
    borderBottomColor: Theme.Colours.greyLight
  },
  bodyLeft: {
    flex: 0.20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bodyMiddle: {
    flex: 0.70,
    flexDirection: 'column',
  },
  bodyRight: {
    flex: 0.10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsTop: {
    flex: 0.6,
    flexDirection: 'column',
  },
  avatar: {
    borderRadius: Platform.OS == 'android' ? 50 : 25,
    height: 50,
    width: 50,
    alignSelf: 'center',
  },
  avatarContainer: {
    flex: 1,
    width: '75%',
    justifyContent: 'center',
    // backgroundColor: 'red',
  },
  name: {
    fontSize: Theme.Fonts.h6,
    color: Theme.Colours.black,
    fontWeight: '400',
  },
  location: {
    fontSize: Theme.Fonts.fontSmall,
    color: Theme.Colours.border
  },
});
