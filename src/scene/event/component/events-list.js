import isEqual from 'lodash.isequal';
import Moment from 'moment';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableHighlight,
  Platform,
  UIManager,
  LayoutAnimation,
  Keyboard
} from 'react-native';
import { NavigationActions } from 'react-navigation';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Animation } from '../../../lib/animation';
import AsyncDataListView from '../../../component/async-data-list-view';
import EventListItem from '../../../component/event-list-item';
import SimpleStatus from '../../../component/simple-status';
import { default as Theme } from '../../../lib/theme';
// import { getEvents } from '../../../data/google-sheet';

export default class EventsList extends Component {
  static contextTypes = {
    app: PropTypes.object.isRequired
  }

  constructor(props, context) {
    super(props, context);

    this._keyboardDidShow = this._keyboardDidShow.bind(this);
    this._keyboardDidHide = this._keyboardDidHide.bind(this);
    
    this.onSearch = this.onSearch.bind(this);
    this.eventsFilter = this.eventsFilter.bind(this);
    // this.eventsDateRangeFilter = this.eventsDateRangeFilter.bind(this);
    // this.eventsSalesRangeFilter = this.eventsSalesRangeFilter.bind(this);
    // this.eventsTypeFilter = this.eventsTypeFilter.bind(this);
    this.onFilterChanged = this.onFilterChanged.bind(this);
    
    this.state = {
      // listData: [],
      // filters: this._getFilters(props),
      listSize: 0,
      filters: {},
      sort: {
        sortTime: 'upcoming',
        sortType: 'date',
        sortDirection: 'ASC'
      },
      searchValue: null,
      lastSearchValue: null,
      keyboardVisible: false,
      scrolling: false,
      empty: false
    };
    
    if (Platform.OS === 'android') {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
    
    this.listOffset = 0;
  }
   
   /*
  _getFilters(props) {
    let filters = {};
    
    // Category Filter
    if (props.eventTypeFilter.type) {
      filters['category'] = props.eventTypeFilter.type
    }
    
    // Date Filter
    if (props.dateFilter.startDate) {
      filters['startDate'] = props.dateFilter.startDate;
    }
    if (props.dateFilter.endDate) {
      filters['endDate'] = props.dateFilter.endDate;
    }
    
    // Location Filter
    if (props.venuesFilter.ids.length > 0) {
      filters['venues'] = props.venuesFilter.ids;
    }
    
    
    if (props.locationFilter.country && props.locationFilter.country) {
      filters['country'] = props.locationFilter.country;
    }
    if (props.locationFilter.state && props.locationFilter.state) {
      filters['state'] = props.locationFilter.state;
    }
    if (props.locationFilter.city && props.locationFilter.city) {
      filters['city'] = props.locationFilter.city;
    }
    
    
    // favourite filters
    filters['filterFavourites'] = props.favouriteFilter;  
    
    return filters;    
  }
  */

  onSearch(event) { 
    if (event.nativeEvent.text.length == 0) {
      this.context.app.emit('events-list-data-updated', { data: [] });
      
      this.setState({
        // listData: [],
        searchValue: null,
      }, () => {
        if (this.refs.hasOwnProperty('eventList')) {
          return this.refs.eventList.reset();
        };
      });
    }
    else {
      this.context.app.emit('events-list-data-updated', { data: [] });
      
      this.setState({
        // listData: [],
        searchValue: event.nativeEvent.text,
      }, () => {
        if (this.refs.hasOwnProperty('eventList')) {
          return this.refs.eventList.reset();
        };
      }); 
    } 
  }
  
  /*
  componentWillReceiveProps(nextProps) {
    if (this.state.keyboardVisible) {
      
      if (!nextProps.screenProps.navigation.state.params.searchOpen &&
          !nextProps.screenProps.navigation.state.params.filterOpen) {
        // LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
        Keyboard.dismiss();
      }
    }
    else {
      if (nextProps.favouriteFilter !== this.props.favouriteFilter || 
          !isEqual(nextProps.dateFilter, this.props.dateFilter) || 
          !isEqual(nextProps.venuesFilter, this.props.venuesFilter) ||
          !isEqual(nextProps.salesFilter, this.props.salesFilter) ||
          !isEqual(nextProps.eventTypeFilter, this.props.eventTypeFilter)
          ) {
        this.setState({
          // listData: [],
          filters: this._getFilters(nextProps)
        });
      }
    }
  }
  */
 
  componentWillUpdate(nextProps, nextState) {
    /*
    if (nextState.keyboardVisible) {
        LayoutAnimation.configureNext(Animation.slideSlow);
    }
    else {
        LayoutAnimation.configureNext(Animation.slideFast);
    }
    */
  }
  
  /*
  componentDidUpdate(prevProps, prevState) {
    if (prevProps.favouriteFilter !== this.props.favouriteFilter || 
        !isEqual(prevProps.dateFilter, this.props.dateFilter) || 
        !isEqual(prevProps.venuesFilter, this.props.venuesFilter) ||
        !isEqual(prevProps.salesFilter, this.props.salesFilter) ||
        !isEqual(prevProps.eventTypeFilter, this.props.eventTypeFilter)
        ) {
      this.refs.eventList.reset();
    }
  }
  */

  componentWillMount() {
    this.context.app.connect('events-filter-type-changed', this.onFilterChanged);
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
  }
  
  componentWillUnmount() {
    this.context.app.disconnect('events-filter-type-changed', this.onFilterChanged);
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
  }
  
  eventsFilter(data) {
	  return data;
  }
  
  onFilterChanged(data) {
    this.context.app.emit('events-list-data-updated', { data: [] });

    this.setState({
      // listData: [],
      empty: false,
      filters: {
        filterFavourites: data.filterFaves,
        filterByDate: data.filterByDate,
        filterByVenue: data.filterByVenue,
        filterBySales: data.filterBySales,
        filterByEventType: data.filterByEventType,
        filterByEventGroup: data.filterByEventGroup,
      },
      sort: {
        sortTime: data.sortTime,
        sortType: data.sortType,
        sortDirection: data.sortDirection
      }
    }, () => {
      if (this.refs.hasOwnProperty('eventList')) {
        return this.refs.eventList.reset();
      };
    });    
  }
  
  _keyboardDidShow() {
    this.setState({
      keyboardVisible: true
    });
  }
  
  _keyboardDidHide() {
    this.setState({
      keyboardVisible: false
    });
  }

  renderSearchClear() {
    if (this.state.searchValue === null || this.state.searchValue.length == 0) {
      return null;
    }
    
    return (
      <Icon.Button
        style={{ flex: 1 }}
        name={'clear'}
        size={22} 
        color={Theme.Colours.white} 
        backgroundColor={'transparent'} 
        iconStyle={{marginLeft: 0, marginRight: 0, marginTop: 0, marginBottom: 0}}
        borderRadius={0}
        onPress={() => {
          const lastSearchValue = this.state.lastSearchValue;
          
          this.setState({
            searchValue: null
          }, () => {
            if (lastSearchValue === null || lastSearchValue.length === 0) {
              return;
            }
            Keyboard.dismiss();
            this.onSearch({
              nativeEvent: {
                text: ''
              },
            });
          });
        }}
      />
    );
  }
  
  renderSearch() {
    
    let borderWidth = 1;
    /*
    if (this._pills.length == 0) {
      borderWidth = 0;
    }
    */
   
    let keyboardType = 'default';
    if (Platform.OS === 'ios') {
      keyboardType = 'name-phone-pad';
    }
    
    return (
      <View style={{ flex: 1, flexGrow: 2, flexDirection: 'column', borderBottomWidth: borderWidth, borderBottomColor: Theme.Brand.primaryLight, marginHorizontal: 0, paddingRight: 15, marginBottom: 15 }}>
        <TextInput
        style={[Theme.Styles.listSearchInput, Theme.PlatformStyles]}
          autoCapitalize={'words'}
          autoCorrect={false}
          autoFocus={false}
          value={this.state.searchValue}
          placeholder={"Search Events"}
          placeholderTextColor={Theme.Brand.primaryLight}
          selectionColor={Theme.Brand.primaryLight}
          keyboardType={keyboardType}
          // textAlignVertical="bottom"
          underlineColorAndroid='transparent'
          onChangeText={text => this.setState({ searchValue: text})}
          onSubmitEditing={this.onSearch}
        />
      </View>
    );
  }
  
  renderFilterPills() {    
    if (this.props.screenProps.pills.length === 0) {
      return null;
    }
    
    const renderPills = () => this.props.screenProps.pills.map( pill => pill );
    return (
      <View style={{ flexDirection: 'row', paddingHorizontal: 15, paddingBottom: 5 }}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          style={{ marginVertical: 5 }}
        >
        {renderPills()}
        </ScrollView>
      </View>
    );
  }
  
  renderResults() {
    
    const listSize = (this.state.listSize < 1000) ? this.state.listSize : '> 1000'; 

    const pills = this.props.screenProps.pills;
    
    let renderClear = false;
    let paddingTop = 10;
    if (pills.length > 0) {
      renderClear = true;
      paddingTop = 0;
    }
    else if (this.state.lastSearchValue !== null && this.state.lastSearchValue.length > 0) {
      renderClear = true;
    }
    else {
      return null;
    }
        
    return (
      <View style={{ flexDirection: 'row', paddingHorizontal: 15, paddingBottom: 10, paddingTop: paddingTop }}>
        <View style={{ flex: 1, flexDirection: 'row' }} >
          <Text style={[Theme.Styles.textLarge, { flex: 1, fontFamily: 'System', color: Theme.Colours.border}]} >Results: {listSize}</Text>
        </View>
        {renderClear ?
        <View style={{ }} >
          <TouchableHighlight 
            onPress={() => {
              this.context.app.emit('events-list-unfilter-all', {}); 
              this.setState({
                searchValue: null,
                lastSearchValue: null
              });
            }} 
            style={{ justifyContent: 'flex-end', alignItems: 'flex-end' }} underlayColor="transparent" 
          >
            <Text style={[Theme.Styles.textLarge, { textAlign: 'right', alignSelf: 'flex-end', fontFamily: 'System', fontWeight: '500', color: Theme.Brand.primary }]}>CLEAR</Text>
          </TouchableHighlight>
        </View>
        : null }
      </View>
    );
  }

  renderListFilters() {
    const { navigation } = this.props.screenProps;
    const { searchOpen } = navigation.state.params;

    if (!searchOpen) {
        return null;
    }

    let styles = [{ flexDirection: 'column', backgroundColor: Theme.Brand.primary }];
    if (Platform.OS === 'ios') {
      styles.push(Theme.Styles.elevation);
    }
    
    return (
      <View style={styles} elevation={5} >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', paddingLeft: 15, paddingRight: 10 }}>
          {this.renderSearch()}
          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
            {this.renderSearchClear()}
            <Icon.Button
              style={{ flex: 1 }}
              name={'sort'} 
              size={22} 
              color={Theme.Colours.white} 
              backgroundColor={'transparent'} 
              iconStyle={{marginLeft: 0, marginRight: 0, marginTop: 0, marginBottom: 0}}
              borderRadius={0}
              onPress={() => {
                // only open menu if filter is not open
                if (!navigation.state.params.filterOpen) {
                  navigation.setParams({sortOpen: !navigation.state.params.sortOpen, menuOpen: false});
                }
              }}
            />
	        <Icon.Button
	          style={{ flex: 1 }}
              name={'filter-list'} 
    	      size={22} 
	          color={Theme.Colours.white} 
	          backgroundColor={'transparent'} 
              iconStyle={{marginLeft: 0, marginRight: 0, marginTop: 0, marginBottom: 0}}
	          borderRadius={0}
	          onPress={() => {
	            // only open menu if filter is not open
    	        if (!navigation.state.params.filterOpen) {
	              navigation.setParams({menuOpen: !navigation.state.params.menuOpen, sortOpen: false});
	            }
    	      }}
	        />
	  	  </View>
  		</View>
        {this.renderFilterPills()}
        {this.renderResults()}
	  </View>
    );  
  }
  
  renderEmpty() {
    return (
      <View style={{ flex: 1 }}>
        <SimpleStatus statusText={"No Events Found"} statusIcon="info-outline" />
      </View>
    );
  }
  
  render() {
    const { keyboardVisible, searchValue, empty } = this.state;
    
    const { eventsData, navigation } = this.props.screenProps;
    const { searchOpen } = navigation.state.params;

    return (
      <View style={styles.container}>
        {this.renderListFilters()}
        {empty ? this.renderEmpty() : 
        <AsyncDataListView
          ref="eventList" // { c => this._list = c }
          dsRowHasChanged={(prev, next) => prev.id !== next.id}
          data={eventsData}         
          dataProvider={(page, pageSize) => {
            const lastSearchValue = searchValue;
          	return this.context.app.getEvents({ 
          	  page: page, 
          	  pageSize: pageSize, 
          	  filters: this.state.filters,
          	  sort: this.state.sort,
          	  search: searchValue,
          	})
          	.then( result => {
          	  
          	  console.log('--- event data', result);
          	  
          	  this.context.app.emit('events-list-data-updated', { data: eventsData.concat(result.data) });
              this.setState({
                lastSearchValue: searchValue,
                listSize: result.total
              });
          	  return result.data;
          	});
          }}
          onRenderRow={(rowData, i) => (
            <TouchableHighlight key={i} onPress={() => {
              this.context.app.navigation.navigate('EventsNavigator', {}, NavigationActions.navigate({
                routeName: 'EventsEvent',
              	params: {
              	  getTitle: () => {
              	    return rowData.shortDescription;
       		      },
       			  ...rowData
              	}
              }));
            }}>
              <EventListItem data={rowData} />
            </TouchableHighlight>
          )}
          style={{ flex: 1 }}
          
          onScroll={e => {
            let currentOffset = e.nativeEvent.contentOffset.y; 
            let direction = currentOffset > this.listOffset ? 1 : -1; // 1 = down, -1 = up ,  -10 = buffer
            this.listOffset = currentOffset;
                                                                                 
            if (this.state.scrolling || (direction === 1 && currentOffset <= 0)) {
              return;
            }
            
            if (direction === -1 && currentOffset > 0 && !searchOpen) { // !this.state.listHeaderVisible) {
              LayoutAnimation.configureNext(Animation.slideSlow);
              navigation.setParams({searchOpen: true});
              this.setState({
                scrolling: true
              });
            }
            else if (direction === 1 && searchOpen) { // this.state.listHeaderVisible) {
              LayoutAnimation.configureNext(Animation.slideFast);
              navigation.setParams({searchOpen: false});
              this.setState({
                scrolling: true
              });
            }
          }}
          onScrollEndDrag={(e) => {
            this.listOffset = e.nativeEvent.contentOffset.y;
            this.setState({
              scrolling: false
            });
          }}
          onMomentumScrollEnd={e => {
            this.listOffset = e.nativeEvent.contentOffset.y;
            this.setState({
              scrolling: false
            });
          }}
          onScrollDown={gesture => {
            if (this.listOffset == 0 && !searchOpen) {
              navigation.setParams({searchOpen: true});
            } 
          }}
          onLoadedChanged={loaded => {
            this.setState({
              empty: loaded && this.props.screenProps.eventsData.length === 0
            });
          }}
        />
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  hiddenWrapper: {
    flex: 1, 
    flexDirection: 'row', 
    justifyContent: 'center', 
    paddingLeft: 10, 
    paddingRight: 10,
  },
  searchInput: {
    // flex: 1, 
    // flexDirection: 'column',
    fontSize: Theme.Fonts.h6,
    fontFamily: 'System',
    fontWeight: "500",
    margin: 0, padding: 0
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    backgroundColor: Theme.Colours.backgrounds.secondary,
  },
});