import Moment from 'moment';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, DatePickerIOS  } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { Dialog, DialogDefaultActions } from 'react-native-material-ui';
import KeyboardSpacer from 'react-native-keyboard-spacer';

import { default as Theme } from '../lib/theme';

export default class DatePickerDialog extends Component {

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
    onPressVoid: PropTypes.func,
    onDismiss: PropTypes.func,
    onApply: PropTypes.func,
    date: PropTypes.string,
    minDate: PropTypes.string,
    maxDate: PropTypes.string
  }

  static defaultProps = {
    visible: false,
    onPressVoid: () => {},
    onDismiss: () => {},
    onApply: () => {},
    date: Moment().format('YYYY-MM-DD'),
    minDate: null,
    maxDate: null,
  }

  state = {
    date: this.props.date
  }

  setNativeProps(props) {
    this.refs['picker'].setNativeProps(props);
  }
 
  getValue() {
	return this.state.date;
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
    
    const date = Moment(this.state.date).toDate();
    
    let dateProps = {};
    let restrictedDate;
    if (this.props.minDate && this.props.minDate.length > 0) {
    	dateProps = Object.assign({
    		minimumDate: Moment(this.props.minDate).toDate()
    	});
    }
    else if (this.props.maxDate && this.props.maxDate.length > 0) {
    	dateProps = Object.assign({
    		maximumDate: Moment(this.props.maxDate).toDate()
    	});
    }
    
    return (
    <TouchableOpacity 
      ref="picker"
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
              <DatePickerIOS date={date} mode="date" 
                onDateChange={ nextDate => {
                  this.setState({
                	  date: Moment(nextDate).format('YYYY-MM-DD'),
                  });
                }} 
                {...dateProps}
              />
            </Dialog.Content>
            <Dialog.Actions>
              <DialogDefaultActions
                 actions={['Dismiss', 'Apply']}
                 onActionPress={ action => {
                   if (action === 'Dismiss') {
                	 this.props.onDismiss();
                   }
                   else {
                     this.props.onApply(this.state.date);
                   }
                 }}
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
