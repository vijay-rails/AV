import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity  } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { Dialog, DialogDefaultActions } from 'react-native-material-ui';
import KeyboardSpacer from 'react-native-keyboard-spacer';

export default class BasicDialog extends Component {

  static propTypes = {
    visible: PropTypes.bool,
    style: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.object,
    ]),
    title: PropTypes.string,
    titleStyle: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.object,
    ]),
    action: PropTypes.func,
    actionStyle: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.object,
    ]),
    children: PropTypes.node,
    onPressVoid: PropTypes.func,
  }

  static defaultProps = {
    visible: false,
    children: (<View />),
    onPressVoid: () => {},
  }

  renderSpacer() {
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
      style={{ 
  	    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0
	  }} 
      onPress={this.props.onPressVoid}
      activeOpacity={1}
    >
      <View style={styles.container} >
        <Animatable.View animation={'fadeInUp'} duration={500} easing={'ease-in-out-expo'} >
          <Dialog style={{ container: styles.dialog }}>
            <Dialog.Title><Text style={this.props.titleStyle} >{this.props.title}</Text></Dialog.Title>
            <Dialog.Content>
              {this.props.children}
            </Dialog.Content>
            <Dialog.Actions>
              <DialogDefaultActions
                 actions={['Dismiss', 'Apply']}
                 onActionPress={this.props.action}
                 style={{text: this.props.actionStyle }}
              />
            </Dialog.Actions>
          </Dialog>
        </Animatable.View>
        {this.renderSpacer()}
      </View>
    </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center'
  },
  dialog: {
    alignSelf: 'center',
  }
});
