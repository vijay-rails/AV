import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { WebView, UIManager, Platform, LayoutAnimation } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { Animation } from '../lib/animation';

const script = `
<script>
  window.location.hash = 1;
  var container = document.createElement("div");
  container.id = "container";
  while (document.body.firstChild) {
    container.appendChild(document.body.firstChild);
  }
  document.body.appendChild(container);
  document.title = container.clientHeight;
</script>
`;

const style = `
<style>
  body, html, #container {
    margin: 0;
    padding: 0;
    color: #fff;
  }
  #container {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
  }
</style>
`;

export default class AutoWebView extends Component {

  static propTypes = {
    html: PropTypes.string,
    style: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.number,
      PropTypes.array,
    ]),
  }
 
  state = {
    height: null
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.html !== this.props.html || nextState.height !== this.state.height) {
      return true;
    }
    return false;
  }

  onNavigationChange = (event) => {
    if (event.title) {
      const height = Number(event.title);
      if (!Number.isNaN(height)) {
        LayoutAnimation.configureNext(Animation.scale); 
        this.setState({
          height: Number(event.title) // convert to number
        });
      }
    }
  }

  render() {
    if (this.props.html.length <= 0 || this.state.height === 0) {
      return null;
    }
    return (
      <Animatable.View
        duragion={500}
        animation={'fadeInUp'}
        easing={'ease-in-out-cubic'}
      >
        <WebView
          source={{html: this.props.html + style + script}}
          javaScriptEnabled
          domStorageEnabled={false}
          dataDetectorTypes={'none'} // ios 
          bounces={false} // ios
          scrollEnabled={false} // ios
          style={[this.props.style, { height: this.state.height }]}
          onNavigationStateChange={this.onNavigationChange}
        />
      </Animatable.View>
    );
  }
}
