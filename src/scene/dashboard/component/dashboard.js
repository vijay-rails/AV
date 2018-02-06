import Moment from 'moment';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  Platform, 
  UIManager, 
  LayoutAnimation, 
  TouchableHighlight,
  DatePickerAndroid,
  DatePickerIOS
} from 'react-native';
import { TabNavigator } from 'react-navigation';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Animation } from '../../../lib/animation';
import { DefaultNavigationOptions } from '../../../navigator/headers';
import HeaderTitle from '../../../navigator/header-title';
import BasicDialog from '../../../component/basic-dialog';
import DateRangeFilter from '../../../component/date-range-filter';
// import TimeframeDropdown from '../../../component/timeframe-dropdown';
import PopoverView from '../../../component/popover-view';
import PopoverViewMenuButton from '../../../component/popover-view-menu-button';
import SimpleModal from '../../../component/simple-modal';
import SimpleDialog from '../../../component/simple-dialog';
import DatePickerDialog from '../../../component/date-picker-dialog';
import { default as Theme } from '../../../lib/theme';
import Events from './events';

export default class Dashboard extends Component {
  static contextTypes = {
    app: PropTypes.object.isRequired
  }
  
  static navigationOptions = ({ navigation, screenProps }) => {
	  // temporary, should be in state // bug in navigator
	  if (!navigation.state.hasOwnProperty('params')) {
	    navigation.state['params'] = {
	      filterOpen: false,
	    };
	  }
	
	  const right = (
	    <View style={{ flexDirection: 'row', flex: 1 }}>
	      <Icon.Button
	        style={{ flex: 1 }}
	        name={'date-range'}
	        size={22} 
	        color={Theme.Colours.white} 
	        backgroundColor={'transparent'} 
	        iconStyle={{marginLeft: 10}}
	        borderRadius={0}
	        onPress={() => {
	          navigation.setParams({ filterOpen: !navigation.state.params.filterOpen });
	        }}
	      />
	    </View>
	  );
	
	  let headerStyle = {
	     backgroundColor: Theme.Brand.primary,
	  };
	  if (navigation.state.params.filterOpen) {
	    headerStyle = {
	        backgroundColor: Theme.Brand.primary,
	        elevation: 0,
	        shadowColor: 'transparent',
	        shadowOffset: {
	          width: 0,
	          height: 0
	        },
	    };
	  }
	  
	return {
	  ...DefaultNavigationOptions({ navigation }),
	  headerRight: right,
	  headerStyle: headerStyle,
	  headerTitle: (<HeaderTitle node="Registry::Insights::Scene::Dashboards" value="Header Title" />)
	}
  }
  
  constructor(props, context) {
    super(props, context);   
    
    const startDate = Moment().subtract(1, 'w');
    const endDate = Moment();
    
    this.state = {
    		
      transientStartDate: null,
      transientEndDate: null,
      
      startDate: startDate.format('YYYY-MM-DD'),
      startDateFormatted: startDate.format('MMM DD/YY').toUpperCase(),
      endDate: endDate.format('YYYY-MM-DD'),
      endDateFormatted: endDate.format('MMM DD/YY').toUpperCase(),
      // timeframeDropdownVisible: false,
      timeframeFilterVisible: false,
      timeframeOption: 'last-week',
      timeframeLabel: 'PAST WEEK',
      timeframePopoverPosition: {
        x: 15,
        y: 50
      }
    };
    
    this.checkFilter = this.checkFilter.bind(this);
    this.filterByAllTime = this.filterByAllTime.bind(this);
    this.filterByLastWeek = this.filterByLastWeek.bind(this);
    this.filterByLastMonth = this.filterByLastMonth.bind(this);
    this.filterByLastThreeMonths = this.filterByLastThreeMonths.bind(this);
    this.filterByLastYear = this.filterByLastYear.bind(this);
    this.filterByThisYear = this.filterByThisYear.bind(this);
    this.filterByRange = this.filterByRange.bind(this);
    this.filterPopover = this.filterPopover.bind(this);
    this.onPressStartDate = this.onPressStartDate.bind(this);
    this.onPressEndDate = this.onPressEndDate.bind(this);
        
    if (Platform.OS === 'android') {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }
  
  checkFilter(action) {
    switch (action) {
      case 'Apply':
        const filter = this._filter.getFilter();
        
        const startDate = Moment(filter.startDate);
        const endDate = Moment(filter.endDate);
        
        this.setState({
          startDate: startDate.format('YYYY-MM-DD'),
          startDateFormatted: startDate.format('MMM DD/YY').toUpperCase(),
          endDate: endDate.format('YYYY-MM-DD'),
          endDateFormatted: endDate.format('MMM DD/YY').toUpperCase(),
          rangeFilterDialogOpen: false,
          range: null
        });
      break;
    }
    this.context.app.setState({
      modal: false
    });
  }

  filterByAllTime() {
    
    this.setState({
      startDate: null,
      startDateFormatted: null,
      endDate: null,
      endDateFormatted: null,
      timeframeOption: 'all-time',
      timeframeLabel: 'ALL TIME',
      customRange: false
      // timeframeDropdownVisible: false
    });
    this.context.app.setState({
      modal: false
    });
  }
  
  filterByLastWeek() {    
    const startDate = Moment().subtract(1, 'w');
    const endDate = Moment();
    
    this.setState({
      startDate: startDate.format('YYYY-MM-DD'),
      startDateFormatted: startDate.format('MMM DD/YY').toUpperCase(),
      endDate: endDate.format('YYYY-MM-DD'),
      endDateFormatted: endDate.format('MMM DD/YY').toUpperCase(),
      timeframeOption: 'last-week',
      timeframeLabel: 'PAST WEEK',
      customRange: false
      // timeframeDropdownVisible: false
    });
    this.context.app.setState({
      modal: false
    });
  }

  filterByLastMonth() {    
    const startDate = Moment().subtract(1, 'month');
    const endDate = Moment();
    
    this.setState({
      startDate: startDate.format('YYYY-MM-DD'),
      startDateFormatted: startDate.format('MMM DD/YY').toUpperCase(),
      endDate: endDate.format('YYYY-MM-DD'),
      endDateFormatted: endDate.format('MMM DD/YY').toUpperCase(),
      timeframeOption: 'last-1-month',
      timeframeLabel: 'PAST MONTH',
      customRange: false
      // timeframeDropdownVisible: false
    });
    this.context.app.setState({
      modal: false
    });
  }
  
  filterByLastThreeMonths() {    
    const startDate = Moment().subtract(3, 'months');
    const endDate = Moment();
    
    this.setState({
      startDate: startDate.format('YYYY-MM-DD'),
      startDateFormatted: startDate.format('MMM DD/YY').toUpperCase(),
      endDate: endDate.format('YYYY-MM-DD'),
      endDateFormatted: endDate.format('MMM DD/YY').toUpperCase(),
      timeframeOption: 'last-3-month',
      timeframeLabel: 'PAST 3 MONTHS',
      customRange: false
      // timeframeDropdownVisible: false
    });
    this.context.app.setState({
      modal: false
    });
  }

  filterByRange() {
    const startDate = Moment(this.state.startDate);
    const endDate = Moment(this.state.endDate);
    
    this.setState({
      startDate: startDate.format('YYYY-MM-DD'),
      startDateFormatted: startDate.format('MMM DD/YY').toUpperCase(),
      endDate: endDate.format('YYYY-MM-DD'),
      endDateFormatted: endDate.format('MMM DD/YY').toUpperCase(),
      timeframeOption: 'set-range',
      timeframeLabel: 'SET RANGE',
      // timeframeDropdownVisible: false
    });
    this.context.app.setState({
      modal: false
    });
  }
	
  // #3064340
  
  filterByThisYear() {
    const thisYear = (new Date()).getFullYear();    
    const start = new Date("1/1/" + thisYear);
    const startDate = Moment(start.valueOf());
    const endDate = Moment();

    this.setState({
      startDate: startDate.format('YYYY-MM-DD'),
      startDateFormatted: startDate.format('MMM DD/YY').toUpperCase(),
      endDate: endDate.format('YYYY-MM-DD'),
      endDateFormatted: endDate.format('MMM DD/YY').toUpperCase(),
      timeframeOption: 'this-year',
      timeframeLabel: 'THIS YEAR',
      customRange: false
      // timeframeDropdownVisible: false
    });
    this.context.app.setState({
      modal: false
    });
  }
  
  filterByLastYear() {
    const lastYear = Moment().subtract(1, 'y').toDate().getFullYear();
    
    const start = new Date("1/1/" + lastYear);
    const startDate = Moment(start.valueOf());
    
    const end = new Date("12/1/" + lastYear);    
    const endDate = Moment(end.valueOf()).endOf('month');

    this.setState({
      startDate: startDate.format('YYYY-MM-DD'),
      startDateFormatted: startDate.format('MMM DD/YY').toUpperCase(),
      endDate: endDate.format('YYYY-MM-DD'),
      endDateFormatted: endDate.format('MMM DD/YY').toUpperCase(),
      timeframeOption: 'last-year',
      timeframeLabel: 'LAST YEAR',
      // timeframeDropdownVisible: false
    });
    this.context.app.setState({
      modal: false
    });
  }
  
  componentWillReceiveProps(nextProps) {
    if (nextProps.navigation.state.params.filterOpen !== this.state.timeframeFilterVisible) {
      this.setState({ timeframeFilterVisible: nextProps.navigation.state.params.filterOpen });
    }
  }
  
  componentWillUpdate() {
    LayoutAnimation.configureNext(Animation.slideFast);
  }
  
  componentDidMount() {
    this.context.app.trackScreenView('Dashboard');
  }

  async onPressStartDate() {
	  
    if (Platform.OS === 'android') {
      try {
        const { action, year, month, day } = await DatePickerAndroid.open({
          // Use `new Date()` for current date.
          // May 25 2020. Month 0 is January.
          date: Moment(this.state.startDate).toDate(),
          maxDate: Moment(this.state.endDate).toDate(),
          // date: new Date(2020, 4, 25)
        });
        if (action !== DatePickerAndroid.dismissedAction) {
          this.setState({
            startDate: Moment(new Date(year, month, day)).format('YYYY-MM-DD'),
            startDateFormatted: Moment(new Date(year, month, day)).format('MMM DD/YY').toUpperCase(),
            timeframeOption: 'set-range',
            timeframeLabel: 'SET RANGE',
          });
        }
      } 
      catch ({code, message}) {
        console.warn('Cannot open date picker', message);
      }
    }
    else if (Platform.OS === 'ios') {
      const modal = (
        <DatePickerDialog visible date={this.state.startDate} maxDate={this.state.endDate}
          title={"Select Start Date"}
          onPressVoid={() => {
            this.context.app.setState({
    	      modal: false
            });  	
          }}
          onDismiss={() => {
            this.context.app.setState({
              modal: false
            });
          }}
          onApply={ date => {
         	this.setState({
       	      startDate: date,
              startDateFormatted: Moment(date).format('MMM DD/YY').toUpperCase(),
              timeframeOption: 'set-range',
        	  timeframeLabel: 'SET RANGE',
            }, () => {
              this.context.app.setState({
                modal: false
              });
       	    });
          }}
        />
      );
      
      this.context.app.setState({
    	modal: modal
      }); 
    }
  }

  async onPressEndDate() {
    if (Platform.OS === 'android') {
      try {
	    const { action, year, month, day } = await DatePickerAndroid.open({
          // Use `new Date()` for current date.
          // May 25 2020. Month 0 is January.
          date: Moment(this.state.endDate).toDate(),
          minDate: Moment(this.state.startDate).toDate(),
          // date: new Date(2020, 4, 25)
        });
        if (action !== DatePickerAndroid.dismissedAction) {
          this.setState({
            endDate: Moment(new Date(year, month, day)).format('YYYY-MM-DD'),
            endDateFormatted: Moment(new Date(year, month, day)).format('MMM DD/YY').toUpperCase(),
            timeframeOption: 'set-range',
            timeframeLabel: 'SET RANGE',
          });
        }
      } 
      catch ({code, message}) {
        console.warn('Cannot open date picker', message);
      }
    }
    else if (Platform.OS === 'ios') {
      const modal = (
        <DatePickerDialog visible date={this.state.endDate} minDate={this.state.startDate}
          title={"Select End Date"}
          onPressVoid={() => {
            this.context.app.setState({
  	          modal: false
            });  	
          }}
          onDismiss={() => {
            this.context.app.setState({
              modal: false
            });
          }} 
          onApply={ date => {
            this.setState({
     	      endDate: date,
              endDateFormatted: Moment(date).format('MMM DD/YY').toUpperCase(),
              timeframeOption: 'set-range',
      	      timeframeLabel: 'SET RANGE',
            }, () => {
              this.context.app.setState({
                modal: false
              });
     	    });
          }}
        />
      );
    
      this.context.app.setState({
  	    modal: modal
      });
    }
  }  
  
  renderDatePicker(props) {
    return (
      <DatePickerIOS {...props} />
    );
  }
  
  renderDateRangeDates() {
    if (this.state.timeframeOption === 'all-time') {
      return null;
    }

    return (
      <View style={[Theme.Styles.column]}>
        <View style={[Theme.Styles.row, { alignItems: 'center' } ]}>
          <TouchableHighlight underlayColor="transparent" style={{ borderBottomWidth: 2, borderBottomColor: Theme.Brand.primaryLight }}
            onPress={this.onPressStartDate}
          >
            <Text style={[Theme.Styles.textMedium, {textAlign: 'right'}]} >{this.state.startDateFormatted}</Text>
          </TouchableHighlight>

          <Text style={[Theme.Styles.textSmall, {textAlign: 'center', marginHorizontal: 5 }]} >-</Text>

          <TouchableHighlight underlayColor="transparent" style={{ borderBottomWidth: 2, borderBottomColor: Theme.Brand.primaryLight }}
            onPress={this.onPressEndDate}
          >
            <Text style={[Theme.Styles.textMedium, {textAlign: 'left' }]} >{this.state.endDateFormatted}</Text>
          </TouchableHighlight>
        </View>
      </View>
    );
  }
  
  filterPopover = (position) => (
    <PopoverView visible position="left" 
      onPress={() => {
        this.context.app.setState({
          modal: false
        });
      }}
      cardContainerStyle={{
        marginTop: position.y,
        marginLeft: position.x
      }}
    >
        <PopoverViewMenuButton label="ALL TIME" useEnabled enabled={this.state.timeframeOption === 'all-time'} style={styles.popoverButton} action={this.filterByAllTime} showIcon={false} />
        <PopoverViewMenuButton label="PAST WEEK" useEnabled enabled={this.state.timeframeOption === 'last-week'} style={styles.popoverButton} action={this.filterByLastWeek} showIcon={false} />
        <PopoverViewMenuButton label="PAST MONTH" useEnabled enabled={this.state.timeframeOption === 'last-month'} style={styles.popoverButton} action={this.filterByLastMonth} showIcon={false} />
        <PopoverViewMenuButton label="PAST 3 MONTHS" useEnabled enabled={this.state.timeframeOption === 'last-3-month'} style={styles.popoverButton} action={this.filterByLastThreeMonths} showIcon={false} />
        <PopoverViewMenuButton label="THIS YEAR" useEnabled enabled={this.state.timeframeOption === 'this-year'} style={styles.popoverButton} action={this.filterByThisYear} showIcon={false} />
        <PopoverViewMenuButton label="LAST YEAR" useEnabled enabled={this.state.timeframeOption === 'last-year'} style={styles.popoverButton} action={this.filterByLastYear} showIcon={false} />
        <PopoverViewMenuButton label="SET RANGE" useEnabled enabled={this.state.timeframeOption === 'set-range'} style={styles.popoverButton} action={this.filterByRange} showIcon={false} />
    </PopoverView>
  )
  
  renderDateRange() {
    const { timeframeFilterVisible } = this.state;
    
    if (!timeframeFilterVisible) {
      return null;
    }
    
    let styles = [{ flexDirection: 'row', backgroundColor: Theme.Brand.primary }];
    if (Platform.OS === 'ios') {
      styles.push(Theme.Styles.elevation);
    }
    
    return (
      <View style={styles} elevation={5} >
        <TouchableHighlight 
          underlayColor={'transparent'} 
          onPress={() => {
		    this.context.app.setState({
              modal: this.filterPopover(this.state.timeframePopoverPosition)
            });
          }} 
          style={{ flexDirection: 'column', paddingVertical: 15, flex: 1 }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 20, paddingRight: 5 }}>          
            <Text style={Theme.Styles.textMedium} numberOfLines={1}>{this.state.timeframeLabel}</Text>
             <Icon
               name={'arrow-drop-down'}
               size={22} 
               color={Theme.Colours.white} 
             />
          </View>
        </TouchableHighlight>
        <View style={{ flexDirection: 'column', paddingVertical: 15, flex: 1 }}> 
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent:'flex-end', paddingRight: 20, paddingLeft: 5 }}>
          {this.renderDateRangeDates()}          
          </View>
        </View>
      </View>
    );
  }
  
  render() {    
    return (
      <View style={styles.container}>        
        {this.renderDateRange()}
        
        {/*}
        <View style={{ flex: 1, flexDirection: 'column' }}>
          <DashboardTabNavigator screenProps={{ startDate: this.state.startDate, endDate: this.state.endDate }}/>
        </View>
        {*/}
        <Events screenProps={{ startDate: this.state.startDate, endDate: this.state.endDate }} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    backgroundColor: Theme.Colours.backgrounds.primary,
  },
  filterTitle: {
    color: 'rgb(31, 75, 86)',
    fontWeight: "200",
    fontSize: Theme.Fonts.fontLarge
  },
  filterAction: {
    color: 'rgb(31, 75, 86)',
    fontWeight: "100"
  },
  popoverButton: {
    // marginLeft: 10, 
    justifyContent: 'flex-start'
  }
});