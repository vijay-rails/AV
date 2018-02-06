import Moment from 'moment';
import PropTypes from 'prop-types';
import React, { Component } from 'react'
import DatePicker from 'react-native-datepicker'
import { View, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { default as Theme } from '../lib/theme';

export default class DateRangeFilter extends Component {
  static propTypes = {
    startDate: PropTypes.string,
    endDate: PropTypes.string,
  }

  static defaultProps = {
    startDate: Moment().format('YYYY-MM-DD'),
    endDate: Moment().format('YYYY-MM-DD')
  }

  state = {
    startDate: props.startDate,
    endDate: props.endDate,
  }

  getFilter = () => {
    return this.state;
  }
  
  componentWillReceiveProps(nextProps) {
    if (nextProps.startDate !== this.props.startDate) {
      this.setState({
        startDate: nextProps.startDate,
      });
    }
    
    if (nextProps.endDate !== this.props.endDate) {
      this.setState({
        endDate: nextProps.endDate
      });
    }
  }
  
  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.startDate !== this.props.startDate 
            || nextProps.endDate !== this.props.endDate
            || nextState.startDate !== this.state.startDate
            || nextState.endDate !== this.state.endDate) {
        return true;
    }
    return false;
  }
  
  render(){
    return (
      <View style={styles.container}>
        <DatePicker
          style={{width: '100%'}}
          date={this.state.startDate}
          mode="date"
          placeholder="Start Date"
          format="YYYY-MM-DD"
          // minDate="2016-05-01"
          // maxDate="2016-06-01"
          confirmBtnText="Confirm"
          cancelBtnText="Cancel"
          iconComponent={(<Icon 
            name={'event'} 
            size={32} 
            style={{
              position: 'absolute', left: 0, top: 4, marginLeft: 0, 
              color: Theme.Brand.primary, backgroundColor: 'transparant' }}
          />)}
          customStyles={{
            dateInput: {
              marginLeft: 36
            }
            // ... You can check the source to find the other keys.
          }}
          onDateChange={(date) => {this.setState({startDate: date})}}
        />
        <DatePicker
          style={{width: '100%', marginTop: 10}}
          date={this.state.endDate}
          mode="date"
          placeholder="End Date"
          format="YYYY-MM-DD"
          // minDate="2016-05-01"
          // maxDate="2016-06-01"
          confirmBtnText="Confirm"
          cancelBtnText="Cancel"
          iconComponent={(<Icon 
            name={'event'} 
            size={32} 
            style={{
              position: 'absolute', left: 0, top: 4, marginLeft: 0, 
              color: Theme.Brand.primary, backgroundColor: 'transparant' }}
          />)}
          customStyles={{
            dateInput: {
              marginLeft: 36
            }
            // ... You can check the source to find the other keys.
          }}
          onDateChange={(date) => {this.setState({endDate: date})}}
        />
      </View>
    )
  }
}
  
const styles = StyleSheet.create({
  container: {
  },
});