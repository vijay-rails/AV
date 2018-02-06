import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { 
  StyleSheet, View, Text
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import SimpleCard from './simple-card';

import { default as Theme } from '../lib/theme';

export default class SimpleStatus extends Component {
  static propTypes = {
    statusText: PropTypes.string,
    statusIcon: PropTypes.string
  }

  static defaultProps = {
    statusText: '',
    statusIcon: 'info-outline'
  }

  render() {
    const { statusIcon, statusText } = this.props;
    return (
      <View style={[styles.container, { padding: 20, flexDirection: 'row' } ]}>
        <SimpleCard style={{ padding: 10, flexDirection: 'column' }} wrapperStyle={{ flex: 1, alignSelf: 'center' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
            <Icon name={statusIcon} size={48} color={Theme.Colours.primary} />
          </View>
          <View style={{ flexDirection: 'row', paddingHorizontal: 5, justifyContent: 'center' }}>
            <Text style={[styles.h3, { alignSelf: 'center' } ]}>{statusText}</Text>
          </View>
        </SimpleCard>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // flexDirection: 'row',
    // justifyContent: 'flex-start',
    // alignItems: 'center',
    backgroundColor: Theme.Colours.cardItemBackground_White,
  },
  h3: {
    fontFamily: 'System',
    fontSize: Theme.Fonts.fontLarge
  }
});
