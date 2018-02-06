import isEqual from 'lodash.isequal';
import React, { Component } from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';

import MapView from 'react-native-maps';
import supercluster from 'supercluster';
import MapClusterMarker from './map-cluster-marker';

import { default as Theme } from '../../../lib/theme';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE = 31.8018895;
const LONGITUDE = -85.9572283;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const SPACE = 0.01;

export default class Map extends Component {
  constructor(props) {
    super(props);

    this.createCluster = this.createCluster.bind(this);
    this.getMarkers = this.getMarkers.bind(this);
    this.getZoomLevel = this.getZoomLevel.bind(this);
    this.onRegionChange = this.onRegionChange.bind(this);
    
    this.state = {
      region: {
        latitude: LATITUDE,
        longitude: LONGITUDE,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      }
    };
    
    const cluster = this.createCluster(this.props.screenProps);
    const markers = this.getMarkers(cluster, this.state.region);

    this.state['cluster'] = cluster;
    this.state['markers'] = markers;
  }

  createCluster(props) {
    const cluster = supercluster({
      radius: 75,
      maxZoom: 16,
    });
    
    const { peopleData } = props;
    
    const places = peopleData.map( customer => {
      return {
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [customer.addresslng, customer.addresslat]},
        "properties": {
          customer: customer
        }
      };
    });

    try {
      cluster.load(places);
      return cluster;
    }
    catch(e) {
      console.debug('failed to create cluster', e);
    }
  }
  
  getMarkers(cluster, region) {
    const padding = 0;
    return cluster.getClusters([
      region.longitude - (region.longitudeDelta * (0.5 + padding)),
      region.latitude - (region.latitudeDelta * (0.5 + padding)),
      region.longitude + (region.longitudeDelta * (0.5 + padding)),
      region.latitude + (region.latitudeDelta * (0.5 + padding)),
    ], this.getZoomLevel());
  }
  
  getZoomLevel(region = this.state.region) {
    // http://stackoverflow.com/a/6055653
    const angle = region.longitudeDelta;

    // 0.95 for finetuning zoomlevel grouping
    return Math.round(Math.log(360 / angle) / Math.LN2);
  }
  
  componentWillReceiveProps(nextProps) {
    const cluster = this.createCluster(nextProps.screenProps);
    const markers = this.getMarkers(cluster, this.state.region);
    
    this.setState({
      cluster: cluster,
      markers: markers
    });
  }
  
  onRegionChange(region) {
    if (this._regionChangeTimer !== null) {
      clearTimeout(this._regionChangeTimer);
    }
    this._regionChangeTimer = setTimeout(() => {
      this.setState({ 
        region: region,
      });     
      this._regionChangeTimer = null;
    }, 150);
  }
  
  componentDidUpdate(prevProps, prevState) {
    if (!isEqual(prevState.region, this.state.region)) {     
      this.setState({
        markers: this.getMarkers(this.state.cluster, this.state.region)        
      });
    }
  }
    
  renderMarkers() {
    return this.state.markers.map( (marker, i) => {
     
      let title = null;
      if (marker.properties.hasOwnProperty('customer')) {
        title = marker.properties.customer.firstname.concat(' ', marker.properties.customer.lastname);
      }
      
      return (
        <MapView.Marker
          key={i}
          coordinate={{
            latitude: marker.geometry.coordinates[1],
            longitude: marker.geometry.coordinates[0],
          }}
          // calloutOffset={{ x: -8, y: 28 }}
          // calloutAnchor={{ x: 0.5, y: 0.4 }}
          title={title}
          // description="Lorem ipsum dolor sit amet, cons"
        >
          <MapClusterMarker {...marker} />
          <MapView.Callout tooltip />
        </MapView.Marker>
      );
    })
  }
  
  render() {    
    return (
      <View style={styles.container}>
        <MapView
          style={styles.map}
          region={this.state.region}
          onRegionChange={this.onRegionChange}
        >
        {this.renderMarkers()}
        </MapView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.Colours.cardItemBackground_White,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

// upper left 31.832145, -86.002448
// upper right 31.832260, -85.939092
// bottom left 31.785136, -86.002856
// bottom right 31.786294, -85.934051