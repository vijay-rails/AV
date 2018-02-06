import Moment from 'moment';
import isEqual from 'lodash.isequal';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { View, Text, StyleSheet, Image, TouchableHighlight, LayoutAnimation } from 'react-native';
import { Avatar } from 'react-native-material-ui';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialInitials from 'react-native-material-initials/native';
import Communications from 'react-native-communications';
import SimpleActivityIndicator from './simple-activity-indicator';

// import randomColor from 'randomcolor';
import { default as Theme } from '../lib/theme';

const ICON_COLOR = Theme.Colours.cardBackground_Grey;
const ICON_COLOR_NULL = Theme.Colours.border;
const TAP_COLOR = 'rgba(127,127,127,0.5)';
const TAP_COLOR_NULL = 'rgba(0,0,0,0)';

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

export default class EventPersonListItem extends Component {

  static contextTypes = {
    app: PropTypes.object.isRequired
  }

  static propTypes = {
    data: PropTypes.object,
    detailType: PropTypes.string,
    style: PropTypes.object,
    onPressDetails: PropTypes.func,
    expanded: PropTypes.bool,
    expandedStyle: PropTypes.object,
    children: PropTypes.node,
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
	  favourite: this.context.app.isFavouritePerson(props.data.customerid),
	  expanded: false,
	  admissionsLoading: false,
	  admissionsData: null
	};
  }
	
  setNativeProps(props) {
    this.refs['item'].setNativeProps(props);
  }
  
  renderDetailValue(detailType, detailValue) {
    if (detailValue === null) {
      return null;
    }
    return (
      <View style={styles.detailsBottom}>
        <View style={[styles.details25, styles.row]}>
          <Text style={styles.detailTypeText}>{detailType}</Text>
          <Text style={styles.detailValueText}>{detailValue}</Text>
        </View>
        <View style={styles.fill75} />
      </View>
    );
  }

  listItemUpdated(props) {
    if (this.props.data.customerid === props.customerid) {
      if (props.hasOwnProperty('command')) {
    	switch (props.command) {
    	  case 'favourite':
    		this.setState({
    		  ...props.state
    		});
    		break;
    		
    	  case 'expand':
    	  
    	    const admissionsDataIsNull = this.state.admissionsData === null;
    	      
    		this.setState({
    			expanded: !this.state.expanded,
    			admissionsLoading: admissionsDataIsNull
    		});

            if (admissionsDataIsNull) {
	    	  // fetch details on expand
	    	  this.context.app.getEventPersonAdmissions({
	    		customerId: this.props.data.customerid,
	    		eventId: this.props.data.eventId
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
    this.context.app.connect('list-item-updated', this.listItemUpdated);
  }

  componentWillUpdate() {
    // LayoutAnimation.configureNext(Theme.Animation.scaleExpandedIcons);
  }
  
  componentWillUnmount() {
    this.context.app.disconnect('list-item-updated', this.listItemUpdated);
  }
  
  renderAvatar(uri) {
    return (
      <Image
        resizeMode="contain"
        source={{uri: uri }} 
        style={styles.avatar}
        // storagePermissionGranted={false}
        // initWidth="50"
        // initHeight="50"
      />
    );
  }
  
  renderIcon() {
    // return (<Icon name={"face"} size={36} color={Theme.Colours.greyLight} style={{ alignSelf: 'center' }} />)
    
    const { data } = this.props;
    const color = Theme.Rainbow[data.hashCode % 15];
    
    let name = data.firstname.concat(' ', data.lastname).trim().toUpperCase();
    if (name.length == 0) {
    	name = data.company.toUpperCase();
    }
    if (name.length == 0) {
    	name = data.organization.toUpperCase();
    }
    
    return (
      <MaterialInitials
        style={{alignSelf: 'center'}}
        backgroundColor={color}
        color={Theme.Colours.white}
        size={50}
        text={name}
        single={false}
      />
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

  renderEmailIcon(customer) {
    
    let color, tapColor;

    color = ICON_COLOR;
    tapColor = TAP_COLOR;

    let icon = TapIcon('email', color, tapColor, () => {
      Communications.email([customer.email], null, null, null, null);
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

    let icon = TapIcon('message', color, tapColor, () => {   	
      Communications.text(phone);
    });
    
    if (phone == null) {
      color = ICON_COLOR_NULL;
      tapColor = TAP_COLOR_NULL;

      icon = TapIcon('message', color, tapColor, () => {   	 	
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

    const icon = TapIcon('account-circle', Theme.Colours.primaryDark, TAP_COLOR, () => {
      this.props.onPressDetails();
    });

    return (
        <View style={styles.expandedIcon}>
          {icon}
        </View>
    );
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
        
        const color = item.ticketStatus == 'Scanned' ? Theme.Colours.green : null;
        
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
            </View>
            <Text style={{ flex: 0.25, textAlign: 'right', color: color }}>{item.ticketStatus}</Text>
          </View>
        );
      });
    };

    return (
      <View style={[{ flexDirection: 'column', alignItems: 'center', paddingVertical: 10, 
        backgroundColor: Theme.Colours.white }]}>

        <View style={{ flexDirection: 'row', paddingHorizontal: 15, marginTop: 5 }}>
          <View style={{ flexDirection: 'column', justifyContent: 'center' }}>
            <Icon name={'event-seat'} size={16} color={'transparent'} style={{ marginRight: 5 }}/>
          </View>
          <View style={{ flexDirection: 'row', flex: 1 }}>
            <Text style={[Theme.Styles.tableHead, { flex: 1, flexShrink: 0.25 }]}>SECTION</Text>
            <Text style={Theme.Styles.tableHead}>ROW</Text>
            <Text style={Theme.Styles.tableHead}>SEAT</Text>
          </View>
          <View style={{ flexDirection: 'column', flex: 0.25 }}></View>
        </View>        
        {renderTicketData()}
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
          {this.renderPhoneIcon(data)}
          {this.renderEmailIcon(data)}
          {this.renderSMSIcon(data)}
        </View>
	    </View>
	    {this.renderAdmissions()}
	  </View>
    );
  }
  
  render() {
    const { data, detailType } = this.props;

    if (!data) {
        return null;
    }
    
    let name = data.firstname.concat(' ', data.lastname).trim();
    if (name.length == 0) {
    	name = data.company;
    }
    if (name.length == 0) {
    	name = data.organization;
    }
    const cityState = data.addresscity.concat(', ', data.addressstate);
    
    let detailValue = null;
    if (data.sortValue !== null) { 
      detailValue = data.sortValue;
    }
    
    let FaveIconButton = null;
    if (this.state.favourite) {
      FaveIconButton = TapIcon('star', () => {
        this.context.app.unsetFavouritePerson(data.customerid);
        this.setState({
          favourite: false
        });
      });  
    }
    else {
      FaveIconButton = TapIcon('star-border', () => {
        this.context.app.setFavouritePerson(data.customerid);
        this.setState({
          favourite: true
        });
      });
    }
    
    let avatar = this.renderIcon();
    
    return (
      <View style={styles.container} ref="item">
        <View style={{ flex: 1, flexDirection: 'row', paddingVertical: 10}}>
          <View style={styles.bodyLeft}>
            <View style={styles.avatarContainer}>
              {avatar}
            </View>
          </View>
          <View style={styles.bodyMiddle}>
            <View style={styles.detailsTop}>
              <View style={styles.fill50} />
              <View style={[styles.details50, styles.col]}>
                <Text style={Theme.Styles.listItemTitle}>{name}</Text>
                <Text style={Theme.Styles.listItemLocation}>{cityState}</Text>
              </View>
            </View>
            {this.renderDetailValue(detailType, detailValue)}
          </View>
          <View style={styles.bodyRight}>
            <View style={{ flexDirection: 'row', right: 0, position: 'absolute'}}>       
              <View>   
                {FaveIconButton}
              </View>
              <View>
                {this.renderDetailIcon(data)}
              </View>
            </View>
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
  },
  bodyMiddle: {
    flex: 0.65,
    flexDirection: 'column',
  },
  bodyRight: {
    flex: 0.15,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  detailsTop: {
    flex: 0.6,
    flexDirection: 'column',
  },
  name: {
    flex: 1,
    fontSize: Theme.Fonts.h6,
    color: Theme.Colours.black
  },
  location: {
    flex: 1,
    fontSize: Theme.Fonts.fontSmall,
    color: Theme.Colours.border
  },
  detailsBottom: {
    flex: 0.4,
    flexDirection: 'column',
  },
  details25: {
    flex: 0.25,
  },
  details50: {
    flex: 0.50,
  },
  row: {
    flexDirection: 'row',  
  },
  col: {
    flexDirection: 'column',
  },
  detailTypeText: {
    flex: 0.5,
    fontSize: Theme.Fonts.fontMedium,
    alignSelf: 'center'
  },
  detailValueText: {
    flex: 0.5,
    textAlign: 'right',
    paddingRight: 14,
    fontWeight: 'bold',
  },
  fill50: {
    flex: 0.50
  },
  fill75: {
    flex: 0.75
  },
  expandedIcon: {
	flex: 1, justifyContent: 'center', alignItems: 'center'
  }
});
