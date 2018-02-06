import PropTypes from 'prop-types';
import React, { Component } from 'react'; 
import {
  Image, StyleSheet
} from 'react-native';

export default class BackgroundImage extends Component {
  static propTypes = {
    children: PropTypes.node,
    source: Image.propTypes.source.isRequired,
    style: PropTypes.object
  }

  render() {
    return (
      <Image 
        resizeMode={Image.resizeMode.cover}
        resizeMethod="resize"
        source={this.props.source}
        style={[styles.image, this.props.style]}
      >
      {this.props.children}
      </Image>
    );
  }
}

const styles = StyleSheet.create({
  image: {
    flex:1,
    flexDirection: 'column',
    width: null,
    height: null,
    resizeMode:'cover',
  }
});
