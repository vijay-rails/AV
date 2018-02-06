import PropTypes from 'prop-types';
import React, { Component } from 'react'; 
import {
  View, Image, StyleSheet, Dimensions
} from 'react-native';

import { default as Theme } from '../lib/theme';

export default class ImageTile extends Component {

  static propTypes = {
    children: PropTypes.node,
    source: Image.propTypes.source.isRequired,
    imageWidth: PropTypes.number,
    imageHeight: PropTypes.number
  }

  renderTiles(row, cols) {
    let images = [];
    for(let i = 0, j = cols; i < j; i++) {
      let key = (row*i)+i;
      images.push((
        <Image key={key} source={this.props.source} />
      ));
    }
    return images.map( img => img ); 
  }
  
  renderRows(rows, cols) {
    let images = [];
    for (let i = 0; i < rows; i++) {
      images.push((
        <View key={i} style={styles.row}>
        {this.renderTiles(i,cols)}
        </View>
      ));
    }
    return images.map( img => img );
  }

  render() {
    if (this.props.imageWidth == null || this.props.imageHeight == null) {
      return null;
    }
    
    let winWidth = Dimensions.get('window').width;
    let winHeight = Dimensions.get('window').height;
    let cols = Math.ceil(winWidth / this.props.imageWidth);
    let rows = Math.ceil(winHeight / this.props.imageHeight);

    return (
      <View style={styles.container}>
        {this.renderRows(rows, cols)}
        <View style={styles.wrapper}>
          {this.props.children}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection:'column',
    // justifyContent: 'flex-start',
  },
  row: {
    flex: 1,
    flexDirection:'row'
  },
  wrapper: {
    position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, flex: 1, flexDirection: 'column'
  }
});
