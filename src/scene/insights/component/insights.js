import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View
} from 'react-native';

import { DefaultNavigationOptions } from '../../../navigator/headers';
import HeaderTitle from '../../../navigator/header-title';
import AsyncDataListView from '../../../component/async-data-list-view';
import { default as Theme } from '../../../lib/theme'; 
import PersonInsight from './insights/person-insight';
import EmptyInsight from './insights/empty-insight';
import PersonBoughtAdmissionInsight from './insights/person-bought-admission-insight';
import PersonDonatedInsight from './insights/person-donated-insight';
import EventYesterdaySummaryInsight from './insights/event-yesterday-summary-insight';
import EventTodaySummaryInsight from './insights/event-today-summary-insight';


export default class Insights extends Component {

  static contextTypes = {
    app: PropTypes.object.isRequired
  }

  static navigationOptions = ({ navigation }) => {  
    return {
      ...DefaultNavigationOptions({ navigation }),
      headerTitle: (<HeaderTitle node="Registry::Insights::Scene::Insights" value="Header Title" />)
    }
  }
    
  state = {
    listData: []
  }
  
  componentDidMount() {
    this.context.app.trackScreenView('Insights');
  }
  
  render() {
    const { listData } = this.state;
    
    return (
      <View style={Theme.Styles.container}>
        <AsyncDataListView
          ref="insightList"
          dsRowHasChanged={ (prev, next) => prev.id !== next.id }
          data={listData}
          dataProvider={(page, pageSize) => {
                return this.context.app.getInsights({ 
                  page: page, 
                  pageSize: pageSize, 
                })
                .then( result => {
                  console.log('--- insightList', result);
                
                  if (this.state.listData.length === 0 && result.data.length === 0) {
                    // means there is nothing for this list.. show empty
                    this.setState({
                      listData: [{
                        id: 0,
                        insightclass: 'empty'
                      }]
                    });
                    
                    return [];
                  }
                   
                  // else concat to the list      
                  this.setState({
                    listData: this.state.listData.concat(result.data)
                  });
                  return result.data;                  
                });              
          }}
          // dataFilter={this.timeframeFilter}
          usePaging={false}
          onRenderRow={ rowData => {
            let first = false;
            if (rowData.id === listData[0].id) {
              first = true;
            }
            
            switch (rowData.insightclass) {
              case 'empty':
                return (<EmptyInsight />);
                break;
              /*
              case 'Event':
                return (<EventInsightCard data={rowData} />)
                break;
              */
              case 'people':
                return (<PersonInsight data={rowData} first={first} />);
                break;
              case 'favouritesBoughtAdmissions':
                return (<PersonBoughtAdmissionInsight data={rowData} first={first} />);
                break;
              case 'favouritesDonated':
                return (<PersonDonatedInsight data={rowData} first={first} />);
                break;
              case 'eventTodaySummary':
                return (<EventTodaySummaryInsight data={rowData} first={first} />);
                break;
              case 'eventYesterdaySummary':
                return (<EventYesterdaySummaryInsight data={rowData} first={first} />);
                break;
              case 'eventFavouritesYesterdaySummary':
                return (<EventYesterdaySummaryInsight data={rowData} first={first} />);
                break;
            }
            return null;
          }}
          style={{ paddingHorizontal: 10 }}
        />
      </View>
    );
  }
}
                                               