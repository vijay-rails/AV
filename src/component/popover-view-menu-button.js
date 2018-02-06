
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Button } from 'react-native-material-ui';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { View, StyleSheet  } from 'react-native';
import { default as Theme } from '../lib/theme';

import { takeSnapshot } from "react-native-view-shot";
import Share from 'react-native-share';

export default class PopoverViewMenuButton extends Component {

  static contextTypes = {
    app: PropTypes.object.isRequired
  }

  static propTypes = {
    label: PropTypes.string,
    style: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.number,
      PropTypes.array,
    ]),
    action: PropTypes.func.isRequired,
    showIcon: PropTypes.oneOfType([
        PropTypes.bool,
        PropTypes.string,
    ]),
    enabled: PropTypes.bool,
    useEnabled: PropTypes.bool, 
    onClosed: PropTypes.func,
  }

  static defaultProps = {
    showIcon: true,
    enabled: false,
    useEnabled: false,
  }

  constructor(props, context) {
    super(props, context);

    this.onClosed = this.onClosed.bind(this);
  }

  onClosed(props) {
    console.log(`----------onClosed PRESSED`);
    if(this.props.onClosed !== null) {
      this.props.onClosed();
    }
  }
  
  componentWillMount() {
    if(this.props.onClosed !== null) {
      console.log(`------------- onClosed Mounted`)
      this.context.app.connect('popover-closed', this.onClosed);
    }
  }

  componentWillUnmount() {
    if(this.props.onClosed !== null) {
      console.log(`------------- onClosed UnMounted`)

      this.context.app.emit('popover-closed', this.onClosed)
      this.context.app.disconnect('popover-closed', this.onClosed);
    }
  }
  
  renderIcon() {
    if (typeof this.props.showIcon === 'boolean' && this.props.showIcon === false) {
        return null;
    }
    let icon = 'expand-more';
    if (typeof this.props.showIcon === 'string') {
    	icon = this.props.showIcon;
    }
    
    return (
      <Icon.Button 
        name={icon} 
        // size={22} 
        backgroundColor={'transparent'}
        color={'rgb(170, 172, 175)'} 
        iconStyle={{marginLeft: 0, marginRight: 0, paddingLeft: 0, paddingRight: 0}}
        borderRadius={0}
        onPress={this.props.action}
      />
    );
  }
  
  renderEnabled() {
    if (!this.props.useEnabled) {
      return null;
    }

    let color = Theme.Brand.primary; 
    if (!this.props.enabled) {
      color = 'transparent'; 
    } 

    return (
      <Icon
        name={'check'} 
        size={22} 
        backgroundColor={'transparent'}
        color={color} 
        style={styles.icon}
        iconStyle={{marginLeft: 0, marginRight: 0, paddingLeft: 0, paddingRight: 0}}
        borderRadius={0}
      />
    );  
  }
  
  render() {
    return (
      <View style={styles.container}>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
          {this.renderEnabled()}
          <Button 
            icon={this.renderIcon()}
            uppercase 
            backgroundColor={this.props.backgroundColor}
            primary 
            text={this.props.label} 
            style={{ container: [styles.menuButton, this.props.style], text: styles.menuText }} 
            onPress={this.props.action}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  menuButton: {
    marginLeft: 0, marginRight: 0, paddingLeft: 0, paddingRight: 15, marginVertical: 2
  },
  menuText: {
    color: Theme.Colours.black,
    fontWeight: "300",
    fontFamily: 'System',
  },
  icon: {
    marginHorizontal: 5,
  }
});
