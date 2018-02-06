import Moment from 'moment';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { View, Text, StyleSheet, Image, TouchableHighlight, Platform } from 'react-native';
import { Avatar } from 'react-native-material-ui'; 
import Icon from 'react-native-vector-icons/MaterialIcons';

import { default as Theme } from '../lib/theme';

const TapIcon = (name, onPress) => (
  <TouchableHighlight onPress={onPress} underlayColor={'rgba(127,127,127,0.5)'} style={{ borderRadius: 50, padding: 10 }} >
    <Icon 
      name={name} 
      size={26} 
      style={Theme.Styles.listItemIcons}
      borderRadius={0}
    />
    
  </TouchableHighlight>  
);

export default class EventListItem extends Component {

  static contextTypes = {
    app: PropTypes.object.isRequired
  }

  static propTypes = {
    data: PropTypes.object,
    style: PropTypes.object,
  }

  constructor(props, context) {
    super(props, context);
    
    this.listItemUpdated = this.listItemUpdated.bind(this);
    
    this.state = {
      favourite: context.app.isFavouriteEvent(props.data.id),
      assetDomain: context.app.getAssetServerDomain()
    };
  }
  
  setNativeProps(props) {
    this.refs['item'].setNativeProps(props);
  }

  listItemUpdated(props) {
    if (this.props.data.id === props.id) {
      this.setState({
        favourite: props.favourite
      });
    }
  }
  
  componentWillMount() {
    this.context.app.connect('list-item-updated', this.listItemUpdated);
  }

  componentWillUnmount() {
    this.context.app.disconnect('list-item-updated', this.listItemUpdated);
  }
  
  renderAvatar(uri) {
    return (
      <Image 
        resizeMode="contain"
        source={{uri: uri}} 
        style={styles.avatar}
    />);
  }
  
  renderIcon() {
    return (
      <View style={[styles.avatar, { backgroundColor: Theme.Colours.white, justifyContent: 'center' } ]}>
        <Icon name={"local-play"} size={36} color={Theme.Colours.border} style={{ alignSelf: 'center' }} />
      </View>
    );
  }
  
  render() {
    const { data } = this.props;

    if (!data) {
        return null;
    }

    let FaveIconButton = null;
    if (this.state.favourite) {
      FaveIconButton = TapIcon('star', () => {
        this.context.app.unsetFavouriteEvent(data.id);
        this.setState({
          favourite: false
        });
      });  
    }
    else {
      FaveIconButton = TapIcon('star-border', () => {
        this.context.app.setFavouriteEvent(data.id);
        this.setState({
          favourite: true
        });
      });
    }
 
 
    console.log('--- assetDomain', this.state.assetDomain);
    
    // TODO: Remove Hard Coded AllVolls
    let avatar = null;
    if (typeof data.logoOne === 'string' && data.logoOne.length > 0) {
      avatar = this.renderAvatar(this.state.assetDomain + data.logoOne);
    }
    else if (typeof data.logoTwo === 'string' && data.logoTwo.length > 0) {
      avatar = this.renderAvatar(this.state.assetDomain + data.logoTwo);
    }
    else {
      avatar = this.renderIcon();
    }
    
    eventDate = Moment(data.startDate[0]).format('MMM Do YYYY, h:mm a');
    
    let venueName = null;
    if (data.group.length > 0) {
      venueName = data.group.concat(' @ ', data.venueName);
    }
    /*
    else if (data.category.length > 0) {
      venueName = data.category.concat(' @ ', data.venueName);
    }
    */
    else {
      venueName = data.venueName;
    }
    
    return (
      <View ref="item" style={styles.container}>
        <View style={styles.bodyLeft}>
          <View style={styles.avatarContainer}>
            {avatar}
          </View>
        </View>
        <View style={styles.bodyMiddle}>
          <View style={styles.detailsTop}>
            <View style={[{ flex: 1 }, styles.col]}>
              <Text numberOfLines={1} style={Theme.Styles.listItemTitle}>{data.shortDescription}</Text>
              <Text numberOfLines={2} style={Theme.Styles.listItemLocation}>{eventDate} @ {venueName}</Text>
            </View>
          </View>
        </View>
        <View style={styles.bodyRight}>
        {FaveIconButton}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 8,
    backgroundColor: Theme.Colours.cardItemBackground_White,
    borderBottomWidth: 1,
    borderBottomColor: Theme.Colours.greyLight
  },
  bodyLeft: {
    flex: 0.20,
    alignItems: 'center',
  },
  bodyMiddle: {
    flex: 0.65,
    flexDirection: 'column',
  },
  bodyRight: {
    flex: 0.15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    borderRadius: Platform.OS == 'android' ? 50 : 25,
    height: 50,
    width: 50,
    alignSelf: 'center',
  },
  avatarContainer: {
    flex: 1,
    width: '75%',
    justifyContent: 'center',
    // backgroundColor: 'red',
  },
  detailsTop: {
    flex: 0.6,
    flexDirection: 'column',
  },
  // name: {
  //   flex: 1,
  //   fontSize: Theme.Fonts.h5,
  //   color: Theme.Colours.black,
  //   fontFamily: 'System'
  // },
  // location: {
  //   flex: 1,
  //   fontSize: Theme.Fonts.fontSmall,
  //   color: Theme.Colours.border
  // },
  detailsBottom: {
    flex: 0.4,
    flexDirection: 'column',
  },
  details25: {
    flex: 0.25,
  },
  details50: {
    flex: 0.50,
  },
  row: {
    flexDirection: 'row',  
  },
  col: {
    flexDirection: 'column',
  },
  detailTypeText: {
    flex: 0.75,
    fontSize: Theme.Fonts.fontMedium,
    alignSelf: 'center'
  },
  detailValueText: {
    flex: 0.25,
    textAlign: 'left',
    paddingRight: 10,
    fontWeight: 'bold',
  },
  fill50: {
    flex: 0.50
  },
  fill75: {
    flex: 0.75
  }
});
