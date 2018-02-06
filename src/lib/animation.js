import { LayoutAnimation } from 'react-native';

const Animation = {
  spring: {
    duration: 450,
    update: {
      type: LayoutAnimation.Types.spring,
      springDamping: 0.4,
    }
  },
  slideSlow: LayoutAnimation.create(
    350, LayoutAnimation.Types.easeInEaseOut, LayoutAnimation.Properties.opacity
  ),
  slideFast: LayoutAnimation.create(
    250, LayoutAnimation.Types.easeOut, LayoutAnimation.Properties.opacity
  ),
  scaleIOS: LayoutAnimation.create(
    220, LayoutAnimation.Types.easeInEaseOut, LayoutAnimation.Properties.scaleXY
  ),
  scale: LayoutAnimation.create(
    350, LayoutAnimation.Types.easeInEaseOut, LayoutAnimation.Properties.scaleXY
  ),
  scaleExpandedIcons: LayoutAnimation.create(
    250, LayoutAnimation.Types.easeInEaseOut, LayoutAnimation.Properties.scaleXY
  ),
};

export {
    Animation
};