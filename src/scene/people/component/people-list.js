import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
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
// import AsyncVirtualizedList from '../../../component/async-virtualized-list';
import PersonListItem from '../../../component/person-list-item';
import SimpleStatus from '../../../component/simple-status';
import { default as Theme } from '../../../lib/theme';

export default class PeopleList extends Component {

  static contextTypes = {
    app: PropTypes.object.isRequired
  }

  constructor(props, context) {
    super(props, context);

    this._keyboardDidShow = this._keyboardDidShow.bind(this);
    this._keyboardDidHide = this._keyboardDidHide.bind(this);
    
    this.onSearch = this.onSearch.bind(this);
    // this.onSearchChanged = this.onSearchChanged.bind(this);
    this.onSortTypeChanged = this.onSortTypeChanged.bind(this);
    this.onFilterChanged = this.onFilterChanged.bind(this);
    
    this.state = {
        loaded: false,
        listSize: 0,
        filters: {},
        sortType: props.screenProps.sortType,
        sortTypeLabel: null,
        sortDirection: 'DESC',
        // listData: [],
        searchValue: null,
        lastSearchValue: null,
        keyboardVisible: false,
        scrolling: false,
    };
    
    if (Platform.OS === 'android') {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
    
    this.listOffset = 0;
  }
  
  onSearch(event) {
    if (event.nativeEvent.text.length == 0) {
      this.context.app.emit('people-list-data-updated', { data: [] });
      
      this.setState({
        // listData: [],
        searchValue: null,
        loaded: false,
      }, () => {
        if (this.refs.hasOwnProperty('peopleList')) {
          this.refs.peopleList.reset();
        }
      });
    }
    else {
      this.context.app.emit('people-list-data-updated', { data: [] });
      
      this.setState({
        // listData: [],
        searchValue: event.nativeEvent.text,
        loaded: false,
      }, () => {
        if (this.refs.hasOwnProperty('peopleList')) {
          this.refs.peopleList.reset();
        }
      }); 
    }
    
//    this.props.screenProps.navigation.setParams({
//      searchOpen: false
//    });
  }
  
  onSortTypeChanged(data) {
    this.context.app.emit('people-list-data-updated', { data: [] });
    
    this.setState({
      sortType: data.sortType,
      sortTypeLabel: data.sortTypeLabel,
      sortDirection: data.sortDirection,
      // listData: [],
    }, this.refs.peopleList.reset);
  }

  onFilterChanged(data) {
    this.context.app.emit('people-list-data-updated', { data: [] });

    this.setState({
      // listData: [],
      filters: {
        filterFavourites: data.filterFaves,
        filterByFundraising: data.filterByFundraising,
        filterBySpend: data.filterBySpend,
        filterByEvents: data.filterByEvents,
        filterByProfile: data.filterByProfile
      }
    }, this.refs.peopleList.reset);    
  }
  
  componentWillReceiveProps(nextProps) {
    if (this.state.keyboardVisible) {
      if (!nextProps.screenProps.navigation.state.params.searchOpen &&
          !nextProps.screenProps.navigation.state.params.filterDialogOpen) {
        // LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
        Keyboard.dismiss();
      }
    }
  }
  
  componentWillMount() {
    this.context.app.connect('people-sort-type-changed', this.onSortTypeChanged);
    this.context.app.connect('people-filter-type-changed', this.onFilterChanged);
    
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
  }
  
  componentWillUnmount() {
    this.context.app.disconnect('people-sort-type-changed', this.onSortTypeChanged);
    this.context.app.disconnect('people-filter-type-changed', this.onFilterChanged);
    
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
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
  
  componentWillUpdate(nextProps, nextState) {
    if (nextState.keyboardVisible) {
        LayoutAnimation.configureNext(Animation.slideSlow);
    }
    else {
        LayoutAnimation.configureNext(Animation.slideFast);
    }
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
    // let platformStyle = {};
    // if (Platform.OS == 'android') {
      // platformStyle['height'] = 40;
      // platformStyle['lineHeight'] = 20;
      // platformStyle['paddingLeft'] = 2;
      // platformStyle['paddingTop'] = 15;
    // }
    
    let borderWidth = 1;
    /*
    if (this.props.screenProps.pills.length == 0) {
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
          placeholder={"Search People"}
          placeholderTextColor={Theme.Brand.primaryLight}
          selectionColor={Theme.Colours.white}
          keyboardType={keyboardType}
          // textAlignVertical="bottom"
          underlineColorAndroid='transparent'
          onChangeText={text => this.setState({ searchValue: text})}
          onSubmitEditing={this.onSearch}
        />
      </View>
    );
  }
  
  getRandom(min, max) {
    return Math.random() * (max - min) + min;
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
          <Text style={[Theme.Styles.textLarge, { flex: 1 }]} >Results: {listSize}</Text>
        </View>
        {renderClear ?
        <View style={{ }} >
          <TouchableHighlight 
            onPress={() => {
              this.context.app.emit('people-list-unfilter-all', {}); 
              this.setState({
                searchValue: null,
                lastSearchValue: null
              });
            }} 
            style={{ justifyContent: 'flex-end', alignItems: 'flex-end' }} underlayColor="transparent" 
          >
            <Text style={[Theme.Styles.textLarge, { textAlign: 'right', alignSelf: 'flex-end', fontWeight: '500', color: Theme.Brand.primary }]}>CLEAR</Text>
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

    console.log(`Search Open 1: ${searchOpen}`);
   
    /*
    let height = 55;
    if (this.props.screenProps.pills.length > 0) {
      height = 110;
    }
    */
    
    let sortIcon = 'sort';
    switch (this.props.screenProps.sortType) {
      case 'sortByActivity':
      icon = 'update';
      break;
      
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

    let styles = [{ flexDirection: 'column', backgroundColor: Theme.Brand.primary }];
    if (Platform.OS === 'ios') {
      styles.push(Theme.Styles.elevation);
    }
    
    return (
      <View style={styles} elevation={5}>
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
    	        navigation.setParams({sortOpen: !navigation.state.params.sortOpen, filterOpen: false});
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
	            if (!navigation.state.params.filterDialogOpen) {
	              navigation.setParams({filterOpen: !navigation.state.params.filterOpen, sortOpen: false});
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
  
  renderNoResults() {
    const status = 'No Results Available';
    return (
      <SimpleStatus statusText={status} statusIcon="info-outline" />
    );
  }
  
  renderList() {    
    
    const { peopleData, navigation, sortType } = this.props.screenProps;
    const { keyboardVisible, sortDirection, sortTypeLabel, listData, filters, searchValue, loaded } = this.state;
        
    if (peopleData.length === 0 && loaded) {
      return this.renderNoResults();
    }

    const { searchOpen } = navigation.state.params;
    
    return (
        <AsyncDataListView
          ref="peopleList"
          dsRowHasChanged={(prev, next) => prev.customernumber !== next.customernumber}
          /*
          keyExtractor={(rowData) => {
            return rowData.customernumber;
          }}
          */
          data={peopleData}
          dataProvider={(page, pageSize) => {
            const lastSearchValue = searchValue;
            return this.context.app.getPeople({ page: page, pageSize: pageSize, sortType: sortType, sortDirection: sortDirection, filters: filters, search: searchValue })
            .then( result => {
              // emit the signal that people list data was loaded
              this.context.app.emit('people-list-data-updated', { data: peopleData.concat(result.data.map( person => {
                const lat = this.getRandom(31.785001, 31.832999);
                const lng = this.getRandom(-86.002001, -85.939999);
                
                return {
                  ...person,
                  addresslat: lat,
                  addresslng: lng
                };
              }))});
              
              this.setState({
                // listData: this.state.listData.concat(),
                lastSearchValue: lastSearchValue,
                listSize: result.total
              });
              return result.data; 
            });
          }}
          /*
          onDataItem={ (data, index) => {
            return data[index];
          }}
          onRenderItem={({item: rowData, index: i}) => (
          */
          onRenderRow={(rowData, i) => {
            return (
            <TouchableHighlight key={i} onPress={() => {
              this.context.app.emit('list-item-updated', { 
                customerid: rowData.customerid, 
                command: 'expand'
              });
              LayoutAnimation.configureNext(Animation.slideFast);
            }}>
              <PersonListItem
                data={rowData} 
                detailType={sortType}
                showLocation={this.props.screenProps.showLocation}
                onPressDetails={() => {
                  this.context.app.navigation.navigate('PeopleNavigator', {}, NavigationActions.navigate({
                        routeName: 'PeoplePerson',
                        params: {
                          getTitle: () => {
                            return rowData.firstname.concat(' ', rowData.lastname);
                          },
                          ...rowData
                        }
                  }));
                }}
              />
            </TouchableHighlight>
            );
          }}
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
          onLoadedChanged={ loaded => {
            this.setState({
              loaded: loaded
            });
          }}
        />
    );
  }
  
  render() {  
    return (
      <View style={styles.container}>
        {this.renderListFilters()}
        {this.renderList()}
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
    flexDirection: 'column',
    fontSize: Theme.Fonts.h6,
    fontFamily: 'Roboto',
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