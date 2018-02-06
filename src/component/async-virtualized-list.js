import isEqual from 'lodash.isequal';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {
  View,
  StyleSheet,
  ListView,
  VirtualizedList,
  ActivityIndicator,
  UIManager,
  Platform,
  LayoutAnimation,
  Keyboard
} from 'react-native';

import { default as Theme } from '../lib/theme';

export default class AsyncVirtualizedList extends Component {
  static contextTypes = {
    app: PropTypes.object.isRequired
  }

  static propTypes = {
    // dsRowHasChanged: PropTypes.func.isRequired,
    keyExtractor: PropTypes.func.isRequired,
    dataProvider: PropTypes.func.isRequired,
    dataFilter: PropTypes.func,
    data: PropTypes.array,
    onRenderItem: PropTypes.func.isRequired,
    onDataItem: PropTypes.func.isRequired,
    style: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.number,
    ]),
    pageSize: PropTypes.number,
    renderSize: PropTypes.number,
    usePaging: PropTypes.bool
  }

  static defaultProps = {
    pageSize: 50,
    renderSize: 20,
    data: [],
    keyExtractor: rowData => null,
    onRenderItem: rowData => null,
    onDataItem: rowData => null,
    usePaging: true
  }

  constructor(props, context) {
    super(props, context);

    this._keyboardDidShow = this._keyboardDidShow.bind(this);
    this._keyboardDidHide = this._keyboardDidHide.bind(this);
    
    this.loadData = this.loadData.bind(this);
    this.reset = this.reset.bind(this);
    this.renderLoading = this.renderLoading.bind(this);
    
    /*
    const ds = new ListView.DataSource({
        rowHasChanged: this.props.dsRowHasChanged
    });
    */

    this.state = {
      loading: false,
      loaded: false,
      // data: [],
      // dataSource: ds.cloneWithRows(this._getData(props)),
      dataSourceUpdated: false,
      page: 1,
      keyboardOpen: false
    };

    if (Platform.OS === 'android') {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }
  
  _getData(props) {
    return (typeof props.dataFilter === 'function') ? props.dataFilter(props.data) : props.data; 
  }
  
  _keyboardDidShow() {
    this.setState({
      keyboardOpen: true
    });
  }
  
  _keyboardDidHide() {
    this.setState({
      keyboardOpen: false
    });
  }
  
  loadData() {
    this.setState({
      loading: true,
    }, () => {
	    this.props.dataProvider(this.state.page, this.props.pageSize)
	    .then((data) => {
	      let page = this.state.page;
	      if (data.length > 0) {
	        page++;
	      }
        this.setState({
          page: page,
          loaded: data.length < this.props.pageSize
        });
	      return data;
	    });
    });
  }

  reset() {
    this.setState({
      page: 1,
      loaded: false,
    }, this.loadData);
  }

  componentWillReceiveProps(nextProps) {
    if (!isEqual(nextProps.data, this.props.data)) {
  	  this.setState({
  	    dataSourceUpdated: true
	      // data: this._getData(nextProps),
	    }/*, () => {
	      this.setState({
	        dataSourceUpdated: true
	      });
	    }*/);
    }
  } 
  
  shouldComponentUpdate(nextProps, nextState) {
    if (!isEqual(nextState, this.state) || !isEqual(nextProps, this.props)) {
      return true;
    }
    return false;
  }
  
  componentWillMount() {
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
  }
  
  componentWillUnmount() {
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
  }
  
  componentDidMount() {
    try {
      // LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
      this.loadData();
    }
    catch (e) {
      console.error(e);
    }
  }
    
  componentDidUpdate(prevProps, prevState) {
    if (this.state.dataSourceUpdated) {
      this.setState({
        loading: false,
        dataSourceUpdated: false
      });
    }
  }
  
  renderLoading() {
  	if (!this.state.loading) {
      return null;
    }
    return (
      <View style={[styles.wrapper]}>
        <ActivityIndicator
          animating={this.state.loading}
          style={[styles.centering]}
          size="large"
        />
      </View>
    );
  }

  render() {
    return (
      <View style={[{ flex: 1, flexDirection: 'column' }, this.props.style]}>
        <VirtualizedList
	      // dataSource={this.state.dataSource}
	      // enableEmptySections
        keyExtractor={this.props.keyExtractor}
        data={this.props.data}
        initialNumToRender={this.props.renderSize}
        maxToRenderPerBatch={this.props.renderSize}
	      pageSize={this.props.pageSize}
	      renderItem={this.props.onRenderItem}
        getItem={this.props.onDataItem}
        refreshing={this.state.loading}
	      onEndReached={() => {
	        if (this.state.loaded) {
	          return;
	        }
	        if (this.props.usePaging && this.props.data.length > 0) {
            this.loadData();
          }
	      }}
	    />
	    {this.renderLoading()}
      </View>
    );
  }
}


const styles = StyleSheet.create({
  wrapper: { 
    position: 'absolute',
    top: 0,
  	right: 0,
  	bottom: 0,
	  left: 0,
  	flex: 1,
	  flexDirection: 'column',
  	alignItems: 'center',
	  justifyContent: 'center',
  },
  centering: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 8,
    width: 50,
    height: 50,
    borderRadius: 3,
    borderColor: Theme.Colours.black,
    borderWidth: 0.5,
  },
});