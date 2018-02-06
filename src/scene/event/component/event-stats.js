import * as d3 from 'd3-format';
import Moment from 'moment';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {
  Animated,
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableHighlight
} from 'react-native';
import { NavigationActions } from 'react-navigation';
import Icon from 'react-native-vector-icons/MaterialIcons';
import BasicGauge from '../../../component/gauge/basic-gauge';
import CircleGauge from '../../../component/gauge/circle-gauge';
import Flipper from '../../../component/animated/flipper';
import Carousel from '../../../component/animated/carousel';
import SimpleActivityIndicator from '../../../component/simple-activity-indicator';
import InsightCard from '../../../component/insight-card';
import SimpleCard from '../../../component/simple-card';
import SimpleModal from '../../../component/simple-modal';
import NumberTile from '../../../component/tile/number-tile';
import GaugeTile from '../../../component/tile/gauge-tile';
import SimpleTile from '../../../component/tile/simple-tile';
import TabTitle from '../../../navigator/tab-title';
import { default as Theme } from '../../../lib/theme';
import EventAdmissionsDetails from './event-admissions-details';

export default class EventStats extends Component {

  static contextTypes = {
    app: PropTypes.object.isRequired
  }

  static navigationOptions = ({ navigation }) => {
    return {
      tabBarLabel: (<TabTitle node="Registry::Insights::Scene::Event" value="Stats Tab Label" />)
    }
  }
  
  state = {
    loading: false,
    tickets: {
      data: { total: 0, set: [] }
    },
    comps: {
      data: { total: 0 }
    },
    admissionsSold: {
      data: { total: 0, amount: "0" }
    },
    revenues: {
      data: []
    },
    admissions: {
      data: { total: 0, costCurrency: null, costTotal: null, costTotalFormatted: null }
    },
    pricing: {
      data: []
    }
  }
  
  shouldComponentUpdate(nextProps, nextState) {
    if (nextState.loading == this.state.loading) {
      return false;
    }
    return true;
  }

  componentDidMount() {
    this.setState({
      loading: true
    });
    
    this.context.app.getEventStats({
      eventId: this.props.screenProps.event.id,
      chartId: this.props.screenProps.event.chartId,
    })
    .then( details => {
      console.log('--- event stat details', details);
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
    });
  }
  
  renderTicketStats() {
    return (
      <View style={[styles.fi, styles.col]}>
        <Text style={styles.subHeading}>Avg Printed At</Text>
        {this.state.tickets.data.avgPrintedAt}
      
        <Text style={styles.subHeading}>Avg Taken At</Text>
        {this.state.tickets.data.avgTakenAt}
                    
        <Text style={styles.subHeading}>Avg Time Between Printed and Taken</Text>
        {this.state.tickets.data.avgPrintedAt}
      </View>
    );
  }

  renderRevenues() {
    return this.state.revenues.data.map( (revenue, i) => {
      const cardContent = (
        <View style={[styles.f1, styles.row ]}>
          <View style={[styles.f1, styles.col ]}>
            <Icon name={'attach-money'} size={32} color={Theme.Colours.border} style={{ alignSelf: 'center' }} />
          </View>
          <View style={[styles.f4, styles.col ]}>
            <Text style={[styles.f1, styles.col, styles.heading]}>Admissions Revenue</Text>
            <View style={[styles.f1, styles.row, styles.revenue ]}>
              <Text style={[styles.f1, styles.col ]}>{revenue.totalCurrency}</Text>
              <Text style={[styles.f1, styles.col ]}>{revenue.totalFormatted}</Text>
            </View>
          </View>
        </View>
      );
      
      return (
        <InsightCard 
          key={i}
          style={[ styles.f1, styles.col ]}
          cardContent={cardContent}
          drawerContent={null}
          closeable={false}
        />
      );
    });
  } 

  renderComps() {
      const cardContent = (
        <View style={[styles.f1, styles.row ]}>
          <View style={[styles.f1, styles.col ]}>
            <Icon name={'attach-money'} size={32} color={Theme.Colours.border} style={{ alignSelf: 'center' }} />
          </View>
          <View style={[styles.f4, styles.row ]}>
            <Text style={[styles.f2, styles.col, styles.heading]}>Comped Admissions</Text>
            <Text style={[styles.f1, styles.col ]}>{this.state.comps.data.total}</Text>
          </View>
        </View>
      );
      
      return (
        <InsightCard 
          style={[ styles.f1, styles.col ]}
          cardContent={cardContent}
          drawerContent={null}
          closeable={false}
        />
      );
  } 
    
  renderUnsoldOpp() {
    return this.state.revenues.data.map( (revenue, i) => {
      const cardContent = (
        <View style={[styles.f1, styles.row ]}>
          <View style={[styles.f1, styles.col ]}>
            <Icon name={'attach-money'} size={48} color={Theme.Colours.border} style={{ alignSelf: 'center' }} />
          </View>
          <View style={[styles.f4, styles.col ]}>
            <Text style={[styles.f1, styles.col, styles.heading]}>Unsold Opportunity</Text>
            <View style={[styles.f1, styles.row, styles.revenue ]}>
              <Text style={[styles.f1, styles.col ]}>{revenue.totalCurrency}</Text>
              <Text style={[styles.f1, styles.col ]}>{revenue.totalFormatted}</Text>
            </View>
          </View>
        </View>
      );
      
      return (
        <InsightCard 
          key={i}
          style={[ styles.f1, styles.col ]}
          cardContent={cardContent}
          drawerContent={null}
          closeable={false}
        />
      );
    });
  } 
  
  renderAttendanceGauges() {
    return;
  }
  
  renderLoading() {
	if (!this.state.loading) {
		return null;
	}   

    return (
      <View style={styles.overlay}>
        <View style={[styles.f1, styles.row, { alignItems: 'center', justifyContent: 'center' }]}>
          <SimpleActivityIndicator animating={this.state.loading} />
        </View>
      </View>
    );
  }
  
  renderTickets() {
    return this.state.tickets.data.set.map( (data, i) => {
      return (
        <View>
        <Text key={i} style={[Theme.Styles.textMedium, { fontWeight: '400' }]}>{data.type.toUpperCase()}: {data.total}</Text>
        </View>
      );
    });
  }
  
  render() {
    const { event } = this.props.screenProps;
    
    const admissionsSold = Number(this.state.admissionsSold.data.total); 
    const admissions = Number(this.state.admissions.data.total);
    const sales = this.state.admissionsSold.data.amount;
    const tickets = Number(this.state.tickets.data.total);

    const attendance = admissions == 0 ? 0 : Math.round((tickets / admissions) * 100);
    const attendanceRate = admissionsSold == 0 ? 0 : Math.round(( tickets / admissionsSold ) * 100);
    const soldRate = admissions == 0 ? 0 : Math.round(( admissionsSold / admissions ) * 100);
    const unSold = admissions == 0 ? 0 : (admissions - admissionsSold);

    let inFuture = false;
    if (event.startDate.length > 0) {
      inFuture = Moment(event.startDate[0]).isAfter(new Date());
    }
    
    let halfGridHeight = 4;
    if (inFuture) {
      halfGridHeight = 2;
    }
    
    const d3f = d3.format('.0s');
    const char = "0";
    const wholeNumbers = (num) => num.substring(0, num.indexOf('.'));
    const formatNumbers = (num, len, f, p) => Number(num).toString().length >= len ? p.concat(f(num)) : p.concat(num); 

    let salesAmount = "$0";
    if (String(sales).length > 0) {
      // salesAmount = wholeNumbers(sales);
      salesAmount = formatNumbers(sales, 3, d3.format('.0s'), '$');
    }

    return (
      <View style={[ styles.container ]}>
          <Animated.ScrollView 
            showsHorizontalScrollIndicator={false}
            // showsVerticalScrollIndicator={false}
            style={{ }}
            scrollEventThrottle={1}
            onScroll={this.props.screenProps.toggleHeader}
          >
            <View style={[ styles.row, { borderBottomWidth: 1, borderBottomColor: Theme.Colours.greyLight }]} >
              <View style={[ styles.col, { flex: 1} ]}>
                <GaugeTile 
                  label="ADMISSIONS"
                  gridHeight={4} 
                  textColour={Theme.Colours.chartColor2_Purple}
                  style={{
                    backgroundColor: Theme.Colours.white,
                    padding: 5,
                  }}
                  legend={[
                    {
                      colour: Theme.Colours.chartColor2_Purple,
                      value: 'SOLD: '+admissionsSold
                    },
                    {
                      colour: Theme.Colours.chartColor5_Pink,
                      value: 'UNSOLD: '+unSold
                    }
                  ]}>
                  <View style={{ flex: 1, justifyContent: 'center' }}>
                    <CircleGauge
                      icon="local-play"
                      colour={Theme.Colours.chartColor2_Purple}
                      backgroundColour={Theme.Colours.chartColor5_Pink}
                      fill={soldRate}
                      style={{ paddingVertical: 10 }}
                    />
                  </View>
                </GaugeTile>
              </View>
            </View>
            <View style={[ styles.row, { borderBottomWidth: 1, borderBottomColor: Theme.Colours.greyLight } ]} >
              {inFuture ? null :
              <View style={[ styles.row, { flex: 1 } ]}>
                <View style={[ styles.col, { flex: 1 } ]}>  
	            <NumberTile 
	              label="ATTENDANCE"
	              icon="confirmation-number"
	              value={tickets.toString()} 
	              alignValue="left" 
	              textColour={Theme.Colours.chartColor2_Purple}
	              backgroundColour={Theme.Colours.white}
	              maxFontSize={60}
	              gridHeight={halfGridHeight}
	              expandable
	              onExpand={() => {
	                const modal = (
	                  <SimpleModal 
	                    onClose={() => this.context.app.setState({ modal: false }) }
	                    backgroundColour={'#388E3C'}
	                    textColour="#fff"
	                    icon="confirmation-number"
	                    label="ATTENDANCE DETAILS"
	                    maxLabelFontSize={32}
	                  >
	                    <EventAdmissionsDetails
	                      textColour="#fff"
	                      eventId={this.props.screenProps.event.id} 
	                    />
	                  </SimpleModal>
	                );
	                this.context.app.setState({
	                  modal: modal
	                });
	              }}
	            >
	              <View style={[Theme.Styles.column, { paddingHorizontal: 10, paddingVertical: 5, alignItems: 'flex-end' }]}>
	                <Text style={{ fontSize: 12 }} numberOfLines={1}>COMPED: <Text style={{ fontWeight: "500" }}>{this.state.comps.data.total}</Text></Text>
	                <Text style={{ fontSize: 12 }} numberOfLines={1}>...<Text style={{ fontWeight: "500" }}>MORE</Text></Text>
	              </View>
	            </NumberTile>
              
              </View>
              <View style={{ borderRightWidth: 1, borderRightColor: Theme.Colours.greyLight }}></View>
              </View>
              }
              <View style={[ styles.col, { flex: 1 } ]}>
                <NumberTile 
                  label="SALES" 
                  icon="monetization-on" 
                  value={salesAmount} 
                  alignValue="right"
                  gridHeight={halfGridHeight} 
                  textColour={Theme.Colours.chartColor2_Purple}
                  backgroundColour={Theme.Colours.white} 
                >
                </NumberTile>          
              </View>
            </View>
            </Animated.ScrollView>
          {this.renderLoading()}
        </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    backgroundColor: Theme.Colours.backgrounds.primary
  },
  overlay: {
    position: 'absolute',
    top: 0, right: 0, bottom: 0, left: 0,
    // backgroundColor: '#DEDEDEAA',
    // zIndex: 100
  },
  row: {
    flexDirection: 'row'
  },
  col: {
    flexDirection: 'column'
  },
  f1: {
    flex: 1
  },
  f2: {
    flex: 2
  },
  f3: {
    flex: 3
  },
  f4: {
    flex: 4
  },
  heading: {
    fontSize: Theme.Fonts.fontMedium,
    fontWeight: 'bold',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  subHeading: {
    fontSize: Theme.Fonts.fontLarge,
    padding: 8
  },
  revenue: {
    paddingHorizontal: 10,
    // paddingVertical: 5
  },
  currency: {
    paddingRight: 4
  },
  amount: {
  },
  card: {
    width: 150, height: 150, borderRadius: 75, alignSelf: 'center'
  }
});