import isEqual from 'lodash.isequal';
import Moment from 'moment';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  LayoutAnimation
} from 'react-native';
import { Button } from 'react-native-material-ui';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Animation } from '../../../lib/animation';
import { DefaultNavigationOptions } from '../../../navigator/headers';
import HeaderTitle from '../../../navigator/header-title';
import PopoverView from '../../../component/popover-view';
import PopoverViewMenuButton from '../../../component/popover-view-menu-button';
import PopoverViewDivider from '../../../component/popover-view-divider';
import BasicDialog from '../../../component/basic-dialog';
import EventsList from './events-list';
import DateRangeFilter from '../../../component/date-range-filter';
import NumberRangeFilter from '../../../component/number-range-filter';
import PickerFilter from '../../../component/picker-filter';
import MultiPickerFilter from '../../../component/multi-picker-filter';
import IconPill from '../../../component/icon-pill';
import RangePill from '../../../component/range-pill';
import TagPill from '../../../component/tag-pill';
import { default as Theme } from '../../../lib/theme';

const sortCriteria = {
  sorting: true,
  sortTime: 'upcoming',
  // sortTimeLabel: 'UPCOMING',
  sortType: 'date',
  // sortTypeLabel: 'DATE',
  sortDirection: 'ASC'
  // sortDirectionLabel: 'DESCENDING'
};

const filterCriteria = {
  visibleFilterTitle: '',
  filterFaves: false,
  filterType: null,
  filterByDate: {
    startDate: null,
    endDate: null,
  },
  filterByVenue: {
    ids: []
  },
  filterBySales: {
    min: 0,
    max: null
  },
  filterByEventType: {
    type: null
  },
  filterByEventGroup: {
    type: null
  }
};

export default class Events extends Component {

  static contextTypes = {
    app: PropTypes.object.isRequired
  }

  static navigationOptions = ({ navigation, screenProps }) => {
    // temporary, should be in state // bug in navigator
    if (!navigation.state.hasOwnProperty('params')) {
      navigation.state['params'] = {
        filterOpen: false,
        searchOpen: false,
        menuOpen: false,
        sortOpen: false,
      };
    }
  
    let headerStyle = {
       backgroundColor: Theme.Brand.primary,
    };
    if (navigation.state.params.searchOpen) {
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
      headerRight: (
        <View style={{ flexDirection: 'row', flex: 1 }}>        
          <Icon.Button
            style={{ flex: 1 }}
            name={'search'}
            size={22} 
            color={Theme.Colours.white} 
            backgroundColor={'transparent'} 
            iconStyle={{marginLeft: 10}}
            borderRadius={0}
            onPress={() => {
              if (!navigation.state.params.filterOpen) {
                navigation.setParams({searchOpen: !navigation.state.params.searchOpen});
              }
            }}
          />
        </View>
      ),
      headerStyle: headerStyle,
      headerTitle: (<HeaderTitle node="Registry::Insights::Scene::Events" value="Header Title" />)
    }
  }

  constructor(props, context) {
    super(props, context);
    
    this.checkFilter = this.checkFilter.bind(this);
    this.clearFilters = this.clearFilters.bind(this);
    this.filterPopover = this.filterPopover.bind(this);
    this.filterDialog = this.filterDialog.bind(this);
    this.sortPopover = this.sortPopover.bind(this);
    this.hidePopover = this.hidePopover.bind(this);
    this.applyFilterEventsByDate = this.applyFilterEventsByDate.bind(this);
    this.applyFilterEventsByVenue = this.applyFilterEventsByVenue.bind(this);
    this.applyFilterEventsBySales = this.applyFilterEventsBySales.bind(this);
    this.applyFilterEventsByEventType = this.applyFilterEventsByEventType.bind(this);
    this.applyFilterEventsByEventGroup = this.applyFilterEventsByEventGroup.bind(this);
    this.filterEventsByDate = this.filterEventsByDate.bind(this);
    this.filterEventsByVenue = this.filterEventsByVenue.bind(this);
    this.filterEventsBySales = this.filterEventsBySales.bind(this);
    this.filterEventsByEventType = this.filterEventsByEventType.bind(this);
    this.filterEventsByEventGroup = this.filterEventsByEventGroup.bind(this);
    this.filterFavourites = this.filterFavourites.bind(this);
    this.getPills = this.getPills.bind(this);
    this.onUnfilterAll = this.onUnfilterAll.bind(this);
    this.onUnfilterFavourites = this.onUnfilterFavourites.bind(this);
    this.onUnfilterDate = this.onUnfilterDate.bind(this);
    this.onUnfilterVenue = this.onUnfilterVenue.bind(this);
    this.onUnfilterSales = this.onUnfilterSales.bind(this);
    this.onUnfilterEventType = this.onUnfilterEventType.bind(this);
    this.onUnfilterEventGroup = this.onUnfilterEventGroup.bind(this);
    this.onEventsData = this.onEventsData.bind(this);
    this.renderFilter = this.renderFilter.bind(this);
    
    this.state = {
      eventsData: [],
      data: {
    	  eventCategories: [],
    	  eventGroups: [],
    	  eventVenues: {}
      },
      popoverVisible: false,
      filterVisible: false,
      ...filterCriteria,
      ...sortCriteria
    };
    
    context.app.getEventTypes()
    .then( data => {      
        const categories = [{
            key: '', value: 'Select Event Type'
        }];
        
        for (i in data) {
          categories.push({
              key: i, value: data[i]
          });
        }

    	this.setState({
    		data: {
    			...this.state.data,
    			eventCategories: categories
    		}
    	});
    });

    context.app.getEventGroups()
    .then( data => {      
        const groups = [{
            key: '', value: 'Select Event Group'
        }];
        
        for (i in data) {
          groups.push({
              key: i, value: data[i]
          });
        }

        this.setState({
            data: {
                ...this.state.data,
                eventGroups: groups
            }
        });
    });
        
    context.app.getEventVenues()
    .then( data => {
    	this.setState({
    		data: {
    			...this.state.data,
    			eventVenues: data.data
    		}
    	});
    });
  }
  
  filterPopover = () => (
    <PopoverView visible onPress={this.hidePopover}>
      <PopoverViewMenuButton label="Favorites" showIcon={'star'} action={this.filterFavourites} />
      <PopoverViewMenuButton label="Date" showIcon={'date-range'} action={this.filterEventsByDate} />
      <PopoverViewMenuButton label="Venue" showIcon={'place'} action={this.filterEventsByVenue} />
      {/*<PopoverViewMenuButton label="Sales" showIcon={'payment'} action={this.filterEventsBySales} />*/}
      <PopoverViewMenuButton label="Event Type" showIcon={'event-seat'} action={this.filterEventsByEventType} />
      <PopoverViewMenuButton label="Event Group" showIcon={'event-seat'} action={this.filterEventsByEventGroup} />
    </PopoverView>
  )
  
  filterDialog = () => (
    <BasicDialog 
      visible // ={this.state.filterVisible} 
      action={this.checkFilter}
      actionStyle={styles.filterAction}
      title={this.state.visibleFilterTitle}
      titleStyle={styles.filterTitle}
    >
      {this.renderFilter()}
    </BasicDialog>
  )
  
  sortPopover = () => (
    <PopoverView visible onPress={this.hidePopover}>
      <PopoverViewMenuButton label="UPCOMING" useEnabled enabled={this.state.sortTime === 'upcoming'} showIcon={'date-range'} action={() => this.setSortTime('upcoming', 'ASC')} />
      <PopoverViewMenuButton label="PAST" useEnabled enabled={this.state.sortTime === 'past'} showIcon={'event-available'} action={() => this.setSortTime('past', 'DESC')} />
      <PopoverViewDivider />
      <PopoverViewMenuButton label="DATE" useEnabled enabled={this.state.sortType === 'date'} showIcon={'event'} action={() => this.setSortType('date')} />
      <PopoverViewMenuButton label="ALPHABETICAL" useEnabled enabled={this.state.sortType === 'alpha'} showIcon={'sort-by-alpha'} action={() => this.setSortType('alpha')} />
      <PopoverViewDivider />
      <PopoverViewMenuButton label="ASCENDING" useEnabled enabled={this.state.sortDirection === 'ASC'} showIcon={'arrow-upward'} action={() => this.setSortDirection('ASC')} />
      <PopoverViewMenuButton label="DESCENDING" useEnabled enabled={this.state.sortDirection === 'DESC'} showIcon={'arrow-downward'} action={() => this.setSortDirection('DESC')} />
    </PopoverView>
  )    
    
  setSortTime = (sort, direction) => {
    this.props.navigation.setParams({ sortOpen: false });
    this.setState({
      sortTime: sort,
      sortDirection: direction
    }, () => {
      this.context.app.emit('events-filter-type-changed', { ...this.state });
    });
  }
  
  setSortType = (sort) => {
    this.props.navigation.setParams({ sortOpen: false });
    this.setState({
      sortType: sort
    }, () => {
      this.context.app.emit('events-filter-type-changed', { ...this.state });
    });
  }
  
  setSortDirection = (sort) => {
    this.props.navigation.setParams({ sortOpen: false });
    this.setState({
      sortDirection: sort
    }, () => {
      this.context.app.emit('events-filter-type-changed', { ...this.state });
    });
  }
  
  componentWillReceiveProps(nextProps) {
    if (nextProps.navigation.state.params.menuOpen) {
      this.context.app.setState({
        modal: this.filterPopover()
      });
    }
    else if (nextProps.navigation.state.params.filterOpen) {
      this.context.app.setState({
        modal: this.filterDialog()
      });
    }
    else if (nextProps.navigation.state.params.sortOpen) {
      this.context.app.setState({
        modal: this.sortPopover()
      });
    }
    else {
      this.context.app.setState({
        modal: false
      });
    }

    /*
    this.setState({
      popoverVisible: nextProps.navigation.state.params.menuOpen,
      filterVisible: nextProps.navigation.state.params.filterOpen,
    });
    */
  }
  
  componentWillUpdate() {
    LayoutAnimation.configureNext(Animation.slideFast);
  }
  
  componentWillMount() {
    this.context.app.connect('events-list-data-updated', this.onEventsData);
    this.context.app.connect('events-list-unfilter-favourites', this.onUnfilterFavourites);
    this.context.app.connect('events-list-unfilter-date', this.onUnfilterDate);
    this.context.app.connect('events-list-unfilter-venue', this.onUnfilterVenue);
    this.context.app.connect('events-list-unfilter-sales', this.onUnfilterSales);
    this.context.app.connect('events-list-unfilter-eventtype', this.onUnfilterEventType);
    this.context.app.connect('events-list-unfilter-eventgroup', this.onUnfilterEventGroup);
    this.context.app.connect('events-list-unfilter-all', this.onUnfilterAll);
  }
  
  componentDidMount() {
    this.context.app.trackScreenView('Events');
  }

  componentWillUnmount() {
    this.context.app.disconnect('events-list-data-updated', this.onEventsData);
    this.context.app.disconnect('events-list-unfilter-favourites', this.onUnfilterFavourites);
    this.context.app.disconnect('events-list-unfilter-date', this.onUnfilterDate);
    this.context.app.disconnect('events-list-unfilter-venue', this.onUnfilterVenue);
    this.context.app.disconnect('events-list-unfilter-sales', this.onUnfilterSales);
    this.context.app.disconnect('events-list-unfilter-eventtype', this.onUnfilterEventType);
    this.context.app.disconnect('events-list-unfilter-eventgroup', this.onUnfilterEventGroup);
    this.context.app.disconnect('events-list-unfilter-all', this.onUnfilterAll);
  }
  
  onEventsData(data) {
    this.setState({
      eventsData: data.data
    });
  }
  
  onUnfilterAll() {
    this.setState({
      filterFaves: false,
      ...filterCriteria
    }, () => {
      this.context.app.emit('events-filter-type-changed', { ...this.state });
    });
  }
  
  onUnfilterFavourites() {
    this.setState({
      filterFaves: false
    }, () => {
      this.context.app.emit('events-filter-type-changed', { ...this.state });
    });
  }

  onUnfilterDate() {
    this.setState({
      filterByDate: {
        ...this.state.filterByDate,
        ...filterCriteria.filterByDate
      }
    }, () => {
      this.context.app.emit('events-filter-type-changed', { ...this.state });
    });
  }
  
  onUnfilterVenue() {
    this.setState({
      filterByVenue: {
        ...this.state.filterByVenue,
        ...filterCriteria.filterByVenue
      }
    }, () => {
      this.context.app.emit('events-filter-type-changed', { ...this.state });
    });
  }
  
  onUnfilterSales() {
    this.setState({
      filterBySales: {
        ...this.state.filterBySales,
        ...filterCriteria.filterBySales
      }
    }, () => {
      this.context.app.emit('events-filter-type-changed', { ...this.state });
    });
  }
  
  onUnfilterEventType() {
    this.setState({
      filterByEventType: {
        ...this.state.filterByEventType,
        ...filterCriteria.filterByEventType
      }
    }, () => {
      this.context.app.emit('events-filter-type-changed', { ...this.state });
    });
  }
  
  onUnfilterEventGroup() {
    this.setState({
      filterByEventGroup: {
        ...this.state.filterByEventGroup,
        ...filterCriteria.filterByEventGroup
      }
    }, () => {
      this.context.app.emit('events-filter-type-changed', { ...this.state });
    });
  }  
  
  checkFilter(action) {
    switch (action) {
      case 'Apply':
        switch (this.state.filterType) {
          case 'filterByDate':
            this.applyFilterEventsByDate();
            break;
          case 'filterByVenue':
            this.applyFilterEventsByVenue();
            break;
          case 'filterBySales':
            this.applyFilterEventsBySales();
            break;
          case 'filterByEventType':
            this.applyFilterEventsByEventType();
            break;
          case 'filterByEventGroup':
            this.applyFilterEventsByEventGroup();
            break;
        }
        break;
    }
    this.props.navigation.setParams({ filterOpen: false, filterType: null });
  }
  
  hidePopover() {
    this.props.navigation.setParams({ menuOpen: false, filterOpen: false, sortOpen: false });
  }
  
  applyFilterEventsByDate() {
    const dateRange = this._filter.getFilter();
    this.setState({ 
      visibleFilterTitle: '',
      filterByDate: {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      }
    }, () => {
      this.context.app.emit('events-filter-type-changed', { ...this.state });
    });
  }

  applyFilterEventsByVenue() {
    const venues = this._filter.getFilter();
    if (venues.type !== null) {
        
        const venue = this.state.data.eventVenues.reduce( (data, item) => {
          if (venues.type === item.key) {
            data['id'] = item.key;
            data['name'] = item.value;
          }
          return data;
        }, {}); 
        
	    this.setState({ 
	      visibleFilterTitle: '',
	      filterByVenue: {
	        ids: [venue]
	      }
	    }, () => {
	      this.context.app.emit('events-filter-type-changed', { ...this.state });
	    });
	}
	else {
	    this.setState({ 
	      visibleFilterTitle: '',
	      filterByVenue: {
	        ids: []
	      }
	    }, () => {
	      this.context.app.emit('events-filter-type-changed', { ...this.state });
	    });
	}
  }

  applyFilterEventsBySales() {
    const sales = this._filter.getFilter();
    this.setState({ 
      visibleFilterTitle: '',
      filterBySales: {
        min: sales.min,
        max: sales.max
      }
    }, () => {
      this.context.app.emit('events-filter-type-changed', { ...this.state });
    });
  }

  applyFilterEventsByEventType() {
    const eventType = this._filter.getFilter();
    console.log('--- eventType', eventType);
    
    this.setState({ 
      visibleFilterTitle: '',
      filterByEventType: {
        type: eventType.type
      }
    }, () => {
      this.context.app.emit('events-filter-type-changed', { ...this.state });
    });
  }

  applyFilterEventsByEventGroup() {
    const eventGroup = this._filter.getFilter();
    console.log('--- eventGroup', eventGroup);
    
    this.setState({ 
      visibleFilterTitle: '',
      filterByEventGroup: {
        type: eventGroup.type
      }
    }, () => {
      this.context.app.emit('events-filter-type-changed', { ...this.state });
    });
  }

  filterEventsByDate() {
    this.setState({ visibleFilterTitle: 'Filter By Date', filterType: 'filterByDate' }, () => {
      this.props.navigation.setParams({ menuOpen: false, filterOpen: true });
    });
  }
  
  filterEventsByVenue() {
    this.setState({ visibleFilterTitle: 'Filter By Venue', filterType: 'filterByVenue' }, () => {
      this.props.navigation.setParams({ menuOpen: false, filterOpen: true });
    });
  }
  
  filterEventsBySales() {
    this.setState({ visibleFilterTitle: 'Filter By Sales', filterType: 'filterBySales' }, () => {
      this.props.navigation.setParams({ menuOpen: false, filterOpen: true });
    });
  }
  
  filterEventsByEventType() {
    this.setState({ visibleFilterTitle: 'Filter By Event Type', filterType: 'filterByEventType' }, () => {
      this.props.navigation.setParams({ menuOpen: false, filterOpen: true });
    });    
  }

  filterEventsByEventGroup() {
    this.setState({ visibleFilterTitle: 'Filter By Event Group', filterType: 'filterByEventGroup' }, () => {
      this.props.navigation.setParams({ menuOpen: false, filterOpen: true });
    });    
  }
  
  filterFavourites() {
    this.props.navigation.setParams({ menuOpen: false });
    this.setState({
      filterFaves: !this.state.filterFaves,
    }, () => {
      this.context.app.emit('events-filter-type-changed', { ...this.state });
    });
  }
  
  clearFilters() {
    this.props.navigation.setParams({ menuOpen: false, filterOpen: false });
    this.setState({
      ...filterCriteria
    }, () => {
      this.context.app.emit('events-filter-type-changed', { ...this.state });
    });
  }

  getPills(state) {
    let pills = [];
    
    if (this.state.filterFaves) {
      pills.push(
        <IconPill
          key={'favourites'}
          icon={'star'}
          onRemove={() => {
            this.context.app.emit('events-list-unfilter-favourites', {});
          }}
        />
      );
    }

    if (this.state.filterByDate
        && ( this.state.filterByDate.startDate != null || this.state.filterBySales.endDate != null)
      ) {
      let dateProps = {};

      if (this.state.filterByDate.startDate) {
        const startDate = Moment(this.state.filterByDate.startDate).format('YYYY-MM-DD');
        dateProps['min'] = startDate;
      }

      if (this.state.filterByDate.endDate) {
        const endDate = Moment(this.state.filterByDate.endDate).format('YYYY-MM-DD');
        dateProps['max'] = endDate;
      }
     
      pills.push(
        <RangePill
          key={'date'} {...dateProps}
          icon={'date-range'}
          onRemove={() => {
            this.context.app.emit('events-list-unfilter-date', {});
          }}
        />
      );     
    }
    
    if (this.state.filterByVenue && this.state.filterByVenue.ids.length > 0) {
      pills.push(
        <TagPill
          key={'venue'}
          icon={'place'}
          tag={this.state.filterByVenue.ids[0].name}
          onRemove={() => {
            this.context.app.emit('events-list-unfilter-venue', { type: this.state.filterByVenue });
          }}
        />
      );
    }
    
    if (this.state.filterBySales
        && ( this.state.filterBySales.min != '0' || this.state.filterBySales.max != null)
      ) {
      let salesProps = {};
      let salesMin = Number(this.state.filterBySales.min);
      salesProps['min'] = salesMin.toString();
      
      let salesMax = Number(this.state.filterBySales.max);
      if (salesMax !== 0) {
        salesProps['max'] = salesMax.toString();
      }
      
      pills.push(
        <RangePill
          key={'sales'} {...salesProps}
          icon={'payment'}
          onRemove={() => {
            this.context.app.emit('events-list-unfilter-sales', {});
          }}
        />
      );     
    }

    if (this.state.filterByEventType && this.state.filterByEventType.type && this.state.filterByEventType.type.length > 0) {
      pills.push(
        <TagPill
          key={'event-type'}
          icon={'event-seat'}
          tag={this.state.filterByEventType.type}
          onRemove={() => {
            this.context.app.emit('events-list-unfilter-eventtype', { type: this.state.filterByEventType.type });
          }}
        />
      );
    }
    
    if (this.state.filterByEventGroup && this.state.filterByEventGroup.type && this.state.filterByEventGroup.type.length > 0) {
      pills.push(
        <TagPill
          key={'event-group'}
          icon={'event-seat'}
          tag={this.state.filterByEventGroup.type}
          onRemove={() => {
            this.context.app.emit('events-list-unfilter-eventgroup', { type: this.state.filterByEventGroup.type });
          }}
        />
      );
    }
    return pills;
  }
  
  renderFilter() {
    switch (this.state.filterType) {
      case 'filterByDate':
        return (
          <DateRangeFilter 
            ref={c => this._filter = c } 
            startDate={this.state.filterByDate.startDate}
            endDate={this.state.filterByDate.endDate}
          />
        );
        break;
      case 'filterByVenue':
        let venue = null;
        if (this.state.filterByVenue.ids.length > 0) {
          venue = this.state.filterByVenue.ids[0].id;
        }
        
        return (
          <PickerFilter 
            ref={c => this._filter = c}
            type={venue}
            items={this.state.data.eventVenues}
          />
        );
        break;
      case 'filterBySales':
      
        let salesProps = {};
        let salesMin = Number(this.state.filterBySales.min);
        salesProps['min'] = salesMin;
        let salesMax = Number(this.state.filterBySales.max);
        if (salesMax > salesMin) {
          salesProps['max'] = salesMax;
        }
 
        return (
          <NumberRangeFilter ref={c => this._filter = c } {...salesProps} />
        );
        break;
      case 'filterByEventType':
        return (
          <PickerFilter 
            ref={c => this._filter = c }
            type={this.state.filterByEventType.type}
            items={this.state.data.eventCategories} 
          />
        );
        break;
      case 'filterByEventGroup':
        return (
          <PickerFilter 
            ref={c => this._filter = c }
            type={this.state.filterByEventGroup.type}
            items={this.state.data.eventGroups} 
          />
        );
        break;
    }
    return null;
  }
 
  render() {
    const favIcon = this.state.filterFaves ? 'star' : 'star-border';

    const pills = this.getPills();

    return (
      <View style={styles.container}>
        <EventsList 
          screenProps={{ 
            navigation: this.props.navigation,
            eventsData: this.state.eventsData,
            pills: pills,
          }}
        />
        {/*this.renderFilterDialog()*/}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    // alignItems: 'center',
    backgroundColor: Theme.Colours.backgrounds.primary,
  },
  filterTitle: {
    color: 'rgb(31, 75, 86)',
    fontWeight: "300",
    fontSize: Theme.Fonts.fontLarge,
    fontFamily: 'System'
  },
  filterAction: {
    color: 'rgb(31, 75, 86)',
    fontWeight: "100",
    fontFamily: 'System'
  },
  
});