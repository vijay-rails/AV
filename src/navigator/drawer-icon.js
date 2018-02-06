import React from 'react';
import { View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { default as Theme } from '../lib/theme';

const DrawerIcon = ({ name, color }) => (
  <View style={[Theme.Styles.f1, Theme.Styles.column, { justifyContent: 'center' }]}>
    <Icon name={name} size={Theme.Fonts.h4} color={color} style={{ textAlign: 'center' }} />
  </View>
);

export default DrawerIcon;
