const Moment = require('moment');
import * as d3 from 'd3-format';
import { default as ACC } from 'accounting';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Platform,
  Dimensions,
  Animated,
  Easing,
  LayoutAnimation,
  UIManager
} from 'react-native';

import BasicGauge from '../../../component/gauge/basic-gauge';
import BasicCurrency from '../../../component/gauge/basic-currency';
import Flipper from '../../../component/animated/flipper';
import Switcher from '../../../component/animated/switcher';
import SimpleActivityIndicator from '../../../component/simple-activity-indicator';
import SimpleCard from '../../../component/simple-card';
import SimpleModal from '../../../component/simple-modal';
import NumberTile from '../../../component/tile/number-tile';
import SimpleTile from '../../../component/tile/simple-tile';
import { default as Theme} from '../../../lib/theme';
import AreaSpline from '../../../component/charts/area-spline';
import AdmissionsDetails from './admissions-details';

export default class Events extends Component {
  static contextTypes = {
    app: PropTypes.object.isRequired
  }
   
  state = {
    loaded: false,
    newDonors: 0,
    newDonorsAmount: [],
    newCustomersCount: 0,
    newCustomersSales: [],
    eventSales: [],
    eventAdmissionsSoldCount: 0,
    ticketSalesByDateRange: {},
  }
 
  componentWillReceiveProps(nextProps) {
    if (nextProps.screenProps.startDate != this.props.screenProps.startDate ||
        nextProps.screenProps.endDate != this.props.screenProps.endDate) {     
      this.setState({
        loaded: false
      });
    }
  }
  
  componentDidMount() {
    this.loadData();
  }
  
  shouldComponentUpdate(nextProps, nextState) {
    if (nextState.loaded == this.state.loaded) {
      return false;
    }
    return true;
  }
  
  componentWillUpdate(nextProps, nextState) {
    LayoutAnimation.configureNext(Theme.Animation.scale);
  }
  
  componentDidUpdate(prevProps, prevState) {
    if (!this.state.loaded) {
      this.loadData();
    }
  }
  
  loadData = () => {
    // make a call to fetch back the event dashboard data
    this.context.app.getEventDashboard({
      startDate: this.props.screenProps.startDate,
      endDate: this.props.screenProps.endDate
    })
    .then(results => {

      this.setState({
        newDonors: results.newDonors.data.count,
        newDonorsAmount: results.newDonorsAmount.data,
        newCustomersCount: results.newCustomersCount.data.count,
        newCustomersSales: results.newCustomersSales.data,
        eventSales: results.eventSales.data,
        eventAdmissionsSoldCount: results.eventAdmissionsSoldCount.data.count,
        ticketSalesByDateRange: results.ticketSalesByDateRange,
        loaded: true
      });
    })
    .catch(err => {

    });
  }
  
  renderLoadingIndicator() {
    const animating = !this.state.loaded;

    return (
      <View style={Theme.Styles.overlay}>
        <View style={[Theme.Styles.row, Theme.Styles.f1, Theme.Styles.center]}>
          <SimpleActivityIndicator animating={animating} />
        </View>
      </View>
    );
  }
  
  render() {
    
    if (!this.state.loaded) {
      return this.renderLoadingIndicator();
    } 
    
    const d3f = d3.format('.0s');
    const char = "0";
    const wholeNumbers = (num) => {
      const decPos = num.indexOf('.'); 
      return decPos >= 0 ? num.substring(0, decPos) : num;
    };
    const formatNumbers = (num, len, f, p) => {
      const numeric = Number(num).toString(); 
      return numeric.length > len ? p.concat(f(num)) : p.concat(numeric);
    }; 
     
    const newDonorsLimit = Number("1"+char.repeat(this.state.newDonors.length));
    const newDonorsPercent = Math.round((Number(this.state.newDonors) * 100) / newDonorsLimit);

    let newDonorsAmount = "$0";
    if (this.state.newDonorsAmount.length > 0) {
      const newDonorsAmountTotal = wholeNumbers(this.state.newDonorsAmount[0].amount.standard);
      newDonorsAmount = formatNumbers(newDonorsAmountTotal, 3, d3.format('.2s'), '$');
    }

    const newCustomersLimit = Number("1"+char.repeat(this.state.newCustomersCount.length));
    const newCustomersPercent = Math.round((Number(this.state.newCustomersCount) * 100) / newCustomersLimit);
    
    let newCustomersSales = "$0";
    if (this.state.newCustomersSales.length > 0) {
      const newCustomersSalesTotal = wholeNumbers(this.state.newCustomersSales[0].amount.toString());
      console.log('---- new customer sales', this.state.newCustomersSales[0].amount.toString().indexOf('.'));
      newCustomersSales = formatNumbers(newCustomersSalesTotal, 3, d3.format('.2s'), '$');
    }

    let eventSales = "$0";
    if (this.state.eventSales.length > 0) {
      const eventSalesTotal = wholeNumbers(this.state.eventSales[0].amount);
      eventSales = formatNumbers(eventSalesTotal, 3, d3f, '$');
    }

    const eventAdmissionsSoldLimit = Number("1"+char.repeat(this.state.eventAdmissionsSoldCount.length));
    const eventAdmissionsSoldPercent = Math.round((Number(this.state.eventAdmissionsSoldCount) * 100) / eventAdmissionsSoldLimit);

    // formatted
    const newDonors = formatNumbers(this.state.newDonors, 3, d3f, ''); // ACC.formatNumber(this.state.newDonors);
    const newCustomersCount = formatNumbers(this.state.newCustomersCount, 3, d3f, ''); // ACC.formatNumber(this.state.newCustomersCount);
    const eventAdmissionsSoldCount = formatNumbers(this.state.eventAdmissionsSoldCount, 3, d3f, ''); // ACC.formatNumber(this.state.eventAdmissionsSoldCount);
    
    let salesData = [];
    
    this.state.ticketSalesByDateRange.data.sort( (a, b) => {
      return Number(a.interval) - Number(b.interval);
    });
    
    switch (this.state.ticketSalesByDateRange.groupBy) {
      case 'DAY':
        salesData = this.state.ticketSalesByDateRange.data.map( datum => {
          return {
            x: Number(datum.interval),
            y: Number(datum.amount)
          }
        }); 
        break;
      case 'WEEK':
        salesData = this.state.ticketSalesByDateRange.data.map( datum => {
          return {
            x: Number(datum.interval),
            y: Number(datum.amount)
          }
        }); 
        break;
      case 'MONTH':
        salesData = this.state.ticketSalesByDateRange.data.map( datum => {
          return {
            x: Number(datum.interval),
            y: Number(datum.amount)
          }
        }); 
        break;
      case 'YEAR':
        salesData = this.state.ticketSalesByDateRange.data.map( datum => {
          return {
            x: Number(datum.interval),
            y: Number(datum.amount)
          }
        }); 
        break;
    }

    return (
      <View style={styles.container}>
        <ScrollView 
          showsHorizontalScrollIndicator={false}
          style={{ }}
        >
        <View style={[Theme.Styles.row, { borderBottomWidth: 1, borderBottomColor: Theme.Colours.greyLight }]} >
          <View style={[ Theme.Styles.column, Theme.Styles.f1 ]}>
            <NumberTile 
              label="NEW DONORS" 
              value={newDonors} 
              alignValue="left" 
              textColour="purple"
              backgroundColour={Theme.Colours.white} 
              maxFontSize={60}
              expandable={false}
              onExpand={() => {
                const modal = (
                  <SimpleModal 
                    onClose={() => this.context.app.setState({ modal: false }) }
                    backgroundColour={Theme.Colours.white}
                    textColour={Theme.Colours.black}
                    label="NEW DONORS"
                  >
                    <View></View>
                  </SimpleModal>
                );
                this.context.app.setState({
                  modal: modal
                });
              }}
            >
              <View style={{ paddingHorizontal: 10, paddingVertical: 5, alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 12 }} numberOfLines={1}>PLEDGED: <Text style={{ fontWeight: "500" }}>{newDonorsAmount}</Text></Text>
              </View>
            </NumberTile>
          </View>
          <View style={{ borderRightWidth: 1, borderRightColor: Theme.Colours.greyLight }}></View>
          <View style={[ Theme.Styles.column, Theme.Styles.f1 ]}>
            <NumberTile 
              label="NEW PEOPLE" 
              icon="person-add"
              value={newCustomersCount} 
              alignValue="left" 
              textColour="purple"
              backgroundColour={Theme.Colours.white} 
              maxFontSize={60}
              expandable={false}
              onExpand={() => {
                const modal = (
                  <SimpleModal 
                    onClose={() => this.context.app.setState({ modal: false }) }
                    backgroundColour={'#FFB74D'}
                    textColour={Theme.Colours.white}
                    label="NEW PEOPLE"
                  >
                    <View></View>
                  </SimpleModal>
                );
                this.context.app.setState({
                  modal: modal
                });
              }}
            >
              <View style={{ paddingHorizontal: 10, paddingVertical: 5, alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 12 }} numberOfLines={1}>SALES: <Text style={{ fontWeight: "500" }}>{newCustomersSales}</Text></Text>
              </View>
            </NumberTile>
          </View>
        </View>
        
        <View style={[Theme.Styles.row, { borderBottomWidth: 1, borderBottomColor: Theme.Colours.greyLight, height: (Dimensions.get('window').width / 2) + 1 }]} >
          <View style={[ Theme.Styles.column, Theme.Styles.f1 ]}>
            <SimpleTile 
              label="SALES"
              icon="payment" 
              gridHeight={2}
              textColour={Theme.Colours.chartColor1_Green}
            >
              {salesData.length > 0 ?
                <AreaSpline
                  data={salesData}
                  groupBy={this.state.ticketSalesByDateRange.groupBy}
                  areaColour={'green'}
                  xField="x"
                  yField="y"
                  startDate={this.props.screenProps.startDate}
                  endDate={this.props.screenProps.endDate}
                /> :
                <View style={{ padding: 10 }}>
                  <Text>No data available for selected time period.</Text>
                </View>
              }
            </SimpleTile>
          </View>
        </View>
        
        <View style={[Theme.Styles.row, { }]} >
          <View style={[ Theme.Styles.column, Theme.Styles.f1 ]}>
            <NumberTile 
              label="ADMISSIONS SOLD"
              icon="local-play"
              value={eventAdmissionsSoldCount} 
              alignValue="left" 
              textColour={Theme.Colours.chartColor1_Green}
              backgroundColour={Theme.Colours.white}
              maxFontSize={60}
              expandable
              onExpand={() => {
                const modal = (
                  <SimpleModal 
                    onClose={() => this.context.app.setState({ modal: false }) }
                    backgroundColour={'#388E3C'}
                    textColour="#fff"
                    icon="local-play"
                    label="ADMISSIONS SOLD"
                    maxLabelFontSize={32}
                  >
                    <AdmissionsDetails
                      textColour="#fff" 
                      startDate={this.props.screenProps.startDate} 
                      endDate={this.props.screenProps.endDate} 
                    />
                  </SimpleModal>
                );
                this.context.app.setState({
                  modal: modal
                });
              }}
            >
              <View style={{ paddingHorizontal: 10, paddingVertical: 5, alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 12 }} numberOfLines={1}>...<Text style={{ fontWeight: "500" }}>MORE</Text></Text>
              </View>
            </NumberTile>
          </View>
          <View style={{ borderRightWidth: 1, borderRightColor: Theme.Colours.greyLight }}></View>
          <View style={[ Theme.Styles.column, Theme.Styles.f1 ]}>
            <NumberTile 
              label="EVENT SALES"
              icon="local-play" 
              value={eventSales} 
              alignValue="right" 
              textColour={Theme.Colours.chartColor1_Green}
              backgroundColour={Theme.Colours.white}
              maxFontSize={60}
            >
            </NumberTile>
          </View>
          {/*
          <Flipper ref={c => { this._donors = c; }}>
            <SimpleCard style={styles.card}>
            <BasicGauge
              icon="payment"
              label="NEW DONORS"
              value={this.state.newDonors}
              gaugeColour={'rgb(144, 58, 163)'}
              fill={newDonorsPercent}
              size={100}
              // style={{ flex: 1 }}
              style={styles.f1}
              onPress={() => {
                this._donors.step();
              }}
            />
            </SimpleCard>
            <SimpleCard style={styles.card}>
            <BasicCurrency
              label="PLEDGED"
              value={newDonorsAmount}
              style={styles.f1}
              onPress={() => {
                this._donors.step();
              }}
            />
            </SimpleCard>
          </Flipper>
          <Flipper ref={c => { this._people = c; }}>
            <SimpleCard style={styles.card}>
            <BasicGauge
              icon="person-add"
              label="NEW PEOPLE"
              value={this.state.newCustomersCount}
              gaugeColour={'rgb(50, 147, 227)'}
              fill={newCustomersPercent}
              size={100}
              style={styles.f1}
              onPress={() => {
                this._people.step();
              }}
            />
            </SimpleCard>
            <SimpleCard style={styles.card}>
            <BasicCurrency
              label="SALES"
              value={newCustomersSales}
              style={styles.f1}
              onPress={() => {
                this._people.step();
              }}
            />
            </SimpleCard>
          </Flipper>
        </View>  
        <View style={[styles.f1, styles.row, styles.center ]} >
          <SimpleCard style={styles.card}>
          <BasicGauge
            icon="event"
            label="SALES"
            value={eventSales}
            fill={95}
            size={100}
            gaugeColour={'rgb(244, 67, 54)'}
            style={styles.f1}
          />
          </SimpleCard>
          <SimpleCard style={styles.card}>
          <BasicGauge
            icon="person-pin"
            label="ADMISSIONS SOLD"
            value={this.state.eventAdmissionsSoldCount}
            fill={eventAdmissionsSoldPercent}
            size={100}
            gaugeColour={'rgb(144, 58, 163)'}
            style={styles.f1}
          />
          </SimpleCard>
          */}
        </View>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    backgroundColor: Theme.Colours.border
  }
});