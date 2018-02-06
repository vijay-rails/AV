import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Dimensions, } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { Dialog, DialogDefaultActions } from 'react-native-material-ui';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import { default as Theme } from '../lib/theme';

const dialogWidth = Dimensions.get('window').width;

export default class SimpleDialog extends Component {
  static propTypes = {
    visible: PropTypes.bool,
    useSpacer: PropTypes.bool,
    style: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.object,
    ]),
    children: PropTypes.node,
    onPressVoid: PropTypes.func,
  }

  static defaultProps = {
    visible: false,
    useSpacer: false,
    children: (<View />),
    onPressVoid: () => {}
  }

  static styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'center', 
    },
    dialog: {
      alignSelf: 'center',
      width: dialogWidth * 0.9
    }
  })

  renderSpacer() {
    if (!this.props.useSpacer) {
      return null;
    }
    if (Platform.OS === 'android') {
      return null;
    }
    return (<KeyboardSpacer />);
  }
  
  render() {
    if (!this.props.visible) {
        return null;
    }
    return (
      <TouchableOpacity
        ref="dialog" 
        style={[Theme.Styles.overlay ]} 
        onPress={this.props.onPressVoid}
        activeOpacity={1}
      >
      	<View style={[Theme.Styles.overlay, SimpleDialog.styles.container, this.props.overlayStyle]} >
          <Animatable.View animation={'fadeInUp'} duration={500} easing={'ease-in-out-expo'}>
            <Dialog style={{ container: [ SimpleDialog.styles.dialog, this.props.style] }}>
              <Dialog.Content>
                {this.props.children}
              </Dialog.Content>
            </Dialog>
          </Animatable.View>
          {this.renderSpacer()}
        </View>
      </TouchableOpacity>
    );
  }
}
