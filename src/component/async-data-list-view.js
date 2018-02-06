import isEqual from 'lodash.isequal';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {
  View,
  StyleSheet,
  ListView,
  UIManager,
  Platform,
  LayoutAnimation,
  Keyboard,
  PanResponder
} from 'react-native';
import SimpleActivityIndicator from './simple-activity-indicator';
import AnimatedActivityIndicator from './animated-activity-indicator';

import { default as Theme } from '../lib/theme';

export default class AsyncDataListView extends Component {

  static contextTypes = {
    app: PropTypes.object.isRequired
  }

  static propTypes = {
    dsRowHasChanged: PropTypes.func.isRequired,
    dataProvider: PropTypes.func.isRequired,
    dataFilter: PropTypes.func,
    data: PropTypes.array,
    onRenderRow: PropTypes.func.isRequired,
    style: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.number,
    ]),
    pageSize: PropTypes.number,
    usePaging: PropTypes.bool,
    onLoadedChanged: PropTypes.func,
    onRenderHeader: PropTypes.func,
    onScroll: PropTypes.func,
    onScrollEndDrag: PropTypes.func,
    onMomentumScrollEnd: PropTypes.func,
    onScrollDown: PropTypes.func
  }

  static defaultProps = {
    pageSize: 50,
    data: [],
    onRenderRow: rowData => null,
    usePaging: true,
    onLoadedChanged: loaded => {},
    onRenderHeader: () => {},
    onScroll: () => {},
    onScrollEndDrag: () => {},
    onMomentumScrollEnd: () => {},
    onScrollDown: () => {}
  }

  constructor(props, context) {
    super(props, context);

    this._keyboardDidShow = this._keyboardDidShow.bind(this);
    this._keyboardDidHide = this._keyboardDidHide.bind(this);
    
    this.loadData = this.loadData.bind(this);
    this.reset = this.reset.bind(this);
    this.renderLoading = this.renderLoading.bind(this);
    
    const ds = new ListView.DataSource({
        rowHasChanged: this.props.dsRowHasChanged
    });

    this.state = {
      loading: false,                                       // are we currently loading
      loaded: false,                                        // are there more pages of data available on the server
      remoteLoaded: true,                                   // is the call from remote completed
      dataSource: ds.cloneWithRows(this._getData(props)),
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
  
  loading() {
    return this.state.loading;
  }
  
  loaded() {
    return this.state.loaded;
  }
  
  loadData() {
    this.setState({
      remoteLoaded: false,
      loading: true,
    }, () => {
      // console.log('--- paging first', this.state.page);
      
	  this.props.dataProvider(this.state.page, this.props.pageSize)
	  .then((data) => {
	    let page = this.state.page;
	    if (data.length > 0) {
	      page++;
	    }
	    
	    // console.log('---', page);
        this.setState({
          page: page,
          remoteLoaded: true,
          loaded: data.length < this.props.pageSize
        }, () => {
          this.props.onLoadedChanged(data.length < this.props.pageSize);
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
	    dataSource: this.state.dataSource.cloneWithRows(this._getData(nextProps)),
	  }, () => {
	    this.setState({
	      dataSourceUpdated: true
	    });
	  });
    }
    else if (this.state.remoteLoaded) {
      this.setState({
        dataSourceUpdated: true
      });
    }
  } 
  
  shouldComponentUpdate(nextProps, nextState) {
    // if we are currently loading then don't update the component rendering
    if (this.state.remoteLoaded === false && nextState.remoteLoaded === false) {
      return false;
    }
    
    // if all else is different between state and props, update render
    if (!isEqual(nextState, this.state) || !isEqual(nextProps, this.props)) {
      return true;
    }
    
    // otherwise, no
    return false;
  }
  
  componentWillMount() {
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
    
    this._panResponder = PanResponder.create({
      // Ask to be the responder:
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,
      /*
      onPanResponderGrant: (evt, gestureState) => {
        // The gesture has started. Show visual feedback so the user knows
        // what is happening!
        // alert('test');
        // gestureState.d{x,y} will be set to zero now
        // console.log(gestureState);
      },
      */
      onPanResponderMove: (evt, gestureState) => {
        // The most recent move distance is gestureState.move{X,Y}

        // The accumulated gesture distance since becoming responder is
        // gestureState.d{x,y}
        
        // if (gestureState.dx is within +- 4 and gestureState.dy is greater than 0, we have a down scroll.
        // if we began at 0, we searchOpen
        if (gestureState.dx >= -4 && gestureState.dx <= 4 && gestureState.dy > 0) {
          this.props.onScrollDown(gestureState);
        } 
      },
      /*
      onPanResponderTerminationRequest: (evt, gestureState) => true,
      onPanResponderRelease: (evt, gestureState) => {
        // The user has released all touches while this view is the
        // responder. This typically means a gesture has succeeded
      },
      onPanResponderTerminate: (evt, gestureState) => {
        // Another component has become the responder, so this gesture
        // should be cancelled
      },
      onShouldBlockNativeResponder: (evt, gestureState) => {
        // Returns whether this component should block native components from becoming the JS
        // responder. Returns true by default. Is currently only supported on android.
        return true;
      },
      */
    });
  }
  
  componentWillUnmount() {
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
  }
  
  componentDidMount() {
    try {
      // LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
      this.reset();
      // console.log('---','mounting','222');
      // this.loadData();
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

    if (this.state.page === 1) {
      return (
        <View style={[styles.wrapper]}>
          <AnimatedActivityIndicator animating={this.state.loading} />
        </View>
      );      
    }
    return (
      <View style={[styles.wrapper, Theme.Styles.center]}>
        <SimpleActivityIndicator animating={this.state.loading} />
      </View>
    );
  }

  render() {
    return (
      <View style={[{ flex: 1, flexDirection: 'column' }, this.props.style]}>
        <ListView
          // {...this._panResponder.panHandlers}
          
	      dataSource={this.state.dataSource}
	      enableEmptySections
	      initialListSize={this.props.pageSize}
	      pageSize={this.props.pageSize}
	      renderRow={this.props.onRenderRow}
	      onEndReached={() => {
	        // console.log('---','before!');
	        if (this.state.loaded) {
	          return;
	        }
	        if (this.props.usePaging && this.props.data.length > 0) {
	          // console.log('---','paging','333', this.state.page);
              this.loadData();
            }
	      }}
	      renderHeader={this.props.onRenderHeader}
	      onScroll={this.props.onScroll}
	      onScrollEndDrag={this.props.onScrollEndDrag}
	      onMomentumScrollEnd={this.props.onMomentumScrollEnd}
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
	flexDirection: 'row',
  }
});