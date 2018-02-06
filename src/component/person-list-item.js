import isEqual from 'lodash.isequal';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { View, Text, StyleSheet, Image, TouchableHighlight } from 'react-native';
import { Avatar } from 'react-native-material-ui';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialInitials from 'react-native-material-initials/native';
import Communications from 'react-native-communications';

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

export default class PersonListItem extends Component {

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
	  favourite: context.app.isFavouritePerson(props.data.customerid),
      expanded: false,
      showLocation: true,
	};
  }
	
  setNativeProps(props) {
    this.refs['item'].setNativeProps(props);
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
    		this.setState({
    			expanded: !this.state.expanded
    		});
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
  
  renderExpanded() { 
    if (!this.state.expanded) {
      return null;
    }
    
    const { data } = this.props;
    
    return (
      <View style={[{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5, paddingHorizontal: 15 }]}>
        <View style={{ flexDirection: 'row',  justifyContent: 'space-between', flex: 1.5 }}>          
          {this.renderPhoneIcon(data)}
          {this.renderEmailIcon(data)}
          {this.renderSMSIcon(data)}
        </View>
      </View>
    );
  }
  
  renderDetailValue(detailType, detailValue) {
    if (detailValue === null) {
      return null;
    }
    
    let icon = null;
    switch (detailType) {
      case 'sortByAlpha':
      icon = 'sort-by-alpha';
      break;
      
      case 'sortByLifetimeGiving':
      icon = 'favorite';
      break;
      
      case 'sortByLifetimeSpend':
      icon = 'payment';
      break;
      
      case 'sortByEventsAttended':
      icon = 'event';
      break;
    }
    
    return (
      <View style={styles.detailsBottom}>
        <View style={[styles.row]}>
          <Icon name={icon} color={Theme.Colours.black} size={18} />
          <Text style={styles.detailValueText}>{detailValue}</Text>
        </View>
        <View style={styles.fill75} />
      </View>
    );
  }

  isSortAlpha(cityState) {

    console.log('-------------------- SHOW LOCATION: ' + this.props.showLocation);
    
    if(this.props.showLocation) {
      return(
        <Text style={Theme.Styles.listItemDesc}>{cityState}</Text>
      );
    } else {
      return null;
    }
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
      FaveIconButton = TapIcon('star', ICON_COLOR, TAP_COLOR, () => {
        this.context.app.unsetFavouritePerson(data.customerid);
        this.setState({
          favourite: false
        });
      });  
    }
    else {
      FaveIconButton = TapIcon('star-border', ICON_COLOR, TAP_COLOR, () => {
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
                {this.isSortAlpha(cityState)}
                {/*<Text style={Theme.Styles.listItemDesc}>{cityState}</Text> */}
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
        <View>
        {this.renderExpanded()}
        </View>
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
  detailsBottom: {
    flex: 0.4,
    flexDirection: 'column',
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
  detailValueText: {
    textAlign: 'left',
    fontSize: Theme.Fonts.fontSmall,
    marginLeft: 5,
    fontWeight: '400',
    color: Theme.Colours.black
  },
  fill50: {
    flex: 0.50
  },
  fill75: {
    flex: 0.75
  },
  expandedIcon: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center'
  },
});
