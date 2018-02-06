// @flow
'use strict';
import PropTypes from 'prop-types';
import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ART,
  Dimensions,
} from 'react-native';
import Moment from 'moment';
import { default as Theme } from '../../lib/theme';

const {
  Surface,
  Group,
  Rectangle,
  ClippingRectangle,
  LinearGradient,
  Shape,
  Line,
} = ART;

import AnimShape from '../art/anim-shape';

import * as scale from 'd3-scale';
import * as shape from 'd3-shape';
import * as format from 'd3-format';
import * as axis from 'd3-axis';
import * as d3array from 'd3-array';

const d3 = {
  scale,
  shape,
  format,
  axis,
  array: d3array
};

import {
    scaleBand,
    scaleLinear
} from 'd3-scale';

type Props = {
  height: number,
  width: number,
  color: any,
  data: any
};

const AnimationDurationMs = 250;

const graphHeight = ((Dimensions.get('window').width / 2) / 11 * 9) / 20 * 17; // graph height is calculated by:
                                                                   // 1. <simpleTile> gridHeight (device width / 2)
                                                                   // 2. <simpleTile> flex view 9/11th height after Icon/Label view
                                                                   // 3. Graph 18/20 height excluding x-axis view
const graphCanvasHeightOffset = 0; // add some padding to the top of the graph to allow top values to show without being cut of by the <view>
const graphWidth = Dimensions.get('window').width / 12 * 7;

class AreaSpline extends React.Component {

  static propTypes = {
    pointColour: PropTypes.string,
    lineColour: PropTypes.string,
    areaColour: PropTypes.string,
    labelColour: PropTypes.string,
    xField: PropTypes.string,
    yField: PropTypes.string,
  }

  static defaultProps = {
    pointColour: '#000',
    lineColour: '#000',
    areaColour: '#333',
    labelColour: '#c4c4c4',
  }

  constructor(props: Props) {
    super(props);
    this._createArea = this._createArea.bind(this);
    this._Xvalue = this._Xvalue.bind(this);
    this._Yvalue = this._Yvalue.bind(this);
    this._label = this._label.bind(this);
  }

  createScaleX(start, end, width) {
    return d3.scale.scaleLinear()
    .domain([start, end])
    .range([0, width]);
  }

  createScaleY(minY, maxY, height) {
    return d3.scale.scaleLinear()
    .domain([minY, maxY]).nice()
    // We invert our range so it outputs using the axis that React uses.
    .range([height, 0]);
  }

  insertMissingDates(start,end, data ){
      for (let index = 0; index < data.length; index++) {

        if(data[index].x != start){
          let missingX = {x: start, y: 0}
          data.splice(index,0,missingX)
          if(start == end){
            break;
          }
        }
        start++;

      }

      return data;
  }

  _Yvalue(item, index, scaleY) {
    return scaleY(item[this.props.yField]) + graphCanvasHeightOffset;
  }

  _Xvalue(item, index, scaleX) {
    return scaleX(index+1);
  }

  //TODO: expose this methods as part of the AreaSpline interface.
  _label(item, index) { return item.name; }

  // method that transforms data into a svg path (should be exposed as part of the AreaSpline interface)
  _createArea(scaleX, scaleY, height) {
    let that = this;
    let area = d3.shape.area()
        .x(function(d, index) { return that._Xvalue(d, index, scaleX); })
        .y0(height)
        .y1(function(d, index) { return that._Yvalue(d, index, scaleY); })
        .curve(d3.shape.curveCardinal)
        (this.props.data)

    return { path : area };
  }
  
  _convertToFriendlyDate(value, groupBy, year) {
    // value: day of year, week of year, month of year, or year
    // groupBy: Day, Week, Month, or Year
    
    //return value;
    
    let label = value;
    let date;
    
    switch (groupBy) {
      case 'DAY':
        date = new Date(year, 0);
        label = new Date(date.setDate(value)).toLocaleDateString('en-GB').substring(0, 5);
        break;
      case 'WEEK':
        value = value * 7;
        date = new Date(year, 0);
        label = new Date(date.setDate(value)).toLocaleDateString('en-GB').substring(0, 5);
        break;
      case 'MONTH':
        value = value - 1;
        label = new Date(year, value).toLocaleDateString('en-GB').substring(0, 5);
        break;
      case 'YEAR':
        break;
    }
    
    return label;
    
  }
  
  _numDaysOfYear(year) {
    return this._isLeapYear(year) ? 366 : 365;
  }
  
  _isLeapYear(year) {
    return year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0);
  }

  renderValue(value, d3f) {
    return (
      d3f(value)
    );
  }

  render() {
    const x = 0;
    const y = 0;
    let { data, xField, yField } = this.props;
    let isSingleValue = false; // set to true if there's only one x-axis value
    let loops = 0;
    let isSingleYear = true; // set to false if date range crosses a year
    
    const d3f = d3.format.format('$.3s');

    let startDateRange = new Date(this.props.startDate);
    let momentStartDateRange = new Moment(startDateRange);
    let startDateYear = momentStartDateRange.year();

    let endDateRange = new Date(this.props.endDate);
    let momentEndDateRange = new Moment(endDateRange);
    
    //data.splice(5,1); // Removing second index for testing
    if (data.length == 1 && !momentEndDateRange.isAfter(momentStartDateRange)) {
      isSingleValue = true;
      data[1] = data[0];
      data[1].x = data[1].x + 1;
    }
    else if (data.length > 0 ) {

      switch (this.props.groupBy) {
        case 'DAY':
          let startDayOfYear = momentStartDateRange.add(1, 'days').dayOfYear();
          let endDayOfYear = momentEndDateRange.add(1, 'days').dayOfYear();
          
          let startNumOfDaysInYear = this._numDaysOfYear(startDateYear); // determine number of days in the year for start date
          
          if (startDayOfYear > endDayOfYear) {
            // date range crosses the end of the year -- determine number of days to display
            isSingleYear = true;
            
            // calculate number of loops (number of days in prev year + number of days in curr year)
            let startYearNumOfDays = startNumOfDaysInYear - startDayOfYear;
            loops = endDayOfYear + startYearNumOfDays;
          }
          else {
            loops = endDayOfYear - startDayOfYear;
          }
          
          for (let index = 0; index <= loops; index++) { // <= includes current day so number of loops will be +1
            if (typeof data[index] === 'undefined') {
              // push missing data onto end of array
              let missingX = {x: startDayOfYear, y: 0}
              data.push(missingX)
            }
            else if (data[index].x != startDayOfYear) {
              // splice missing data at beginning or middle of array
              let missingX = {x: startDayOfYear, y: 0}
              console.log(missingX);
              data.splice(index, 0, missingX);
            }
            startDayOfYear++;
            if (startDayOfYear > startNumOfDaysInYear) {
              startDayOfYear = 1; // cycle to the start of the next year (ie. crossing from Dec 31 to Jan 1)
            }
          }
          break;
        case 'WEEK':
          let startWeekOfYear = momentStartDateRange.add(1, 'days').week();
          let endWeekOfYear = momentEndDateRange.add(1, 'days').week();
          loops = endWeekOfYear - startWeekOfYear;

          for (let index = 0; index <= loops; index++) {
            if (typeof data[index] === 'undefined') {
              // push missing data onto end of array
              let missingX = {x: startWeekOfYear, y: 0}
              data.push(missingX)
            }
            if(data[index].x != startWeekOfYear) {
              // splice missing data at beginning or middle of array
              let missingX = {x: startWeekOfYear, y: 0}
              data.splice(index, 0, missingX);
              if(startWeekOfYear == endWeekOfYear) {
                break;
              }
            }
            startWeekOfYear++;
          }
          break;
        case 'MONTH':
          let startMonthOfYear = momentStartDateRange.add(1, 'days').add(1, 'months').month();
          let endMonthOfYear = momentEndDateRange.add(1, 'months').month();
          loops = endMonthOfYear - startMonthOfYear;

          for (let index = 0; index <= loops; index++) {
            if (typeof data[index] === 'undefined') {
              // push missing data onto end of array
              let missingX = {x: startMonthOfYear, y: 0}
              data.push(missingX)
            }
            if(data[index].x != startMonthOfYear) {
              // splice missing data at beginning or middle of array
              let missingX = {x: startMonthOfYear, y: 0}
              data.splice(index, 0, missingX);
              if(startMonthOfYear == endMonthOfYear){
                break;
              }
            }
            startMonthOfYear++;
          }
          break;
        case 'YEAR':
          let startYear = momentStartDateRange.add(1, 'days').add(1, 'months').year();
          let endYear = momentEndDateRange.add(1, 'months').year();
          loops = endYear - startYear;

          for (let index = 0; index <= loops; index++) {
            if (typeof data[index] === 'undefined') {
              // push missing data onto end of array
              let missingX = {x: startYear, y: 0}
              data.push(missingX)
            }
            if(data[index].x != startYear) {
              // splice missing data at beginning or middle of array
              let missingX = {x: startYear, y: 0}
              data.splice(index, 0, missingX);
              if(startYear == endYear){
                break;
              }
            }
            startYear++;
          }
          break;
      }
    }
   
    const lastDatum = data[data.length - 1];
    
    // Create our x-scale.
    const scaleX = this.createScaleX(
      1,
      data.length,
      graphWidth
    );
    
    // Collect all y values.
    const allYValues = data.reduce((all, datum) => {
      all.push(datum[yField]);
      return all;
    }, []);
    
    // Get the min and max y value.
    let extentY = d3.array.extent(allYValues);
    
    // y-axis label values -- set the top y-axis value
    if (extentY[1] == 0) {
      extentY[1] = 1; // if all values are 0, set 1 as the max Y value
    }
    else if (isSingleValue == true) {
      extentY[1] = extentY[1] * 1.25; // set y-axis max value to value 25% higher than the actual max
      extentY[0] = 0; // min and max are the same in this case (both will take on the single value), set the min to 0
    }
    else if (extentY[0] == extentY[1]) { 
      extentY[0] = 0; // if both min and max are the same, set the min to 0
    }
    else {
      extentY[1] = extentY[1] * 1.05; // set y-axis max value to value 1% higher than the actual max
    }
    
    const scaleY = this.createScaleY(extentY[0], extentY[1], graphHeight);
  
    const ticks = data.map( (datum, index) => {
      return {
        x: scaleX(index+1),
        y: scaleY(datum[yField]) + graphCanvasHeightOffset,
        datum,
      };
    });
    
    // set y-axis label values
    let yMax = Math.round(extentY[1]);
    let yAxisValues = [];
    yAxisValues[0] = 0;
    yAxisValues[1] = Math.round(yMax / 5 * 1);
    yAxisValues[2] = Math.round(yMax / 5 * 2);
    yAxisValues[3] = Math.round(yMax / 5 * 3);
    yAxisValues[4] = Math.round(yMax / 5 * 4);
    yAxisValues[5] = yMax;

    let yCoordMax = graphHeight - scaleY(extentY[1]); // calculate y-coordinate of top value to use for placing y-axis lines
    if (yCoordMax > (graphHeight - 10)) {
      yCoordMax = yCoordMax - 10;
    }
    
    return (

        <View style={[{ flex: 1, flexDirection: 'row' }, this.props.style]}>
        { /* Graph container */ }
        
          <View style={{ flex: 2, flexDirection: 'column' }}>
          { /* Graph Left -  full height of graph - y-axis labels */ }
          
            { /* Right-aligned y-axis labels */ }
            <View style={{ flex: 2, flexDirection: 'column' }}>
              <View key={'ticksY'} style={{ flex: 1, flexDirection: 'column', height: graphHeight, width: Dimensions.get('window').width / 12 * 2 }}>
                {yAxisValues.map((tick, index) => {
                  /* y-axis labels */
                  let value = tick;
                  
                  const key = 'ty-'.concat(index.toString());
                  return (
                    <View key={key} style={[{ position: 'absolute', width: Dimensions.get('window').width / 12 * 2, top: (graphHeight - (yCoordMax / 5 * index) - 7 + graphCanvasHeightOffset) }]}>
                      <Text style={{ fontSize: 10, paddingRight: 3, textAlign: 'right'}}>
                        {this.renderValue(value, d3f)}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>

          <View style={{ flex: 10, flexDirection: 'column' }}>
          { /* Graph Right - graph, x-axis labels */ }
          
            <View style={{ flex: 17, flexDirection: 'row' }} >
            { /* Top row 1/2 of Graph Right - graph, spacer columns */ }
                
                { /* Left spacer column of graph with y-axis lines */ }
                <View style={{ flex: 1, flexDirection: 'column' }}>
                  <Surface width={Dimensions.get('window').width / 12 * 1} height={graphHeight}> 
                    <Group x={0} y={0}>
                      {yAxisValues.map((tick, index) => {
                        // y-axis horizonal lines
                        let value = tick;
                        let yCoord = graphHeight - (yCoordMax / 5 * index);
                        let columnWidth = Dimensions.get('window').width / 12 * 1;
    
                        if (yCoord < 1) {
                          yCoord = 1;
                        }
                        if (yCoord >= graphHeight) {
                          yCoord = graphHeight - 1;
                        }
          
                        return (
                          <Shape
                            key={index}
                            d={"M1,"+yCoord+"L"+columnWidth+","+yCoord}
                            stroke={Theme.Colours.darkBackground} 
                            strokeWidth={1}     
                           />
                        );
                      })}
                    </Group>
                  </Surface>
                </View>
                
                { /* The graph itself */ }
                <View style={{ flex: 7, flexDirection: 'column' }}>
                
                  { /* Curved line graph */ }
                  <Surface width={graphWidth} height={graphHeight}> 
                    <Group x={0} y={0}>
                    
                      {yAxisValues.map((tick, index) => {
                        // draw y-axis horizonal lines
                        let value = tick;
                        let tickStyles = {};
                        let yCoord = graphHeight - (yCoordMax / 5 * index);
                        
                        const key = 's-'.concat(index.toString());
                        return (
                          <Shape
                            key={key}
                            d={"M1,"+yCoord+"L"+graphWidth+","+yCoord}
                            stroke={Theme.Colours.darkBackground} 
                            strokeWidth={1}     
                           />
                        );
                      })}
                      
                      {/* draw the graph */}
                      <AnimShape
                        color={this.props.areaColour}
                        strokeWidth={2.2}
                        fill={this.props.areaColour}
                        isSingleValue={isSingleValue}
                        d={() => this._createArea(scaleX, scaleY, graphHeight)}
                      />
                      
                    </Group>
                  </Surface>
                  
                  { /* The dots */ }
                  <View key={'ticksYDot'}  style={{ flex: 1, flexDirection: 'row', width: graphWidth, height: graphHeight, position: 'absolute' }}>
                    {ticks.map((tick, index) => {
                      
                      let leftCoord = tick.x + 1;
                      if (isSingleValue) {
                        leftCoord = (graphWidth / 2) + 1;
                      }
                    
                      return (
                      <View
                        key={index}
                        style={[styles.ticksYDot, {
                          left: leftCoord,
                          top: tick.y + 2,
                        }]}
                      />
                      );
                  
                    })}
                  </View>
                </View>
                
                { /* Right spacer column of graph with y-axis lines */ }
                <View style={{ flex: 1, flexDirection: 'column' }}>
                  <Surface width={Dimensions.get('window').width / 12 * 1} height={graphHeight}> 
                    <Group x={0} y={0}>
                      {yAxisValues.map((tick, index) => {
                        // y-axis horizonal lines
                        let value = tick;
                        let yCoord = graphHeight - (yCoordMax / 5 * index);
                        let columnWidth = Dimensions.get('window').width / 12 * 1;
    
                        if (yCoord < 1) {
                          yCoord = 1;
                        }
                        if (yCoord >= graphHeight) {
                          yCoord = graphHeight - 1;
                        }
    
                        return (
                          <Shape
                            key={index}
                            d={"M1,"+yCoord+"L"+columnWidth+","+yCoord}
                            stroke={Theme.Colours.darkBackground} 
                            strokeWidth={1}     
                           />
                        );
                      })}
                    </Group>
                  </Surface>
                </View>
                
                { /* Right spacer column */ }
                <View style={{ flex: 1, flexDirection: 'column' }}>
                </View>
                
            </View>
            
            { /* Bottom row 2/2 of Graph Right - y-axis labels, spacer columns */ }
            <View style={{ flex: 3, flexDirection: 'row' }}>
            
              { /* Left spacer column */ }
              <View style={{ flex: 1, flexDirection: 'column' }}>
              </View>
              
              { /* x-axis labels */ }
              <View key={'ticksX'} style={{ flex: 7, flexDirection: 'column' }}>
                {ticks.map((tick, index) => {
                  const tickStyles = {};
                  
                  let leftCoord = tick.x - 12;
                  if (isSingleValue) {
                    // condition if there's only one value on the graph
                    leftCoord = (graphWidth / 2) - 12;
                  }
                  
                  if (!isSingleYear) {
                    // condition if date range crosses a year
                    //startDateYear
                  }
      
                  const key = 'tx-'.concat(index.toString());
                  return (
                    <View key={key} style={[{ left: leftCoord, top: 6, position: 'absolute' }]}>
                      <Text style={{ fontSize: 8, transform: [{ rotate: '-60deg'}] }}>
                        {this._convertToFriendlyDate(tick.datum[this.props.xField], this.props.groupBy, startDateYear)}
                      </Text>
                    </View>
                  );
                })}
              </View>
            
              { /* Right spacer column */ }
              <View style={{ flex: 2, flexDirection: 'column' }}>
              </View>
              
            </View>
            
          </View>
           
      </View>
    );
  }
}

export default AreaSpline;

const styles = StyleSheet.create({
  container: {
  },

  tickLabelX: {
    position: 'absolute',
    bottom: 0,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 5,
    color: "#000"
  },

  ticksYContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
  },

  tickLabelY: {
    position: 'absolute',
    left: 0,
    backgroundColor: 'transparent',
  },

  tickLabelYText: {
    fontSize: 12,
    textAlign: 'center',
  },

  ticksYDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    backgroundColor: '#388E3C',
    borderRadius: 100,
    marginLeft: -4,
    marginTop: -4
  },
});
