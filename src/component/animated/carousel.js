
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {
    ScrollView,
    View
} from 'react-native';

import { default as Theme } from '../../lib/theme';

export default class Carousel extends Component {

  static propTypes = {
    children: PropTypes.node,
  }

  state = {
    offset: 0,
  }

    /*
    renderDots = (width) => {
        const {
            children,
            color = '#ffa500',
            dimmedColor = '#d3d3d3',
            dotWidth = 10,
            dotHeight = 10
        } = this.props;

        let dots = [];

        const emptydot = {
            width: dotWidth,
            height: dotHeight,
            backgroundColor: dimmedColor,
            borderRadius: 15,
            alignSelf: 'center',
        }

        const filleddot = {
            width: dotWidth,
            height: dotHeight,
            backgroundColor: color,
            borderRadius: 15,
            alignSelf: 'center',
        }

        const renderDots = () => {
          return children.map( (child, i) => {
            return (
              <View style={ emptydot } key={ i }/>
            );
          }); 
        };
        
        for (var i=0; i<children.length; i++) {
            dots.push (
                <View style={ emptydot } key={ width * i }/>
            )
        }

        if (this.state.offset % width === 0) {
            dots.map((v) => {
                v.key == this.state.offset
                    ? dots[v.key / width]
                        = <View style={ filleddot } key={ v.key }/>
                    : null;
            })
        }

        return (
            <View style={{ flexDirection: 'row', alignSelf: 'center' }}>
                { dots }
            </View>
        )
    }
    */

    render() {
        const {
            backgroundColor = 'transparent',
            children,
            // showDots = false,
            showScroll = false,
        } = this.props;

        const renderPages = () => {
          return children.map( (child, i) => {
            return (
              <View style={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0 }} key={i}>
                {child[i]}
              </View>
            );
          }); 
        };

        return (
            <View style={{ flex: 1, flexDirection: 'column', backgroundColor: backgroundColor }}>
                <ScrollView
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={ showScroll }
                    onScroll={ (e)=>{
                        this.setState({offset: e.nativeEvent.contentOffset.x})
                    }}
                    style={{ }}>
                    { renderPages() }
                </ScrollView>
                {/* showDots ? this.renderDots() : null */}
            </View>
        )
    }
}