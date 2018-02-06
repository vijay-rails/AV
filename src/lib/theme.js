import { StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { createIconSetFromIcoMoon } from 'react-native-vector-icons';
import icoMoonConfig from '../res/fonts/selection.json';
import { Animation } from './animation';
import {
  Platform
} from 'react-native';

// const Logo = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48c3ZnIHZlcnNpb249IjEuMSIgaWQ9ImE3Y2ZjYTkwLWRhMjctNDUxZi1iYTMzLTk0ZWMzODM1MGMwYiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeD0iMHB4IiB5PSIwcHgiIHZpZXdCb3g9IjAgMCAxNzkgMjMiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDE3OSAyMzsiIHhtbDpzcGFjZT0icHJlc2VydmUiPjxwYXRoIGZpbGw9IiM0QzRDNEMiIGQ9Ik03LjEsMS4xTDAsMjIuNmg0LjlsMS43LTUuNmg2LjJsMS4zLDUuNmg0LjhMMTMsMS4xSDcuMXogTTcuMywxMy42bDEuNC00LjZDOS4xLDcuNyw5LjQsNiw5LjgsNC43aDAuMWMwLjMsMS4zLDAuNywzLDEsNC4ybDEuMiw0LjZMNy4zLDEzLjZ6IE0yOS43LDE0LjNjLTAuMSwzLjEtMS40LDUtMyw1Yy0xLjIsMC0xLjctMC44LTEuOS0xLjhjLTAuMS0wLjctMC4xLTEuMy0wLjEtMkwyNSw3aC00LjZsLTAuMiw4LjdjLTAuMSwxLDAsMS45LDAuMSwyLjljMC41LDMsMi4yLDQuNCw0LjcsNC40YzIsMCwzLjktMS4xLDQuOS0yLjlIMzBsMC4xLDIuNWg0LjFjMC0xLjQsMC0zLjEsMC01LjFMMzQuNSw3aC00LjZMMjkuNywxNC4zeiBNNTEuOCwwaC00LjZMNDcsN2MtMC43LTAuMi0xLjQtMC40LTIuMi0wLjNjLTUuOSwwLTksNS04LjIsMTAuNGMwLjYsMy44LDMuMSw1LjksNS44LDUuOWMyLDAsMy44LTEuMSw0LjctMi45aDAuMWwwLjIsMi41aDQuMmMtMC4yLTItMC4zLTQtMC4yLTYuMUw1MS44LDB6IE00Ni44LDE0LjljLTAuMSwzLTEuNSw0LjQtMi44LDQuNHMtMi4zLTEtMi42LTIuOWMtMC41LTMsMS02LjIsMy43LTYuMmMwLjcsMCwxLjMsMC4yLDEuOSwwLjVMNDYuOCwxNC45eiBNNTQuMiwyMi42aDQuNkw1OS4zLDdoLTQuNkw1NC4yLDIyLjZ6IE01Ni45LDAuMmMtMS4yLTAuMS0yLjIsMC45LTIuMywyLjFjMCwwLjIsMCwwLjQsMCwwLjVjMC4yLDEuMywxLjMsMi4yLDIuNiwyLjJjMS4yLDAuMSwyLjItMC43LDIuMy0xLjljMC0wLjIsMC0wLjUsMC0wLjdDNTkuMywxLjIsNTguMiwwLjIsNTYuOSwwLjJ6IE03NSwxMS40Yy0wLjUtMi45LTMtNC43LTYuMi00LjdjLTUuNywwLTguMyw0LjktNy41LDkuN2MwLjcsNC4xLDMuNCw2LjYsNy44LDYuNmMxLjksMCwzLjktMC40LDUuNi0xLjJsLTAuOC0zLjNjLTEuMywwLjctMi44LDEtNC4yLDFjLTEuMiwwLjEtMi4zLTAuNC0zLjItMS4yYy0wLjQtMC41LTAuNi0xLTAuNy0xLjZDNzIsMTYuOCw3NS43LDE1LjMsNzUsMTEuNHogTTY1LjYsMTMuM2MwLTEuOCwxLjMtMy4yLDMuMS0zLjNjMCwwLDAuMSwwLDAuMSwwYzAuOS0wLjEsMS43LDAuNSwxLjksMS4zQzcwLjksMTIuOCw2OS4yLDEzLjMsNjUuNiwxMy4zTDY1LjYsMTMuM3ogTTg2LjYsNi43Yy0yLjEtMC4xLTQsMS4xLTUsMi45aC0wLjFMODEuNCw3aC00LjFjMCwxLjQsMCwzLjEsMCw1LjFMNzcsMjIuNmg0LjZsMC4yLTYuOWMwLjEtMy40LDEuNi01LjMsMy01LjNjMS4yLDAsMS43LDAuOCwxLjgsMS45YzAuMSwwLjYsMC4yLDEuMiwwLjIsMS44bC0wLjMsOC42aDQuNmwwLjMtOS4xYzAtMC45LTAuMS0xLjgtMC4yLTIuN0M5MC44LDguMyw4OS4yLDYuNyw4Ni42LDYuN3ogTTEwMiwxOS4zYy0xLjgsMC0zLjQtMS40LTMuNi0zLjJjLTAuNS0yLjksMS4xLTUuNyw0LjQtNS43YzAuNywwLDEuNSwwLjEsMi4yLDAuNGwwLjYtMy41Yy0xLTAuNC0yLjEtMC42LTMuMi0wLjVjLTUuOSwwLTkuNSw0LjMtOC42LDkuOWMwLjUsMy44LDMuOCw2LjYsNy42LDYuNGMxLjUsMC4xLDMtMC4yLDQuMy0wLjhsLTAuNi0zLjVDMTA0LjEsMTkuMSwxMDMsMTkuMywxMDIsMTkuM3ogTTEyMC4xLDExLjRjLTAuNS0yLjktMy00LjctNi4yLTQuN2MtNS43LDAtOC4zLDQuOS03LjYsOS43YzAuNiw0LDMuMyw2LjYsNy44LDYuNmMxLjksMCwzLjktMC40LDUuNi0xLjJsLTAuOC0zLjNjLTEuMywwLjctMi43LDEtNC4yLDFjLTEuMiwwLjEtMi4zLTAuNC0zLjItMS4yYy0wLjQtMC41LTAuNi0xLTAuNy0xLjZDMTE3LjEsMTYuOCwxMjAuOCwxNS4zLDEyMC4xLDExLjRMMTIwLjEsMTEuNHogTTExMC44LDEzLjNjMC0xLjgsMS4zLTMuMiwzLjEtMy4zYzAsMCwwLjEsMCwwLjEsMGMwLjktMC4xLDEuNywwLjUsMS45LDEuM0MxMTYuMSwxMi44LDExNC4zLDEzLjMsMTEwLjgsMTMuM0wxMTAuOCwxMy4zeiBNMTMwLjIsMTQuNmMtMC42LDEuNy0xLjEsMy40LTEuNSw1LjJoLTAuMWMtMC4zLTEuNC0wLjYtMi42LTEuMi00LjlsLTMuNy0xMy44aC0yLjdsNi4xLDIxLjVoMi45bDcuOS0yMS41aC0yLjlMMTMwLjIsMTQuNnogTTE0MC41LDEuMWMtMC44LTAuMS0xLjUsMC42LTEuNiwxLjRjMCwwLjEsMCwwLjMsMCwwLjRjMC4xLDAuOSwwLjksMS42LDEuOCwxLjdjMC44LDAsMS41LTAuNiwxLjUtMS40YzAtMC4xLDAtMC4zLDAtMC40QzE0Mi4yLDEuOSwxNDEuNCwxLjIsMTQwLjUsMS4xeiBNMTM4LjcsMjIuN2gyLjZsMC41LTE1LjRoLTIuNkwxMzguNywyMi43eiBNMTU2LjUsMTAuOGMtMC40LTIuMi0yLjItNC01LjItNGMtNSwwLTcuNiw1LjMtNi45LDkuOWMwLjUsMy40LDIuOCw2LjIsNi45LDYuMmMxLjcsMCwzLjQtMC40LDQuOS0xLjJsLTAuNy0yYy0xLjIsMC43LTIuNiwxLjEtNCwxLjFjLTEuNSwwLjEtMy0wLjctMy44LTIuMWMtMC41LTAuOS0wLjctMS45LTAuOC0yLjlDMTUyLjcsMTYsMTU3LjEsMTQuOSwxNTYuNSwxMC44TDE1Ni41LDEwLjh6IE0xNDcsMTMuOGMwLjItMi40LDEuOC00LjksNC4zLTQuOWMxLjMtMC4xLDIuNCwwLjcsMi43LDJDMTU0LjMsMTMuMywxNTEuMSwxMy44LDE0NywxMy44TDE0NywxMy44eiBNMTc2LjMsNy4ybC0yLjgsOC45Yy0wLjQsMS41LTAuNiwyLjYtMC45LDMuOWgtMC4xYy0wLjItMS4zLTAuNS0yLjctMC45LTRsLTIuNC04LjhoLTIuM2wtMy4yLDljLTAuNCwxLjItMC44LDIuNS0xLjEsMy44aC0wLjFjLTAuMi0xLjQtMC40LTIuOC0wLjctNC4xbC0xLjktOC43aC0yLjZsMy45LDE1LjRoMi41bDMuMS04LjRjMC41LTEuNCwwLjctMi42LDEuMS00aDAuMWMwLjIsMS40LDAuNSwyLjcsMC45LDQuMWwyLjQsOC40aDIuNUwxNzksNy4yTDE3Ni4zLDcuMnoiLz48L3N2Zz4=";
const Logo = "data:image/png;base64,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";
const CustomIcon = createIconSetFromIcoMoon(icoMoonConfig); 

const Brand = {
  primary: '#2196F3',
  primaryLight: '#6EC6FF',
  primaryDark: '#0069C0',
  primaryText: '#fff',
  
  // deprecated
  secondary: '#f1f1f1',
  tertiary: '#282C35',
  quaternary: '#9B9B9B',
  quinary: '#fff',
  senary: '#fff'
};

const Colours = {
  // Brand
  primary: '#2196F3',
  primaryLight: '#6EC6FF',
  primaryDark: '#0069C0',
  primaryText: '#fff',

  border: '#C4C4C4',
  darkBackground: '#F4F4F4',

  // Common 
  black: '#000000',
  white: '#FFFFFF',
  greyLight: '#C4C4C4',
  blue: '#0288D1',
  blueDark: '#303F9F',
  green: '#689F38',
  greenYellow: '#AFB42B',
  greenTurquoise: '#00796B',
  yellow: '#FBC02D',

  // Chart 
  chartColor1_Green: '#388E3C',
  chartColor2_Purple: '#7B1FA2',
  chartColor3_TurquoiseGreen: '#0097A7',
  chartColor4_Blue: '#1976D2',
  chartColor5_Pink: '#C2185B',
  chartColor6_Purple: '#512DA8',

  // Profile 
  profileColor1: '#FFE082',
  profileColor2: '#FFCC80',
  profileColor3: '#EF9A9A',
  profileColor4: '#F48FB1',
  profileColor5: '#FFF59D',
  profileColor6: '#C5E1A5',
  profileColor7: '#A5D6A7',
  profileColor8: '#80CBC4',
  profileColor9: '#81D4FA',
  profileColor10: '#9FA8DA',
  profileColor11: '#B39DDB',
  profileColor12: '#80DEEA',
  profileColor13: '#E6EE9C',
  profileColor14: '#CE93D8',
  profileColor15: '#90CAF9',

  // Card  
  cardBackground_Grey: '#4C4C4C', // null
  cardItemBackground_White: '#F4F4F4' , // darkBackground

  // Unknown colors
  uk1: '#333', // black
  uk2: '#999', // border
  uk3: '#666', // border
  uk4: '#CCC', // greyLight
  uk5: '#555', // border

  primaryHeader: {
    backgroundColor: Brand.primary,
    color: Brand.primaryText
  },
  backgrounds: {
    primary: '#f4f4f4',
    primaryText: '#000',
    
    dark: '#282C35',
    darkText: '#fff',
    
    light: '#fff',
    lightText: '#000',
    
    // deprecated
    secondary: Brand.secondary,
    tertiary: Brand.quarternary,
    quaternary: Brand.quinary,
    quinary: 'white',
  },
  buttons: {
    primary: Brand.primary,
    secondary: Brand.secondary
  }, 
  tabs: {
    active: Brand.primaryLight,
    inactive: '#fff',
  }
};

// const Rainbow = [
//   '#d32f2f', '#c2185b', '#7b1fa2',
//   '#512da8', '#303f9f', '#1976d2', 
//   '#0288d1', '#0097a7', '#00796b', 
//   '#388e3c', '#689f38', '#afb42b', 
//   '#fbc02d', '#ffa000', '#f57c00', 
//   '#e64a19'
// ];

const Rainbow = [
  Colours.profileColor1, 
  Colours.profileColor2, 
  Colours.profileColor3,
  Colours.profileColor4, 
  Colours.profileColor5,
  Colours.profileColor6,
  Colours.profileColor7,
  Colours.profileColor8,
  Colours.profileColor9,
  Colours.profileColor10,
  Colours.profileColor11,
  Colours.profileColor12,
  Colours.profileColor13,
  Colours.profileColor14,
  Colours.profileColor15,
];

// Default font families
const PrimaryFontRegular = 'Roboto-Regular';
const PrimaryFontBolded = 'Roboto-Bold';

const Fonts = {
  // HEADINGS
  h1: 64,
  h2: 36,
  h3: 28,
  h4: 24,
  h5: 20,
  h6: 18,
  // FONTS for textstyle
  fontSmall: 12,
  fontMedium: 14,
  fontLarge: 16,
  // LEADING/LINE HEIGHT 
  leadLarge1: 75,
  leadLarge2: 42,
  leadLarge3: 33,
  leadMedium1: 28,
  leadMedium2: 24,
  leadMedium3: 21,
  leadSmall1: 19,
  leadSmall2: 16,
  leadSmall3: 14,
};

const PlatformStyles = {
  height: 40,
  lineHeight: 20,
  paddingLeft: 2,
  paddingTop: 15
};

const Styles = StyleSheet.create({
  elevation: {
	shadowColor: Colours.black,
	shadowOffset: {
	  width: 0,
	  height: 2
    },
	shadowRadius: 3,
    shadowOpacity: 0.75,
    zIndex: 10
  },
  overlay: {
    position: 'absolute',
    top: 0, right: 0, bottom: 0, left: 0,
  },
  center: {
    alignItems: 'center', 
    justifyContent: 'center'
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: Colours.backgrounds.primary
  },
  /***************  FLEX STYLES ***************/
  f1: { flex: 1 }, f2: { flex: 2 }, f3: { flex: 3 }, f4: { flex: 4 }, f5: { flex: 5 },
  f6: { flex: 6 }, f7: { flex: 7 }, f8: { flex: 8 }, f9: { flex: 9 }, f10: { flex: 10 },
  row: { flexDirection: 'row' }, column: { flexDirection: 'column' },
  rowCenter: { alignItems: 'center' }, columnCenter: { justifyContent: 'center' },

  /***************  TEXT STYLES ***************/
  // Headings 
  h1: {
    fontSize: Fonts.h1
  },
  h2: {
    fontSize: Fonts.h2
  },
  h3: {
    fontSize: Fonts.h3
  },
  h4: {
    fontSize: Fonts.h4
  },
  h5: {
    fontSize: Fonts.h5
  },
  h6: {
    fontSize: Fonts.h6
  },
  // Text
  textSmall: {
    fontSize: Fonts.fontSmall,
    color: Colours.white
  },
  textMedium: {
    fontSize: Fonts.fontMedium,
    color: Colours.white
  },
  textLarge: {
    fontSize: Fonts.fontLarge, 
    color: Colours.white
  },
  // Leading / Line Height 
  leadLarge1: {
    lineHeight: Fonts.leadLarge1
  },
  leadLarge2: {
    lineHeight: Fonts.leadLarge2
  },
  leadLarge3: {
    lineHeight: Fonts.leadLarge3
  },
  leadMedium1: {
    lineHeight: Fonts.leadMedium1
  },
  leadMedium2: {
    lineHeight: Fonts.leadMedium2
  },
  leadMedium3: {
    lineHeight: Fonts.leadMedium3
  },
  leadSmall1: {
    lineHeight: Fonts.leadSmall1
  },
  leadSmall2: {
    lineHeight: Fonts.leadSmall2
  },
  leadSmall3: {
    lineHeight: Fonts.leadSmall3
  },

  /***************  LIST STYLES ***************/
  listItemTitle: {
    flex: 1,
    fontSize: Fonts.h5, 
    color: Colours.black
  },
  listItemLocation: {
    flex: 1,
    fontSize: Fonts.fontSmall,
    color: Colours.black
  },
  listItemIcons: {
    backgroundColor: 'transparent',
    color: Colours.cardBackground_Grey
  },
  // Search
  listSearchInput: {
    flexDirection: 'column',
    fontSize: Fonts.h6,
    margin: 0, padding: 0,
    color: Colours.white,
  },

  /***************  TABLE STYLES ***************/  
  tableHead: {
    fontSize: Fonts.fontSmall,
    fontFamily: PrimaryFontBolded,
    lineHeight: Fonts.leadSmall3, 
    paddingRight: 5,
    color: Colours.black,
    flex: 0.25,
  }
});

export default { 
  Animation,
  Logo,
  Icon,
  CustomIcon,
  Styles,
  Colours,
  Brand,
  Rainbow,
  Fonts,
  PrimaryFontBolded,
  PlatformStyles
};