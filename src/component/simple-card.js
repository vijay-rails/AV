import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { 
  StyleSheet, View
} from 'react-native';
import { Card } from 'react-native-material-ui';

import { default as Theme } from '../lib/theme';

export default class SimpleCard extends Component {
  static propTypes = {
    children: PropTypes.node,
    style: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.number,
      PropTypes.array,
    ]),
    wrapperStyle: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.number,
      PropTypes.array,
    ]),
  }

  static defaultProps = {
    wrapperStyle: {}
  }

  render() {
    let style = [styles.card];
    
    if (Array.isArray(this.props.style)) {
      style.concat(this.props.style);
    }
    else {
      style.push(this.props.style);
    }
    
    return (
      <View style={this.props.wrapperStyle} elevation={5}>
        <Card style={{
          container: style
        }}>
          {this.props.children}
        </Card>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Theme.Colours.white,
  },
});
