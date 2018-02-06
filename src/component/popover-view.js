import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback   } from 'react-native';
import { Card } from 'react-native-material-ui';
import * as Animatable from 'react-native-animatable';
import { default as Theme } from '../lib/theme';

export default class PopoverView extends Component {
  
  static propTypes = {
    children: PropTypes.node,
    visible: PropTypes.bool,
    position: PropTypes.string,
    style: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.object,
    ]),
    cardContainerStyle: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.object,
    ]),
    onPress: PropTypes.func,
  }

  static defaultProps = {
    visible: false,
    position: "right"
  }

  render() {
    if (!this.props.visible) {
        return null;
    }
    
    let popoverStyle = styles.popoverRight;
    if (this.props.position == "left") {
      popoverStyle = styles.popoverLeft;
    }
    
    return (
      <TouchableWithoutFeedback onPressIn={this.props.onPress} style={styles.container} >
        <View style={styles.container} >
          <View style={[popoverStyle, this.props.style]} >
            <Animatable.View animation={'fadeInDown'} duration={500} easing={'ease-in-out-expo'}>
              <Card style={{
                container: [styles.card, styles.shadow, this.props.cardContainerStyle]
              }} >
                {this.props.children}
              </Card>
            </Animatable.View>
          </View>
        </View>
      </TouchableWithoutFeedback>
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
    zIndex: 100
  },
  popoverRight: {
    position: 'absolute',
    top: 0, right: 0
  },
  popoverLeft: {
    position: 'absolute',
    top: 0, left: 0
  },
  card: {
    borderRadius: 2,
    marginVertical: 5,
    marginHorizontal: 5,
    backgroundColor: Theme.Colours.white,
  },
  shadow: {
    shadowColor: Theme.Colours.black,
    shadowOffset: {
      width: 3,
      height: 3
    },
    shadowRadius: 3,
    shadowOpacity: 0.75,
    elevation: 3
  }
});
