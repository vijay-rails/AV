import * as d3 from 'd3-format';
import Moment from 'moment';
import { default as ACC } from 'accounting';
import PropTypes from 'prop-types'; 
import React, { Component } from 'react';
import {
	Animated,
  StyleSheet,
  View,
  Text,
  TouchableHighlight,
  ScrollView,
  UIManager,
  LayoutAnimation,
  Platform,
} from 'react-native';
import { NavigationActions } from 'react-navigation';
import { Divider } from 'react-native-material-ui';
import SimpleActivityIndicator from '../../../component/simple-activity-indicator';
import AsyncDataListView from '../../../component/async-data-list-view';
import { default as Theme } from '../../../lib/theme';
import TabTitle from '../../../navigator/tab-title';
import CircleGauge from '../../../component/gauge/circle-gauge';
import GaugeTile from '../../../component/tile/gauge-tile';
import NumberTile from '../../../component/tile/number-tile';
import DateTile from '../../../component/tile/date-tile';

import Icon from 'react-native-vector-icons/MaterialIcons';

import { Animation } from '../../../lib/animation';

import { ViewShot } from "react-native-view-shot";

/*
const peoplePersonAction = NavigationActions.navigate({
	  routeName: 'PeoplePerson',
	  params: {},
	  // navigate can have a nested navigate action that will be run inside the child router
	  action: NavigationActions.navigate({ routeName: 'PeoplePerson'})
});
*/

const ICON_SIZE = Theme.Fonts.h4;

const HEADER_MAX_HEIGHT = 123;
const HEADER_MIN_HEIGHT = Platform.OS === 'ios' ? 20 : 43;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

const IS_TOP_MENU_NAV = 1;
const IS_TOGGLE_MENU_NAV = 2;
	
export default class PersonDetails extends Component {

  static contextTypes = {
    app: PropTypes.object.isRequired
  }

  static navigationOptions = ({ navigation }) => {
    return {
      tabBarLabel: (<TabTitle node="Registry::Insights::Scene::Person" value="Details Tab Label" />)
    }
  };
  
  constructor(props, context) {
    super(props, context);

    this.state = {
      loading: true,
      error: false,
      mostRecentOrder: null,
      mostRecentGift: null,
      totalSpend: null,
      totalPledged: null, 
      totalGiven: null,
      scrolling: false,
      collapseHidden: false,

      finalPledge: null,
      finalSpend: null,
      finalGiven: null,
      finalOrder: null,
      finalGift: null,
    }

    if (Platform.OS === 'android') {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }
      
  componentWillMount() {
    this.context.app.getPersonStats({
      customerId: this.props.screenProps.customer.customerid
    })
    .then( details => {
      this.setState({
    	loading: false,
    	...details
      });
    })
    .catch( error => {
	  this.setState({
    	loading: false,
    	error: true
      });
    })
    ;
  }

  renderDonations() {	
    const { totalPledged, totalGiven } = this.state;

    const d3f = d3.format('.3s');

    let pledgedAmount = null;
    let pledgedAmountFormatted = "$"+d3f(0); // ACC.formatMoney(0, { symbol: '$', format: "%s%v" });
    let givenAmount = null;
    let givenAmountFormatted = "$"+d3f(0); // ACC.formatMoney(0, { symbol: '$', format: "%s%v" });
    let outstandingAmount = null;
    let outstandingAmountFormatted = "$"+d3f(0); // ACC.formatMoney(0, { symbol: '$', format: "%s%v" });
    let pledgeRate = 0;   
    
    if (totalPledged !== 'undefined' 
        && totalPledged !== null 
        && totalPledged.hasOwnProperty('data') 
        && totalPledged.data.hasOwnProperty('amountFormatted')) 
    {
      pledgedAmountFormatted = "$"+d3f(totalPledged.data.amount); // Formatted;
      pledgedAmount = Number(totalPledged.data.amount);
    }

    if (totalGiven !== 'undefined' 
        && totalGiven !== null 
        && totalGiven.hasOwnProperty('data') 
        && totalGiven.data.hasOwnProperty('amountFormatted')) 
    {
      givenAmountFormatted = ACC.formatMoney(Math.round(totalGiven.data.amount), { symbol: '$', format: "%s%v", precision: 0 }); // "$"+d3f(totalGiven.data.amount); // Formatted;
      givenAmount = Number(totalGiven.data.amount);
    }

    if (pledgedAmount !== null && givenAmount !== null) {        
        pledgeRate = Math.floor(givenAmount * 100 / pledgedAmount);
        
        outstandingAmount = Number(totalPledged.data.amount) - Number(totalGiven.data.amount); 
        outstandingAmountFormatted = ACC.formatMoney(Math.round(outstandingAmount), { symbol: '$', format: "%s%v", precision: 0 }); // "$"+d3f(outstandingAmount); // ACC.formatMoney(outstandingAmount, { symbol: '$', format: "%s%v"});
    }

    // let count = 0;
    // count++;

    // if(count < 1) {
    //   this.setState({
    //     finalPledge: pledgedAmountFormatted
    //   })

    //   this.props.screenProps.totalPledged = pledgedAmountFormatted;

    //   console.log(`-----------TOTAL PLEDGE: ${this.props.screenProps.totalPledged }`)
    // }
    
    return (
      <GaugeTile 
        label="LIFETIME PLEDGE"
        maxFontSize={Theme.Fonts.h6}
        icon="favorite"
        title={pledgedAmountFormatted} 
        textColour={Theme.Colours.chartColor1_Green} 
        style={{
          backgroundColor: Theme.Colours.white,
          padding: 5,
        }}
        legend={[
          {
            colour: Theme.Colours.chartColor1_Green,
            value: 'GIVING: '+givenAmountFormatted
          },
          {
            colour: Theme.Colours.chartColor5_Pink,
            value: 'OUTSTANDING: '+outstandingAmountFormatted
          }
        ]}
      >
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <CircleGauge
            icon="favorite"
            colour={Theme.Colours.chartColor1_Green}
            backgroundColour={Theme.Colours.chartColor5_Pink}
            fill={pledgeRate}
            style={{ paddingVertical: 10 }}
          />
        </View>
      </GaugeTile>
    );
  }

  renderTotalSpend() {	
    const { totalSpend } = this.state;

    let amount = 0;
    let amountFormatted = ACC.formatMoney(amount, { symbol: '$', /* totalSpend.data.amountCurrency, */ format: "%s%v" });
    
    if (totalSpend !== 'undefined' 
        && totalSpend !== null 
        && totalSpend.hasOwnProperty('data') 
        && totalSpend.data.hasOwnProperty('amount')) 
    {
      amountFormatted = ACC.formatMoney(Math.round(totalSpend.data.amount), { symbol: '$', format: "%s%v", precision: 0 }); // Formatted);
    }

    return (
      <NumberTile 
        label="LIFETIME SPEND" 
        icon="payment" 
        value={amountFormatted} 
        alignValue="right" 
        textColour= {Theme.Colours.chartColor3_TurquoiseGreen}
        backgroundColour={Theme.Colours.white} 
        gridHeight={1}
        maxFontSize={Theme.Fonts.h2}
      >
      </NumberTile> 
    );
  }

  renderMostRecentOrder() {
    const { mostRecentOrder } = this.state;

    let date = null;
    if (typeof mostRecentOrder !== 'undefined' 
        && mostRecentOrder !== null 
        && mostRecentOrder.data.hasOwnProperty('orderActiveDate') 
        && mostRecentOrder.data.orderActiveDate) 
    {
        // date = Moment(mostRecentOrder.data.orderActiveDate).format('MMM Do YYYY');
        date = mostRecentOrder.data.orderActiveDate;
    }

    return (
      <DateTile 
        label="MOST RECENT ORDER" 
        icon="shopping-cart" 
        date={date}
        alignValue="right" 
        textColour={Theme.Colours.chartColor1_Green}
        backgroundColour={Theme.Colours.white} 
        gridHeight={4}
        maxFontSize={Theme.Fonts.h2}
      >
      </DateTile>     
    )
  }
  

  renderMostRecentGift() {
    const { mostRecentGift } = this.state;

    let date = null;
    if (typeof mostRecentGift !== 'undefined' 
        && mostRecentGift !== null 
        && mostRecentGift.data.hasOwnProperty('pledgeDate') 
        && mostRecentGift.data.pledgeDate) 
    {
    	// date = Moment(mostRecentGift.data.pledgeDate).format('MMM Do YYYY');
    	date = mostRecentGift.data.pledgeDate;
    	console.log('--- data', date);
    }

    console.log('--- data2', date);
    
    return (
      <DateTile 
        label="MOST RECENT GIFT" 
        icon="card-giftcard" 
        date={date} 
        alignValue="right" 
        textColour={Theme.Brand.primary}
        backgroundColour={Theme.Colours.white}
        gridHeight={4}
        maxFontSize={Theme.Fonts.h2}
      >
      </DateTile> 
    );
  }
  

  renderCustomerValue() {
    const { customervalue } = this.props.screenProps.customer;   
    if (customervalue === null || customervalue.length === 0) {
      return null;
    }
        
    return (
      <View style={[ Theme.Styles.row, { } ]} >
        <View style={[ Theme.Styles.column, { flex: 1} ]}>
          <NumberTile 
            label="CUSTOMER VALUE" 
            icon="card-giftcard" 
            value={ACC.formatNumber(customervalue)} 
            alignValue="right" 
            textColour={Theme.Colours.chartColor1_Green}
            backgroundColour={Theme.Colours.white} 
            gridHeight={1}
            maxFontSize={Theme.Fonts.h2}
          >
          </NumberTile>
        </View>
      </View> 
    );
  }

  renderLoading() {
    if (!this.state.loading) {
        return null;
    }   

    return (
      <View style={Theme.Styles.overlay}>
        <View style={[Theme.Styles.row, { flex: 1, alignItems: 'center', justifyContent: 'center' }]}>
          <SimpleActivityIndicator animating={this.state.loading} />
        </View>
      </View>
    );
  }
  
  render() {

    return (

        <View style={[ styles.container ]}>

          <Animated.ScrollView 
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={1}
            onScroll={this.props.screenProps.toggleHeader}
          >

            <View style={[ Theme.Styles.row, { borderBottomWidth: 1, borderBottomColor: '#ccc' } ]} >
              <View style={[ Theme.Styles.column, { flex: 1} ]}>
                {this.renderDonations()}
              </View>
            </View>
                
            <View style={[ Theme.Styles.row, { borderBottomWidth: 1, borderBottomColor: Theme.Colours.greyLight } ]} >
              <View style={[ Theme.Styles.column, { flex: 1} ]}>
                {this.renderTotalSpend()} 
              </View>
            </View>
        
              <View style={[ Theme.Styles.row, { borderBottomWidth: 1, borderBottomColor: Theme.Colours.greyLight } ]} >
            <View style={[ Theme.Styles.column, { flex: 1} ]}>
            {this.renderMostRecentOrder()}
            </View>
                <View style={{ borderRightWidth: 1, borderRightColor: Theme.Colours.greyLight }}></View>
            <View style={[ Theme.Styles.column, { flex: 1} ]}>
            {this.renderMostRecentGift()}
            </View>
            </View>
                
            {this.renderCustomerValue()}
                  
          </Animated.ScrollView>
          {this.renderLoading()}
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
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    zIndex: 100,
    height: HEADER_MAX_HEIGHT
  },
  headerCollapse: {
    // flex: 0.25,
    flexDirection: 'column',
    backgroundColor: Theme.Brand.primary,
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    height: 60,
    zIndex: 100
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
    fontWeight: '500',
    color: Theme.Colours.white
  },
  headerNameCollapse: {
    fontSize: Theme.Fonts.h4,
    fontWeight: '500',
    color: Theme.Colours.white,
    position: 'absolute',
    top: 12,
    left: 50
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