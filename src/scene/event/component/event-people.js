import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {
  Animated,
  StyleSheet,
  View,
  TouchableHighlight,
  Keyboard,
  TextInput,
  Platform,
  UIManager,
  LayoutAnimation
} from 'react-native';
import { NavigationActions } from 'react-navigation';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncDataListView from '../../../component/async-data-list-view';
import EventPersonListItem from '../../../component/event-person-list-item';
import { Animation } from '../../../lib/animation';
import TabTitle from '../../../navigator/tab-title';
import { default as Theme } from '../../../lib/theme';
import SimpleStatus from '../../../component/simple-status';

export default class EventPeople extends Component {

  static contextTypes = {
    app: PropTypes.object.isRequired
  }

  static navigationOptions = ({ navigation }) => {
    return {
      tabBarLabel: (<TabTitle node="Registry::Insights::Scene::Event" value="People Tab Label" />)
    }
  }
  
  state = {
    // sortType: null,
    // sortTypeLabel: null,
    listData: [],
    loaded: false,
    // filters: {},
    filters: {
      favourites: false
    },
    searchValue: null,
    lastSearchValue: null,
    keyboardVisible: false
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
      if (this.refs.hasOwnProperty('eventPeopleList')) {
        this.refs.eventPeopleList.reset();
      }
    }); 
  }
  
  onListDataUpdated = ({ data }) => {
    this.setState({
      listData: data
    });
  }
  
  componentWillMount() {
    this.context.app.connect('event-people-list-data-updated', this.onListDataUpdated);
  }
  
  componentWillUpdate() {
    // LayoutAnimation.configureNext(Animation.slideFast);
  }
  
  componentWillUnmount() {
    this.context.app.disconnect('event-people-list-data-updated', this.onListDataUpdated);
  }

  renderFilters() {
    const filterIcon = this.state.filters.favourites ? 'star' : 'star-border';
    
    return (
      <View style={{  }} >
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
	          if (this.refs.hasOwnProperty('eventPeopleList')) {
	            this.refs.eventPeopleList.reset();
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
      <View style={{ }} >
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
      <View style={wrapperStyle} elevation={5} >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', paddingLeft: 15, paddingRight: 10 }}>
        <View style={{ flex: 1, flexGrow: 2, flexDirection: 'column', borderBottomWidth: 2, 
            borderBottomColor: Theme.Brand.primaryLight, marginHorizontal: 0, paddingRight: 15, 
            marginBottom: 10 }}>           
            <TextInput
              style={[Theme.Styles.listSearchInput, Theme.PlatformStyles]}
              autoCapitalize={'words'}
              autoCorrect={false}
              autoFocus={false}
              value={this.state.searchValue}
              placeholder={"Search People"}
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
    const { event } = this.props.screenProps;

    if (listData.length === 0 && loaded) {
      return this.renderNoResults();
    }
    
    return (
        <AsyncDataListView
          ref="eventPeopleList"
          dsRowHasChanged={(prev, next) => prev.customernumber !== next.customernumber}
          data={listData}
          dataProvider={(page, pageSize) => {

            let params = { page: page, pageSize: pageSize, eventId: event.id, filters: this.state.filters };
            
            if (this.state.searchValue && this.state.searchValue.length > 0) {
              params.search = this.state.searchValue;
            }
                        
            return this.context.app.getEventPeople(params)
            .then( result => {
              // emit the signal that people list data was loaded
              this.context.app.emit('event-people-list-data-updated', { data: listData.concat(result.data) });

              return result.data; 
            });
          }}
          onRenderRow={(rowData, i) => (
            <TouchableHighlight key={i} onPress={() => {
              this.context.app.emit('list-item-updated', { 
                customerid: rowData.customerid, 
                command: 'expand'
              });
            }}>
              <EventPersonListItem
                data={{ ...rowData, eventId: this.props.screenProps.event.id }} 
                onPressDetails={() => {
                  this.context.app.navigation.navigate('EventsNavigator', {}, NavigationActions.navigate({
                    routeName: 'EventPeoplePerson',
                    params: {
                      getTitle: () => {
                        return rowData.firstname.concat(' ', rowData.lastname);
                      },
                      ...rowData
                    }
                  }));
                }}
                expandedStyle={{ backgroundColor: Theme.Colours.backgrounds.secondary }}
              />
            </TouchableHighlight>            
          )}
          style={{ flex: 1 }}
          onLoadedChanged={loaded => {
            this.setState({
              loaded: loaded
            });
          }}
        />
    );
  }
  
  render() {      
    return (
      <View style={[ styles.container ]}>
      {this.renderSearch()}
        <Animated.ScrollView 
          showsHorizontalScrollIndicator={false}
          // showsVerticalScrollIndicator={false}
          style={{ }}
          scrollEventThrottle={1}
          onScroll={this.props.screenProps.toggleHeader}
        >
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