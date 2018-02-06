import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  Animated, 
  TouchableOpacity, 
  LayoutAnimation, 
  ActivityIndicator
} from 'react-native';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { default as Theme } from '../../../lib/theme';

export default class AdmissionsDetails extends Component {

  static contextTypes = {
    app: PropTypes.object.isRequired
  }

  static propTypes = {
    startDate: PropTypes.string,
    endDate: PropTypes.string,
  }

  static defaultProps = {
  }

  static styles = StyleSheet.create({
    container: {
    }
  })

  state = {
    total: 0,
    page: 0,
    data: {
      total: 0,
      set: []
    },
    contentWidth: 1,
    activeSlide: 0,
    loading: true,
  }
  
  componentWillMount() {
    this.context.app.getAdmissionsDetails(this.props)
    .then( response => {
      this.setState({
        ...response,
        loading: false
      });
    })
    .catch( error => {
      this.setState({
        loading: false
      });
    });
  }
  
  /*
  componentWillUpdate(nextProps) {
    if (nextProps.loading != this.props.loading) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    }
  }
  */
  
  _renderItem = ({item}) => (
    <View style={{ marginVertical: 2, justifyContent: 'center' }}>
      <Text style={{ color: '#fff' }}>{item.type.toUpperCase()}: <Text style={{ color: '#fff', fontWeight: '500' }}>{item.total}</Text></Text>
    </View>
  );
  
  _keyExtractor = (item, index) => item.type;
  
  onViewableItemsChanged = ({ viewableItems, changed }) => {
    this.setState({viewableItems});
  }
 
  renderPage(page) {
    // const { page } = this.state;
    const { set } = this.state.data;
    
    const listData = page > 0 ? 
      set.slice((page - 1) * 10, ((page - 1) * 10) + 10) : set.slice(page * 10, 10); 

    return (
      <View key={page} style={{ flexDirection: 'column', width: this.state.contentWidth}}>
        <FlatList
          data={listData}
          keyExtractor={this._keyExtractor}
          renderItem={this._renderItem}
          style={{ marginVertical: 10 }}
        />
      </View>
    );
  }
  
  renderPages() {
    const { total } = this.state;
    const pages = Math.ceil(total / 10);
    
    let items = [];
    for (let i = 1; i <= pages; i++) {
      items.push(
        this.renderPage(i)
      );
    }
    
    return items;
  }
  
  renderLoading() {
    return (
      <View style={{ paddingVertical: 10 }}>
        <ActivityIndicator color="#fff" animating={this.state.loading} />
      </View>
    );
  }
  
  renderTotal() {
    if (this.state.loading) {
      return this.renderLoading();
    }
    
    const { total } = this.state.data;
    
    return (
      <Text style={{ fontSize: 64, color: '#fff' }}>{total}</Text>
    );
  }
  
  render() {
    const pages = Math.ceil(this.state.total / 10);
    
    return (
      <View >
        {this.renderTotal()}
        <View 
          style={{ flexDirection: 'column' }}
          onLayout={ e => {
            this.setState({
              contentWidth: e.nativeEvent.layout.width
            });
          }}
        >
        <Carousel
          ref={carousel => { this.carousel = carousel; }}
          sliderWidth={this.state.contentWidth}
          itemWidth={this.state.contentWidth}
          // enableMomentum
          onSnapToItem={(index) => this.setState({ activeSlide: index })}
        >
        {this.renderPages()}
        </Carousel>
        </View>
        <Pagination
          dotsLength={pages}
          activeDotIndex={this.state.activeSlide}
          containerStyle={{ height: 20, paddingVertical: 0, marginVertical: 0, padding: 0, margin: 0, paddingTop: 0, paddingBottom: 0, marginTop: 0, marginBottom: 0 }}
          dotStyle={{
            width: 10,
            height: 10,
            borderRadius: 5,
            marginHorizontal: 5,
            backgroundColor: '#fff'
          }}
          inactiveDotOpacity={0.4}
          inactiveDotScale={0.6}
        />
      </View>
    );
  }
}
