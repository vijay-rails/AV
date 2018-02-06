
// import Moment from 'moment';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { View, Text, StyleSheet, Image, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { default as Theme } from '../../../../lib/theme';

export default class EventYesterdaySummaryInsight extends Component 
{
  static contextTypes = {
    app: PropTypes.object.isRequired
  }
  
  static propTypes = {
    data: PropTypes.object,
    style: PropTypes.object,
    accentColour: PropTypes.string,
  }

  static defaultProps = {
    accentColour: Theme.Colours.chartColor4_Blue
  }

  setNativeProps(props) {
    this.refs['insight'].setNativeProps(props);
  }

  constructor(props, context) {
    super(props, context);
    
    this.state = {
      assetDomain: context.app.getAssetServerDomain()
    };
  }
  
  renderAvatar(uri) {
    return (
      <Image 
        resizeMode="contain"
        source={{uri: uri}} 
        style={styles.avatar}
      />
    );
  }
  
  renderIcon() {    
    const { data, accentColour } = this.props;
      
    return (<Icon name={"event"} size={24} color={accentColour} style={{ alignSelf: 'center' }} />)
    
    let avatar = null;
    if (typeof data.logoOne === 'string' && data.logoOne.length > 0) {
      avatar = this.renderAvatar(this.state.assetDomain + data.logoOne);
    }
    else if (typeof data.logoTwo === 'string' && data.logoTwo.length > 0) {
      avatar = this.renderAvatar(this.state.assetDomain + data.logoTwo);
    }
    return (
      <View style={styles.avatarContainer}>
        {avatar}
      </View>
    );
  }   

  renderSalesIcon() {
    return (
      <View style={[styles.avatarContainer, { justifyContent: 'center' } ]}>
        <Icon name={"local-play"} size={30} color={Theme.Colours.cardBackground_Grey} style={{ alignSelf: 'center', top: -2 }} />
      </View>
    )
  }
  
  render() {
    const { data, first, accentColour } = this.props;

    let colour = Theme.Colours.black;

    const name = data.eventdesc;

    let style = {};
    if (first) {
      style = { marginTop: 10 };
    }
    
    let sellRate = ( 100 * data.soldSeatCount ) / data.totalSeatCount;
    if (sellRate < 1) {
      sellRate = sellRate.toFixed(2);
    }  
    else {
      sellRate = Math.round(sellRate);
    }
    
    return (
      <View ref="insight" style={[styles.container, Theme.Styles.elevation, style]} elevation={3}>
        <View style={{ width: 10, backgroundColor: accentColour }}></View>
        <View style={[ Theme.Styles.column, Theme.Styles.f1]}>
          <View style={[Theme.Styles.row, { justifyContent: 'center', alignItems: 'center' }]}>
            <View style={{ padding: 5 }}>
              {this.renderIcon()}
            </View>
            <View style={[Theme.Styles.f1]}>
              <Text style={[styles.description]}>{name}</Text>
            </View>
          </View>

          <View style={[Theme.Styles.row, { justifyContent: 'center', alignItems: 'center' }]}>
             <View style={{ padding: 1, paddingLeft: 5 }}>
               {this.renderSalesIcon()}
             </View>
             <View style={[ Theme.Styles.column, Theme.Styles.f1, { paddingHorizontal: 10, paddingBottom: 5, justifyContent: 'center' } ]}>
               { (typeof data.amount !== 'undefined'  && data.amount != 0 && data.amount !== null) ?
                 <Text style={[styles.description3]}>{data.soldSeatCount} SOLD ({sellRate}%)</Text> 
               :
                 <Text style={[styles.description3]}>{data.soldSeatCount} SOLD</Text>
               }
             </View>
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
    color: Theme.Colours.chartColor4_Blue, // chartColor5_Pink,
    fontWeight: '400',
  },
  description2: {
    fontSize: Theme.Fonts.fontMedium,
    color: Theme.Colours.black,
    fontWeight: '400',
  },
  description3: {
    fontSize: Theme.Fonts.h4,
    color: Theme.Colours.cardBackground_Grey,
    fontWeight: '600',
  },
  avatar: {
    borderRadius: Platform.OS == 'android' ? 40 : 20,
    height: 40,
    width: 40,
    alignSelf: 'center',
  },
});
