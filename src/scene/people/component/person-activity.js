import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  TouchableHighlight,
  LayoutAnimation
} from 'react-native';
import { NavigationActions } from 'react-navigation';
import AsyncDataListView from '../../../component/async-data-list-view';
import PersonActivityListItem from '../../../component/person-activity-list-item';
import SimpleStatus from '../../../component/simple-status';
import TabTitle from '../../../navigator/tab-title';
import { default as Theme } from '../../../lib/theme';
  
export default class PersonActivity extends Component {

  static contextTypes = {
    app: PropTypes.object.isRequired
  }

  static navigationOptions = ({ navigation }) => {
    return {
      tabBarLabel: (<TabTitle node="Registry::Insights::Scene::Person" value="Activities Tab Label" />)
    }
  };
  
  state = {
    listData: [],
    loaded: false
  }

  renderNoResults() {
    const { firstname, lastname } = this.props.screenProps.customer;
    const name = firstname.concat(' ', lastname);
    const status = name.concat(' has no Activity.');
    return (
      <SimpleStatus statusText={status} statusIcon="info-outline" />
    );
  }
  
  render() {  
    const { listData, loaded } = this.state;
    
    if (listData.length === 0 && loaded) {
      return this.renderNoResults();
    }
    
    return (
      <View style={styles.container}>
        <AsyncDataListView
          ref="personActivityList"
          style={{ paddingHorizontal: 10, paddingTop: 10 }}
          dsRowHasChanged={(prev, next) => prev.id !== next.id}
          data={listData}
          dataProvider={(page, pageSize) => {
            return this.context.app.getPersonActivity({ 
              page: page, 
              pageSize: pageSize, 
              customerId: this.props.screenProps.customer.customerid 
            })
            .then( result => {
              this.setState({
                listData: this.state.listData.concat(result.data)
              });
              return result.data; 
            });
          }}
          onRenderRow={rowData => (
            <PersonActivityListItem data={rowData} />
          )}
          onLoadedChanged={ loaded => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
            //LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            this.setState({
              loaded: loaded
            });
          }}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    backgroundColor: Theme.Colours.backgrounds.primary
  },
});