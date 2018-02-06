
import React from 'react';
import { StackNavigator } from 'react-navigation';
import Login from './component/login';

const LoginNavigator = StackNavigator({
  Login: {
    screen: Login,
  }
}, {
  headerMode: 'none'
});

export default LoginNavigator;