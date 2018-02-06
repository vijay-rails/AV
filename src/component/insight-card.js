import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { 
  View, Text, StyleSheet, Image, WebView, TouchableOpacity, TouchableHighlight , 
  UIManager,
  Platform,
  LayoutAnimation
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { Card } from 'react-native-material-ui';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Animation } from '../lib/animation';
import { default as Theme } from '../lib/theme';

export default class InsightCard extends Component {

  static propTypes = {
    style: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.number,
      PropTypes.array,
    ]),
    cardContent: PropTypes.node,
    drawerContent: PropTypes.node,
    closeable: PropTypes.bool
  }

  static defaultPropTypes = {
    closeable: true,
    cardContent: null,
    drawerContent: null,
  }
  
  constructor(props) {
    super(props);
    
    this._onPressButton = this._onPressButton.bind(this);
    
    this.state = {
      drawerOpen: false,
      hasDrawer: props.drawerContent !== null
    };
    
    if (Platform.OS === 'android') {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }

  _onPressButton = () => {
    if (this.state.drawerOpen) {
        LayoutAnimation.configureNext(Animation.slideFast);
    }
    else {
        LayoutAnimation.configureNext(Animation.slideSlow);
    }
    
    this.setState({
      drawerOpen: !this.state.drawerOpen
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.drawerContent === null && this.props.drawerContent !== null) {
      this.setState({
        hasDrawer: false
      });
    }
    else if (nextProps.drawerContent !== null && this.props.drawerContent === null) {
      this.setState({
        hasDrawer: true
      });
    }
  }
  
  renderDrawer() {
    if (!this.state.hasDrawer) {
      return null;
    }
      
    const drawerStyle = this.state.drawerOpen ? styles.drawerVisible : styles.drawerHidden;
    
    return (
      <View style={[ styles.cardDrawer, drawerStyle ]} >
        {this.props.drawerContent}
      </View>
    );
  }

  renderBody() {
    let cardStyles = [styles.cardBody];
    
    if (!this.state.drawerOpen) {
      cardStyles.push(styles.drawerVisible);
    }
    
    if (Array.isArray(this.props.style)) {
      cardStyles.concat(this.props.style);
    }
    else {
      cardStyles.push(this.props.style);
    }
  
    return (
      <TouchableHighlight onPress={this._onPressButton} underlayColor={Theme.Colours.white} style={{ flex: 1, flexDirection: 'column' }}>
        <View style={[cardStyles]}>
          {this.props.cardContent}
        </View>
      </TouchableHighlight  >
    );
  }
    
  renderCloseable() {
    if (!this.props.closeable) {
      return null;
    }
    
    return (
      <View style={styles.cardCloseContainer}>
        <Icon name={'close'} size={16} color={Theme.Colours.border} />
      </View>
    );
  }
  
  render() {
    return (
      <Card style={{
        container: [styles.card]
      }}>
        {this.renderBody()}
        {this.renderDrawer()}
        {this.renderCloseable()}
      </Card>
    );
  }
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 3,
    marginVertical: 4,
    marginHorizontal: 8,
    backgroundColor: Theme.Colours.white,
  },
  cardCloseContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingTop: 8,
    paddingRight: 8
  },
  cardBody: {
    flex: 1, // 0.75,
    flexDirection: 'row',
    paddingVertical: 8,
    backgroundColor: Theme.Colours.white,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  cardClose: {
  },
  drawerHidden: {
    position: 'absolute',
    bottom: 0,
    zIndex: -1
  },
  drawerVisible: {
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    zIndex: -1
  },
  cardDrawer: {
    flexDirection: 'row',
    paddingVertical: 8,
    backgroundColor: Theme.Colours.black,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  }
});
