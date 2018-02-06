import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {
  Animated,
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableHighlight,
  Platform,
  UIManager,
  LayoutAnimation,
  Keyboard,
} from 'react-native';
import { NavigationActions } from 'react-navigation';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Animation } from '../../../lib/animation';
import AsyncDataListView from '../../../component/async-data-list-view';
import PersonEventsListItem from '../../../component/person-events-list-item';
import SimpleStatus from '../../../component/simple-status';
import PopoverView from '../../../component/popover-view';
import PopoverViewDivider from '../../../component/popover-view-divider';
import PopoverViewMenuButton from '../../../component/popover-view-menu-button';
import { default as Theme } from '../../../lib/theme';
import TabTitle from '../../../navigator/tab-title';
import Person from './person';

export default class PersonEvents extends Component {
  static contextTypes = {
    app: PropTypes.object.isRequired
  }
  
  static navigationOptions = ({ navigation }) => {
    return {
      tabBarLabel: (<TabTitle node="Registry::Insights::Scene::Person" value="Events Tab Label" />)
    }
  };
  
  state = {
    listData: [],
    loaded: false,
    filters: {
      favourites: false
    },
    sort: {
      sortType: 'date', 
      sortTime: 'past',
      sortDirection: 'DESC',
    },
    searchValue: null,
    lastSearchValue: null,
    keyboardVisible: false,
    scrolling: false,
  }
  
  onSearch = (event) => {
    let searchValue = null;
    if (event.nativeEvent.text.length > 0) {
      searchValue = event.nativeEvent.text;
    }
    
    this.setState({
      listData: [],
      loaded: false,
      searchValue: searchValue,
    }, () => {
      if (this.refs.hasOwnProperty('personEventsList')) {
        this.refs.personEventsList.reset();
      }
    });  
  }

  setSortTime = (sort, direction) => {
    if (sort !== this.state.sortTime) {
      this.setState({
        listData: [],
        loaded: false,
        sort: {
          ...this.state.sort,
          sortTime: sort,
          sortDirection: direction
        }
      }, () => {
        if (this.refs.hasOwnProperty('personEventsList')) {
          this.refs.personEventsList.reset();
        }
      });
    }
    this.context.app.setState({
      modal: false
    });
  }

  sortPopover = (position) => (
    <PopoverView visible position="right" 
      onPress={() => {
        this.context.app.setState({
          modal: false
        });
      }}
      cardContainerStyle={{
        marginTop: position.y,
        marginRight: position.x + 15
      }}      
    >
      <PopoverViewMenuButton label="UPCOMING" useEnabled enabled={this.state.sort.sortTime === 'upcoming'} showIcon={'date-range'} action={() => this.setSortTime('upcoming', 'ASC')} />
      <PopoverViewMenuButton label="PAST" useEnabled enabled={this.state.sort.sortTime === 'past'} showIcon={'event-available'} action={() => this.setSortTime('past', 'DESC')} />
      <PopoverViewDivider />
      <PopoverViewMenuButton label="DATE" useEnabled enabled={true} showIcon={'event'} action={() => {}} />
    </PopoverView>
  )
  
  componentWillUpdate() {
    LayoutAnimation.configureNext(Animation.slideFast);
  }
  
  renderFilters() {
    const filterIcon = this.state.filters.favourites ? 'star' : 'star-border';
    
    return (
      <View style={[Theme.Styles.row, {}]} >
        <Icon.Button
          style={{ }}
          name={'sort'}
          size={22} 
          color={Theme.Colours.white} 
          backgroundColor={'transparent'} 
          iconStyle={{marginLeft: 5, marginRight: 5}}
          borderRadius={0}
          onPress={() => {
            this.refs.searchBar.measure((ox, oy, width, height, px, py) => {
              this.context.app.setState({
                modal: this.sortPopover({ x: px, y: py })
              });  
            });
          }}
        />
        <Icon.Button
          style={{ }}
          name={filterIcon}
          size={22} 
          color={Theme.Colours.white} 
          backgroundColor={'transparent'} 
          iconStyle={{marginLeft: 5, marginRight: 5}}
          borderRadius={0}
          onPress={() => {           
            this.setState({
              listData: [],
              loaded: false,
              filters: {
                favourites: !this.state.filters.favourites
              }
            }, () => {
              if (this.refs.hasOwnProperty('personEventsList')) {
                this.refs.personEventsList.reset();
              }
            });
          }}
        />
      </View>
    );
  }
  
  renderSearchClear() {
    if (this.state.searchValue === null || this.state.searchValue.length == 0) {
      return null;
    }
    
    return (
      <View style={{}} >
        <Icon.Button
          style={{  }}
          name={'clear'}
          size={22} 
          color={Theme.Colours.white} 
          backgroundColor={'transparent'} 
          iconStyle={{marginLeft: 5, marginRight: 5}}
          borderRadius={0}
          onPress={() => {
            const lastSearchValue = this.state.searchValue;
          
            this.setState({
              searchValue: null,
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
      </View>
    );
  }

  renderSearch() {    
    
    let keyboardType = 'default';
    let wrapperStyle = [{ flexDirection: 'column', backgroundColor: Theme.Brand.primary }];
    if (Platform.OS === 'ios') {
      keyboardType = 'name-phone-pad';
      wrapperStyle.push(Theme.Styles.elevation);
    }
        
    return (
      <View ref="searchBar" style={wrapperStyle} elevation={5}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }}>
          <View 
            style={{ flex: 1, flexGrow: 2, flexDirection: 'column', borderBottomWidth: 2, 
              borderBottomColor: Theme.Brand.primaryLight, marginHorizontal: 15, marginBottom: 10
            }}
          >
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
          {this.renderSearchClear()}
          {this.renderFilters()}
        </View>
      </View>
    );
  }
  
  renderNoResults() {
    const status = "No Results";
    return (
      <SimpleStatus statusText={status} statusIcon="info-outline" />
    );
  }
  
  renderList() {
    const { keyboardVisible, listData, loaded } = this.state;
    const { event } = this.props.screenProps.customer;

    if (listData.length === 0 && loaded) {
      return this.renderNoResults();
    }
    
    return (
      <View style={styles.container}>
      {Person.renderHeadCollapse}
        <AsyncDataListView
          ref="personEventsList"
          style={{ flex: 1 }}
          dsRowHasChanged={(prev, next) => prev.id !== next.id}
          data={listData}
          dataProvider={(page, pageSize) => {
          
            let params = { 
                page: page, 
                pageSize: pageSize, 
                customerId: this.props.screenProps.customer.customerid,
                filters: this.state.filters,
                sort: this.state.sort
            }
            
            if (this.state.searchValue && this.state.searchValue.length > 0) {
              params['search'] = this.state.searchValue;
            }

            return this.context.app.getPersonEvents(params)
            .then( result => {
              this.setState({
                listData: this.state.listData.concat(result.data)
              });
              return result.data; 
            });
          }}
          onRenderRow={ (rowData, i) => (
            <TouchableHighlight key={i} onPress={() => {
              this.context.app.emit('person-events-list-item-updated', { 
                id: rowData.id, 
                customerid: this.props.screenProps.customer.customerid,
                command: 'expand'
              });
              // LayoutAnimation.configureNext(Animation.slideFast);
            }}>
              <PersonEventsListItem 
                data={rowData} 
                onPressDetails={() => {
                  this.context.app.navigation.navigate('PeopleNavigator', {}, NavigationActions.navigate({
                    routeName: 'PersonEventsEvent',
                    params: {
                      getTitle: () => {
                        return rowData.shortDescription;
                      },
                      ...rowData
                    }
                  }));
                }}
                expandedStyle={{ backgroundColor: Theme.Colours.backgrounds.secondary }}
              />
            </TouchableHighlight>            
          )}
          onLoadedChanged={ loaded => {
            this.setState({
              loaded: loaded
            });
          }}

          onScroll={e => {
            let currentOffset = e.nativeEvent.contentOffset.y; 
            let direction = currentOffset > this.listOffset ? 1 : -1; // 1 = down, -1 = up ,  -10 = buffer
            this.listOffset = currentOffset;

            let collapseMenu  = this.props.screenProps.collapseMenu;
                                                                                 
            if (this.state.scrolling || (direction === 1 && currentOffset <= 0)) {
              return;
            }
            
            if (direction === -1 && currentOffset > 0 && !collapseMenu) { // !this.state.listHeaderVisible) {
              // LayoutAnimation.configureNext(Animation.slideSlow);
              this.props.screenProps.collapseMenu = true;
              this.setState({
                scrolling: true
              });
            }
            else if (direction === 1 && collapseMenu) { // this.state.listHeaderVisible) {
              // LayoutAnimation.configureNext(Animation.slideFast);
              this.props.screenProps.collapseMenu = false;
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
            if (this.listOffset == 0 && !collapseMenu) {
              this.props.screenProps.collapseMenu = true;
            } 
          }}
        />
      </View>
    );
  }
  
  render() { 
    return (
      <View style={styles.container}>
      {this.renderSearch()}
        <Animated.ScrollView 
          showsHorizontalScrollIndicator={false}
          // showsVerticalScrollIndicator={false}
          style={{ }}
          scrollEventThrottle={1}
          onScroll={this.props.screenProps.toggleHeader}>
          {this.renderList()}
        </Animated.ScrollView>
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
    fontSize: Theme.Fonts.h6,
    fontFamily: 'Roboto',
    fontWeight: "500",
    margin: 0, padding: 0
  },
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    backgroundColor: Theme.Colours.backgrounds.primary
  },
  h3: {
    fontFamily: 'Roboto',
    fontSize: Theme.Fonts.fontSmall
  }
});