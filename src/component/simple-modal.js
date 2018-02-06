import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { 
  StyleSheet, View, Text, PixelRatio, TouchableOpacity
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/MaterialIcons';
import SimpleCard from './simple-card';
import { default as Theme } from '../lib/theme';

export default class SimpleModal extends Component {

  static propTypes = {
    children: PropTypes.node,
    style: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.number,
      PropTypes.array,
    ]),
    onClose: PropTypes.func,
    backgroundColour: PropTypes.string,
    textColour: PropTypes.string,
    icon: PropTypes.string,
    label: PropTypes.string,
    maxLabelFontSize: PropTypes.number, 
  }

  static defaultProps = {
    onClose: () => {},
    backgroundColour: Theme.Colours.white,
    textColour: Theme.Colours.black,
    icon: null,
    maxLabelFontSize: Theme.Fonts.fontMedium,
    label: ""
  }

  state = {
    labelWidth: 0
  }
    
  renderIcon() {
    const { textColour, icon } = this.props;
    if (icon === null) {
      return null;
    }
    
    return (
      <Icon name={icon} size={32} color={textColour}
        backgroundColor="transparent" 
        style={{ margin: 0, padding: 0 }} 
        iconStyle={{ marginRight: 0 }} 
      />
    );
  }
  
  renderLabel() {
    const { textColour, label, maxLabelFontSize } = this.props;
    
    if (label === null || label.length === 0) {
      return null;
    }
 
    let fontSize = (PixelRatio.getPixelSizeForLayoutSize(this.state.labelWidth) / label.length) / (PixelRatio.get() / 1.1);
    if (fontSize > maxLabelFontSize) {
      fontSize = maxLabelFontSize;
    }

    return (
      <View 
        style={[ Theme.Styles.f1 ]} 
        onLayout={ e => { this.setState({ labelWidth: e.nativeEvent.layout.width }); }}
      >
        <Text style={{ color: textColour, fontSize: fontSize, marginHorizontal: 5 }}>{label}</Text>
      </View>
    );
  }
  
  render() {
    const { textColour } = this.props;
    
    return (
      <View style={[Theme.Styles.overlay, { justifyContent: 'center' }]}>
        <TouchableOpacity 
          style={[Theme.Styles.overlay, styles.container, { padding: 20, flexDirection: 'column' }]}
          onPress={this.props.onClose}
          activeOpacity={0}
        />
        <Animatable.View animation={'fadeInUp'} duration={500} easing={'ease-in-out-expo'} >
          <SimpleCard style={{ padding: 10, backgroundColor: this.props.backgroundColour }} wrapperStyle={{ }}>
            <View style={[ Theme.Styles.column ]}>
              <View style={[ Theme.Styles.row ]}>
                <View style={[ Theme.Styles.f1, Theme.Styles.row, { alignItems: 'center' } ]}>
                  {this.renderIcon()}
                  {this.renderLabel()}
                </View>
                <View>
                  <Icon.Button name={'close'} size={24} color={textColour} borderRadius={11} onPress={this.props.onClose}
                    backgroundColor="transparent" 
                    style={{ margin: 0, padding: 0 }} 
                    iconStyle={{ marginRight: 0 }} 
                  />
                </View>
              </View>
              <View style={[ Theme.Styles.column ]}>
                {this.props.children}
              </View>
            </View>
          </SimpleCard>
        </Animatable.View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center'
  }
});