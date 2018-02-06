import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableHighlight,
  LayoutAnimation,
  Platform
} from 'react-native';
import { TabNavigator } from 'react-navigation';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Animation } from '../../../lib/animation';
import { DefaultNavigationOptions } from '../../../navigator/headers';
import HeaderTitle from '../../../navigator/header-title';
import BasicDialog from '../../../component/basic-dialog';
import PopoverView from '../../../component/popover-view';
import PopoverViewMenuButton from '../../../component/popover-view-menu-button';
import PopoverViewDivider from '../../../component/popover-view-divider';
import NumberRangeFilter from '../../../component/number-range-filter';
import CurrencyRangeSliderFilter from '../../../component/currency-range-slider-filter';
import PeopleList from './people-list';
import Map from './map';
import EventsRangeFilter from './events-range-filter';
import CustomerProfileFilter from './customer-profile-filter';
import IconPill from '../../../component/icon-pill';
import RangePill from '../../../component/range-pill';
import TagPill from '../../../component/tag-pill';
import { default as Theme } from '../../../lib/theme';


const sortCriteria = {
    sorting: true,
    sortType: 'sortByActivity',
    sortTypeLabel: 'Last Active',
    sortDirection: 'DESC'
};

const filterCriteria = {
    visibleFilterTitle: '',
    filterType: null,
    filterFaves: false,
    filterByFundraising: {
      type: null,
      amountMin: 0,
      amountMax: null,
      period: null
    },
    filterBySpend: {
      type: null,
      amountMin: 0,
      amountMax: null,
      ordersMin: 0,
      ordersMax: null,
    },
    filterByEvents: {
      min: 0,
      max: null,
      period: null
    },
    filterByProfile: {
      customerTags: [],
      // memberships: [],
      // customerTypes: [],
      // affiliations: [],
      // pointsMin: 0,
      // pointsMax: null
    }
};

export default class People extends Component {

  static contextTypes = {
    app: PropTypes.object.isRequired
  }
  
  static navigationOptions = ({ navigation, screenProps }) => {
    // temporary, should be in state // bug in navigator
	if (!navigation.state.hasOwnProperty('params')) {
	  navigation.state['params'] = {
	      sortOpen: false,
	      filterOpen: false,
	      filterDialogOpen: false,
	      selectedTab: null,
	      searchOpen: false
	  };
	}
	
	let right = null;
	if (navigation.state.params.selectedTab === null || navigation.state.params.selectedTab == 'PeopleListTab') {
	  right = (
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
	          navigation.setParams({searchOpen: !navigation.state.params.searchOpen, filterOpen: false, sortOpen: false});
	        }}
	      />  
	    </View>
	  );
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
	  headerRight: right,
	  headerStyle: headerStyle,
	  headerTitle: (<HeaderTitle node="Registry::Insights::Scene::People" value="Header Title" />)
	}
  }

  constructor(props, context) {
    super(props, context);

    this.clearFilter = this.clearFilter.bind(this);
    this.checkFilter = this.checkFilter.bind(this);
    this.hideSortPopover = this.hideSortPopover.bind(this);
    this.hideFilterPopover = this.hideFilterPopover.bind(this);
    this.applySorting = this.applySorting.bind(this);
    this.applySortDirection = this.applySortDirection.bind(this);
    this.openFilter = this.openFilter.bind(this);
    this.filterFavourites = this.filterFavourites.bind(this);
    this.onUnfilterAll = this.onUnfilterAll.bind(this);
    this.onUnfilterFavourites = this.onUnfilterFavourites.bind(this);
    this.onUnfilterFundraising = this.onUnfilterFundraising.bind(this);
    this.onUnfilterSpend = this.onUnfilterSpend.bind(this);
    this.onUnfilterEvents = this.onUnfilterEvents.bind(this);
    this.onUnfilterProfileCustomerTags = this.onUnfilterProfileCustomerTags.bind(this);
    this.onPeopleData = this.onPeopleData.bind(this);
    this.getPills = this.getPills.bind(this);
    this.filterPopover = this.filterPopover.bind(this);
    this.filterDialog = this.filterDialog.bind(this);
    this.renderFilter = this.renderFilter.bind(this);  
    this.sortPopover = this.sortPopover.bind(this);
  
    this.state = {
        peopleData: [],
        ...sortCriteria,
        ...filterCriteria,
        showLocation: true
    };

    const component = this;
    /*
    this.PeopleTabNavigator = TabNavigator({
      PeopleListTab: {
        screen: PeopleList,
        navigationOptions: {
          title: 'LIST',
        }
      },
      MapTab: {
        screen: Map,
        navigationOptions: {
          title: 'MAP',
        }
      }
    },{
      tabBarPosition: 'bottom',
      tabBarOptions: {
        activeTintColor: Theme.Colours.white,
        inactiveTintColor: '#1c1f2a',
        indicatorStyle: {
          backgroundColor: Theme.Colours.white,
          height: 5
        },
        style: {
          backgroundColor: '#2b87a2'
        },
        onTabPress: (tab) => {
          props.navigation.setParams({ selectedTab: tab.key });
        },
        labelStyle: {
        	fontFamily: 'System',
        	fontSize: Theme.Fonts.fontSmall,
        },
        tabStyle: {
        	paddingBottom: Platform.OS === 'android' ? 10 : 15
        }
      }
    });
    */
  }

  applySorting(type, label) {
    this.props.navigation.setParams({ sortOpen: false });
    if (this.state.sortType !== type) {

      if (type === 'sortByAlpha') {
        this.setState({ 
          sortType: type, 
          sortTypeLabel: label, 
          showLocation: true,
          sorting: true }, () => {
          this.context.app.emit('people-sort-type-changed', { ...this.state });
        });
      } else {
        this.setState({ 
          sortType: type, 
          sortTypeLabel: label, 
          showLocation: false,
          sorting: true }, () => {
          this.context.app.emit('people-sort-type-changed', { ...this.state });
        });
      }
    }
  }
  
  applySortDirection(direction) {
    this.props.navigation.setParams({ sortOpen: false });
    if (this.state.sortDirection !== direction) {
      this.setState({ sortDirection: direction }, () => {
        this.context.app.emit('people-sort-type-changed', { ...this.state });
      });
    }
  }

  hideSortPopover() {
    this.props.navigation.setParams({ sortOpen: false });
  }

  applyFilterByFundraising() {
    const range = this._filter.getFilter();

    this.setState({ 
      visibleFilterTitle: '',
      filterByFundraising: {
        amountMin: range.values.min,
        amountMax: range.values.max
      }
    }, () => {
      this.context.app.emit('people-filter-type-changed', { ...this.state });  
    });    
  }
  
  applyFilterBySpend() {
    const range = this._filter.getFilter();

    this.setState({ 
      visibleFilterTitle: '',
      filterBySpend: {
        amountMin: range.values.min,
        amountMax: range.values.max
      }
    }, () => {
      this.context.app.emit('people-filter-type-changed', { ...this.state });  
    });    
  }
  
  applyFilterByEvents() {
    const range = this._filter.getFilter();

    this.setState({ 
      visibleFilterTitle: '',
      filterByEvents: {
        min: range.min,
        max: range.max
      }
    }, () => {
      this.context.app.emit('people-filter-type-changed', { ...this.state });  
    });
  }

  applyFilterByProfile() {
    const profile = this._filter.getFilter();

    this.setState({ 
      visibleFilterTitle: '',
      filterByProfile: {
        ...profile
      }
    }, () => {
      this.context.app.emit('people-filter-type-changed', { ...this.state });  
    });
  }

  checkFilter(action) {
    switch (action) {
    case 'Apply':
      switch (this.state.filterType) {
      case 'filterByFundraising':
        this.applyFilterByFundraising();
        break;
      case 'filterBySpend':
        this.applyFilterBySpend();
        break;
      case 'filterByEvents':
        this.applyFilterByEvents();
        break;
      case 'filterByProfile':
        this.applyFilterByProfile();
        break;
      }
      break;
    }
    this.props.navigation.setParams({ filterDialogOpen: false });
  }

  openFilter(type, title) {
    this.setState({ visibleFilterTitle: title, filterType: type }, () => {
      this.props.navigation.setParams({ filterOpen: false, filterDialogOpen: true });
    });
  }

  clearFilter() {
    this.setState({
      ...filterCriteria
    }, () => {
      this.context.app.emit('people-filter-type-changed', { ...this.state, ...filterCriteria });
      this.props.navigation.setParams({ filterOpen: false, filterDialogOpen: false });  
    });
  }

  hideFilterPopover() {
    this.props.navigation.setParams({ filterOpen: false });
  }

  filterFavourites() {
    this.setState({
      filterFaves: true // !this.state.filterFaves
    }, () => {
      this.context.app.emit('people-filter-type-changed', { ...this.state });
    });
    this.props.navigation.setParams({ filterOpen: false });
  }
  
  onUnfilterAll() {
    this.setState({
      filterFaves: false,
      ...filterCriteria
    }, () => {
      this.context.app.emit('people-filter-type-changed', { ...this.state });
    });
  }
  
  onUnfilterFavourites() {
    this.setState({
      filterFaves: false
    }, () => {
      this.context.app.emit('people-filter-type-changed', { ...this.state });
    });
  }
  
  onUnfilterFundraising() {
    this.setState({
      filterByFundraising: {
        ...this.state.filterByFundraising,
        ...filterCriteria.filterByFundraising
      }
    }, () => {
      this.context.app.emit('people-filter-type-changed', { ...this.state });
    });
  }
  
  onUnfilterSpend() {
    this.setState({
      filterBySpend: {
        ...this.state.filterBySpend,
        ...filterCriteria.filterBySpend
      }
    }, () => {
      this.context.app.emit('people-filter-type-changed', { ...this.state });
    });
  }

  onUnfilterEvents() {
    this.setState({
      filterByEvents: {
        ...this.state.filterByEvents,
        ...filterCriteria.filterByEvents
      }
    }, () => {
      this.context.app.emit('people-filter-type-changed', { ...this.state });
    });
  }
  
  onUnfilterProfileCustomerTags(data) {
    let newCustomerTags = this.state.filterByProfile.customerTags.map
    this.setState({
      filterByProfile: {
        customerTags: this.state.filterByProfile.customerTags.filter( tag => {
          return tag !== data.tag;
        })
      }
    }, () => {
      this.context.app.emit('people-filter-type-changed', { ...this.state });
    });
  }
  
    
  componentWillReceiveProps(nextProps) {
    if (nextProps.navigation.state.params.filterOpen) {
      this.context.app.setState({
        modal: this.filterPopover()
      });
    }
    else if (nextProps.navigation.state.params.sortOpen) {
      this.context.app.setState({
        modal: this.sortPopover()
      });
    }
    else if (nextProps.navigation.state.params.filterDialogOpen) {
      this.context.app.setState({
        modal: this.filterDialog()
      });
    }    
    else {
      this.context.app.setState({
        modal: false
      });
    }
  }
  
  componentWillMount() {
    this.context.app.connect('people-list-data-updated', this.onPeopleData);
    this.context.app.connect('people-list-unfilter-all', this.onUnfilterAll);
    this.context.app.connect('people-list-unfilter-favourites', this.onUnfilterFavourites);
    this.context.app.connect('people-list-unfilter-fundraising', this.onUnfilterFundraising);
    this.context.app.connect('people-list-unfilter-spend', this.onUnfilterSpend);
    this.context.app.connect('people-list-unfilter-events', this.onUnfilterEvents);
    this.context.app.connect('people-list-unfilter-profile-customerTags', this.onUnfilterProfileCustomerTags);
  }
  
  componentDidMount() {
    this.context.app.trackScreenView('People');
  }

  componentWillUnmount() {
    this.context.app.disconnect('people-list-unfilter-all', this.onUnfilterAll);
    this.context.app.disconnect('people-list-data-updated', this.onPeopleData);
    this.context.app.disconnect('people-list-unfilter-favourites', this.onUnfilterFavourites);
    this.context.app.disconnect('people-list-unfilter-fundraising', this.onUnfilterFundraising);
    this.context.app.disconnect('people-list-unfilter-spend', this.onUnfilterSpend);
    this.context.app.disconnect('people-list-unfilter-events', this.onUnfilterEvents);
    this.context.app.disconnect('people-list-unfilter-profile-customerTags', this.onUnfilterProfileCustomerTags);
  }
  
  onPeopleData(data) {
    this.setState({ 
      peopleData: data.data
    });
  }

  filterPopover = () => (
    <PopoverView visible onPress={this.hideFilterPopover}>
      <PopoverViewMenuButton label="Favorites" showIcon={'star'} action={this.filterFavourites} />
      <PopoverViewMenuButton label="Fundraising" showIcon={'favorite'} action={() => this.openFilter('filterByFundraising', 'Filter By Fundraising')} />
      <PopoverViewMenuButton label="Spend" showIcon={'payment'} action={() => this.openFilter('filterBySpend', 'Filter By Spend')} />
      <PopoverViewMenuButton label="Events" showIcon={'event'} action={() => this.openFilter('filterByEvents', 'Filter By:')} />
      <PopoverViewMenuButton label="Profile" showIcon={'person'} action={() => this.openFilter('filterByProfile', 'Filter By:')} />
    </PopoverView>
  )
  
  filterDialog = () => (
    <BasicDialog 
      visible 
      action={this.checkFilter}
      actionStyle={styles.filterAction}
      title={this.state.visibleFilterTitle}
      titleStyle={styles.filterTitle}
    >
    {this.renderFilter()}
    </BasicDialog>
  ) 
  
  sortPopover = () => (
    <PopoverView visible onPress={this.hideSortPopover}>
      <PopoverViewMenuButton label="Alphabetical" useEnabled enabled={this.state.sortType === 'sortByAlpha'} action={() => this.applySorting('sortByAlpha', 'ALPHABETICAL')} showIcon={'sort-by-alpha'} />
      {/*<PopoverViewMenuButton label="Last Active" useEnabled enabled={this.state.sortType === 'sortByActivity'} action={() => this.applySorting('sortByActivity', 'LAST ACTIVE')} showIcon={'update'} />*/}
      <PopoverViewMenuButton label="Lifetime Giving" useEnabled enabled={this.state.sortType === 'sortByLifetimeGiving'} action={() => this.applySorting('sortByLifetimeGiving', 'LIFETIME PLEDGE')} showIcon={'favorite'} />
      {/*<PopoverViewMenuButton label="Pledges Outstanding" action={() => this.applySorting('sortByPledgesOutstanding', 'PLEDGES OUTSTANDING')} showIcon={false} />*/}
      <PopoverViewMenuButton label="Lifetime Spend" useEnabled enabled={this.state.sortType === 'sortByLifetimeSpend'} action={() => this.applySorting('sortByLifetimeSpend', 'LIFETIME SPEND')} showIcon={'payment'} />
      <PopoverViewMenuButton label="Events Attended" useEnabled enabled={this.state.sortType === 'sortByEventsAttended'} action={() => this.applySorting('sortByEventsAttended', 'EVENTS ATTENDED')} showIcon={'event'} />
      <PopoverViewDivider />
      <PopoverViewMenuButton label="Ascending" useEnabled enabled={this.state.sortDirection === 'ASC'} action={() => this.applySortDirection('ASC')} showIcon={'arrow-upward'} />
      <PopoverViewMenuButton label="Descending" useEnabled enabled={this.state.sortDirection === 'DESC'} action={() => this.applySortDirection('DESC')} showIcon={'arrow-downward'} />
    </PopoverView>
  )
  
  renderFilter() {
    switch (this.state.filterType) {
    case 'filterByFundraising':
      let fundProps = { values : {} };
      let fundMin = Number(this.state.filterByFundraising.amountMin);
      fundProps['values']['min'] = fundMin;
      let fundMax = Number(this.state.filterByFundraising.amountMax);
      if (fundMax > fundMin) {
        fundProps['values']['max'] = fundMax;
      }
      return (
        <CurrencyRangeSliderFilter ref={c => this._filter = c } {...fundProps} />
      );
      break;
    case 'filterBySpend':
      let spendProps = { values : {} };
      let spendMin = Number(this.state.filterBySpend.amountMin);
      spendProps['values']['min'] = spendMin;
      let spendMax = Number(this.state.filterBySpend.amountMax);
      if (spendMax > spendMin) {
        spendProps['values']['max'] = spendMax;
      }
      return (
        <CurrencyRangeSliderFilter ref={c => this._filter = c } {...spendProps} />
      );
      break;
    case 'filterByEvents':
      let eventProps = { values : {} };
      let eventMin = Number(this.state.filterByEvents.min);
      eventProps['values']['min'] = eventMin;
      let eventMax = Number(this.state.filterByEvents.max);
      if (eventMax > eventMin) {
        eventProps['values']['max'] = eventMax;
      }
      return (
        <EventsRangeFilter ref={c => this._filter = c } {...eventProps} min={1} max={1000} />
      );
      break;
    case 'filterByProfile':
      return (
          <CustomerProfileFilter ref={c => this._filter = c }
          {...this.state.filterByProfile}
          onCustomerTagPress={ (i, tag) => {
            this.setState({
              filterByProfile: {
                ...this.state.filterByProfile,
                customerTags: this.state.filterByProfile.customerTags.filter( ftag => {
                  return ftag != tag;
                })
              }
            });
          }}
          />
      );
      break;
    }
    return null;
  }
  
  getPills() {
    let pills = [];
    
    if (this.state.filterFaves) {
      pills.push(
        <IconPill
          key={'favourites'}
          icon={'star'}
          onRemove={() => {
            this.context.app.emit('people-list-unfilter-favourites', {});
          }}
          style={{ backgroundColor: Theme.Brand.primaryDark, paddingHorizontal: 5, marginRight: 8 }}
        />
      );
    }

    if (this.state.filterByFundraising
        && (this.state.filterByFundraising.amountMin != '0' || this.state.filterByFundraising.amountMax != null)
      ) {
      let fundProps = {};
      let fundMin = Number(this.state.filterByFundraising.amountMin);
      fundProps['min'] = fundMin.toString();
      
      let fundMax = Number(this.state.filterByFundraising.amountMax);
      if (fundMax !== 0) {
        fundProps['max'] = fundMax.toString();
      }
      
      pills.push(
        <RangePill
          key={'fundraising'} {...fundProps}
          icon={'whatshot'}
          onRemove={() => {
            this.context.app.emit('people-list-unfilter-fundraising', {});
          }}
          style={{ backgroundColor: Theme.Brand.primaryDark, paddingHorizontal: 5, marginRight: 8 }}
        />
      );     
    }
    
    if (this.state.filterBySpend
        && ( this.state.filterBySpend.amountMin != '0' || this.state.filterBySpend.amountMax != null)
      ) {
      let spendProps = {};
      let spendMin = Number(this.state.filterBySpend.amountMin);
      spendProps['min'] = spendMin.toString();
      
      let spendMax = Number(this.state.filterBySpend.amountMax);
      if (spendMax !== 0) {
        spendProps['max'] = spendMax.toString();
      }
      
      pills.push(
        <RangePill
          key={'spend'} {...spendProps}
          icon={'local-offer'}
          onRemove={() => {
            this.context.app.emit('people-list-unfilter-spend', {});
          }}
          style={{ backgroundColor: Theme.Brand.primaryDark, paddingHorizontal: 5, marginRight: 8 }}
        />
      );     
    }
    
    if (this.state.filterByEvents
        && ( this.state.filterByEvents.min != '0' || this.state.filterByEvents.max != null)
      ) {
      let eventsProps = {};
      let eventsMin = Number(this.state.filterByEvents.min);
      eventsProps['min'] = eventsMin.toString();
      
      let eventsMax = Number(this.state.filterByEvents.max);
      if (eventsMax !== 0) {
        eventsProps['max'] = eventsMax.toString();
      }
      
      pills.push(
        <RangePill
          key={'events'} {...eventsProps}
          icon={'event-seat'}
          onRemove={() => {
            this.context.app.emit('people-list-unfilter-events', {});
          }}
          style={{ backgroundColor: Theme.Brand.primaryDark, paddingHorizontal: 5, marginRight: 8 }}
        />
      );     
    }
    
    if (this.state.filterByProfile && this.state.filterByProfile.customerTags.length > 0) {
      this.state.filterByProfile.customerTags.map( (tag, idx) => {
        pills.push(
          <TagPill
            key={'profile-customerTags-'+idx}
            icon={'person'}
            tag={tag}
            onRemove={() => {
              this.context.app.emit('people-list-unfilter-profile-customerTags', { tag: tag });
            }}
            style={{ backgroundColor: Theme.Brand.primaryDark, paddingHorizontal: 5, marginRight: 8 }}
          />
        );
      });
    }
    
    return pills;
  }
  
  render() {
    // const PeopleTabNavigator = this.PeopleTabNavigator;

    const favIcon = this.state.filterFaves ? 'star' : 'star-border';
    
    const { filterOpen: filterPopoverVisible, sortOpen: sortPopoverVisible } = this.props.navigation.state.params;

    const pills = this.getPills();

    console.log(`Search Open 3`);

    return (    

        <View style={styles.container}>
          {/*
          <PeopleTabNavigator ref="tabNavigator" screenProps={{ 
            navigation: this.props.navigation,
            peopleData: this.state.peopleData
          }} />
          */}
          <PeopleList 
            screenProps={{
              navigation: this.props.navigation,
              peopleData: this.state.peopleData,
              pills: pills,
              sortType: this.state.sortType,
              showLocation: this.state.showLocation,
            }} 
          />
        </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    // alignItems: 'center',
    backgroundColor: Theme.Colours.backgrounds.secondary,
  },
  sortTitle: {
    color: 'rgb(31, 75, 86)',
    fontWeight: "200",
    fontSize: Theme.Fonts.fontLarge,
    fontFamily: 'Roboto'
  },
  sortAction: {
    color: 'rgb(31, 75, 86)',
    fontWeight: "100",
    fontFamily: 'Roboto'
  },
  filterTitle: {
    color: 'rgb(31, 75, 86)',
    fontWeight: "300",
    fontSize: Theme.Fonts.fontLarge,
    fontFamily: 'Roboto'
  },
  filterAction: {
    color: 'rgb(31, 75, 86)',
    fontWeight: "100",
    fontFamily: 'Roboto'
  },
});