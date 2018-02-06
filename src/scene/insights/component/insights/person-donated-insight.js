// import Moment from 'moment';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import MaterialInitials from 'react-native-material-initials/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { default as Theme } from '../../../../lib/theme';

export default class PersonDonatedInsight extends Component {

  static propTypes = {
    data: PropTypes.object,
    style: PropTypes.object,
    accentColour: PropTypes.string
  }

  static defaultProps = {
    accentColour: Theme.Colours.chartColor3_TurquoiseGreen
  }

  setNativeProps(props) {
    this.refs['insight'].setNativeProps(props);
  }

  renderIcon() {    
    const { data, accentColour } = this.props;
      
    return (<Icon name={"person"} size={24} color={accentColour} style={{ alignSelf: 'center' }} />)
    
    const color = Theme.Rainbow[data.hashCode % 15];
    
    let name = data.firstname.concat(' ', data.lastname).trim().toUpperCase();
    if (name.length == 0) {
        name = data.company.toUpperCase();
    }
    if (name.length == 0) {
        name = data.organization.toUpperCase();
    }
    
    return (
      <MaterialInitials
        style={{alignSelf: 'center'}}
        backgroundColor={color}
        color={Theme.Colours.white}
        size={40}
        text={name}
        single={false}
      />
    );
  }  
  
  render() {
    const { data, first, accentColour } = this.props;

    let colour = Theme.Colours.black;

    const name = data.firstname.concat(' ', data.lastname);

    let style = {};
    if (first) {
      style = { marginTop: 10 };
    }

    return (
      <View ref="insight" style={[styles.container, Theme.Styles.elevation, style]} elevation={3}>
        <View style={{ width: 10, backgroundColor: accentColour }}></View>
        <View style={[ Theme.Styles.column, Theme.Styles.f1 ]}>
          <View style={[Theme.Styles.row, { justifyContent: 'center', alignItems: 'center' }]}>
            <View style={{ padding: 5 }}>
              {this.renderIcon()}
            </View>
            <View style={[Theme.Styles.f1]}>
              <Text style={[styles.description]}>{name}</Text>
            </View>
          </View>
          <View style={[ Theme.Styles.column, Theme.Styles.f1, { paddingHorizontal: 10, paddingBottom: 5, justifyContent: 'center' } ]}>
            <Text style={[styles.description2]}>Donated Today</Text>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    marginBottom: 10,
    backgroundColor: Theme.Colours.backgrounds.light,
  },
  date: {
    fontSize: Theme.Fonts.fontMedium,
    color: Theme.Colours.black,
    textAlign: 'right',
  },
  description: {
    fontSize: Theme.Fonts.fontLarge,
    color: Theme.Colours.black,
    fontWeight: '400',
  },
  description2: {
    fontSize: Theme.Fonts.fontMedium,
    color: Theme.Colours.cardBackground_Grey,
    fontWeight: '400',
  },
});
