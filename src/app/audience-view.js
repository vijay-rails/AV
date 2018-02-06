/**
 * Configuration Object
 */
const avConfig = {
  "oauthKey": "SOME_KEY",
  "oauthSecret": "SOME_SECRET",
  "minimumVersion": "7.7",
  "gaId": ""
};

import URL from 'url-parse';
import { default as AV } from '../service/av';
import EventEmitter from 'EventEmitter';
// import Promise from 'bluebird';

// wrap the global fetch and override
// global.fetch = function() {
  // return Promise.resolve(global.fetch.apply(global, arguments));
// }

// import OAuthManager from 'react-native-oauth'; // uninstalled, reinstall when required.

import Storage from 'react-native-storage';
import {  
  NavigationActions 
} from 'react-navigation';
import { 
  AsyncStorage, Alert, Keyboard, PermissionsAndroid
} from 'react-native';
import {
  GoogleAnalyticsTracker,
  GoogleTagManager,
  GoogleAnalyticsSettings
} from 'react-native-google-analytics-bridge';

/**
 * Test the version and return true if it meets the minimum, false otherwise
 * 
 */
const minVersionChecker = (serverVersion, minVersion) => {  
  const serverParts = serverVersion.split(".");
  const minParts = minVersion.split(".");
  
  // compare at each element
  return minParts.reduce( (result, value, index) => {
    if (typeof serverParts[index] === 'undefined') {
      return true;
    }
    return Number(value) <= Number(serverParts[index]);
  }, false);
};

/**
 * OAuthManager setup
 */
const oAuthManagerSetup = () => {
  const oAuthManager = new OAuthManager('AudienceViewInsightsNative');

  console.log('---- avConfig ----', avConfig);
  console.log('---- avConfig ----', avConfig.host.concat('/oauth/authorize'));
  console.log('---- avConfig ----', avConfig.host.concat('/oauth/token'));
  
  oAuthManager.addProvider({
    'audienceView': {
      auth_version: '2.0',
      authorize_url: avConfig.host.concat('/oauth/authorize'),
      authorization_url_params: {},
      access_token_url: avConfig.host.concat('/oauth/token'),
      request_token_url: avConfig.host.concat('/oauth/request_token'),
      callback_url: ({app_name}) => {
         console.log('callback url', app_name);
         // return `${app_name}://oauth`;
         return `http://localhost/${app_name}`;
      }
    }
  });

  oAuthManager.configure({
    'audienceView': {
    	client_id: avConfig.oauthKey,
    	client_secret: avConfig.oauthSecret,
    }
  });
  
  return oAuthManager;
};

/**
 * default Alert Options
 */
const defaultAlertOptions = props => { 
  return {
    OK: {
      text: 'OK',
      ...props
    }
  };
};


/**
 * The Audience-View business application (function)
 * @todo: convert this to a class ?
 */
export default function AudienceView(component) {
  let events = new EventEmitter();
  let registry = {};
  let gaTracker = null;
  
  // Google Analytics
  if (avConfig.gaId.length > 0) {
    gaTracker = new GoogleAnalyticsTracker(avConfig.gaId, { 
      server: 1 
    });
  }

  const permissions = {
    location: true,
    storage: true
  };
  
  let personFavourites;
  let eventFavourites;
  
  let apiVersion;
  let sessionId;
  let server;
  let serverCredentials;
  let authTries = 0;
  let networkConnected = false;
  
  // setup oAuth (doesn't work.. problems with the library)
  // const oAuthManager = oAuthManagerSetup();

  // the return object is our interface
  
  const appInterface = {
		  
    // no data result object
    nodata: { data: [] },
    
    // noop function
    noop: () => {},
    
    // set app component state
    setState: state => {
      component.setState(state);
    },
    
    // signal emitter
    emit: (signal, data = {}) => {
      events.emit(signal, data);
      console.log('AV Signal Emit: '+signal);
    },
    
    // signal connector
    connect: (signal, handler) => {
      events.addListener(signal, handler);
      console.log('AV Signal Connected: '+signal);
    },
    
    // signal disconnector
    disconnect: (signal, handler) => {
      events.removeListener(signal, handler);
      console.log('AV Signal Disconnected: '+signal);
    },
    
    // track screen view
    trackScreenView: (screenName, dimensions = {}) => {
      if (gaTracker) {
        gaTracker.trackScreenViewWithCustomDimensionValues(screenName, Object.assign({ 
          server: server 
        }, dimensions));
      }
    },
    
    trackEvent: (category, action, optional, dimensions = {}) => {
      if (gaTracker) {
        gaTracker.trackEventWithCustomDimensionValues(category, action, optional, Object.assign({
          server: server
        }, dimensions));
      } 
    },
    
    // navigation wrapper
    navigation: {
      navigate: (routeName, params = {}, action = null) => {
    	component.refs.navigation.dispatch(NavigationActions.navigate({
    	  routeName: routeName,
    	  params: params,
          action: action
      	}));
      }
    },
    
    // network connectivity handler
    onNetworkChange: isConnected => {
      console.log('--- network ---', isConnected);
      networkConnected = isConnected;
    },
    
    // Request STORAGE permissions
    requestStoragePermission() {
      try {
        PermissionsAndroid.request( PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE, {
          'title': 'AudienceView STORAGE Permission',
          'message': 'AudienceView uses STORAGE to cache images and other data for a better user experience.'
        })
        .then( granted => {            
          appInterface.emit('permission-storage', { granted: granted });
        });
      }
      catch (err) {
        console.warn('--- STORAGE REQUEST ---', err);
        appInterface.emit('permission-storage-not-granted');
      }      
    },
    
    // Check or Request GPS Permissions
    checkAndRequestStoragePermission() {
      try {
        return PermissionsAndroid.check( PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE)
        .then( granted => {
          appInterface.emit('permission-storage-check', { granted: granted });
        });
      }
      catch (err) {
        console.warn('--- STORAGE CHECK ---', err);
        appInterface.emit('permission-storage-not-granted');
      } 
    },
    
    // Request GPS permissions
    requestLocationPermission() {
      try {
        PermissionsAndroid.request( PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, {
          'title': 'AudienceView GPS Permission',
    	  'message': 'AudienceView uses GPS to provide directions and other location based insights.'
    	})
    	.then( granted => {            
    	  appInterface.emit('permission-location', { granted: granted });
    	});
	  }
      catch (err) {
	    console.warn('--- GPS REQUEST ---', err);
	    appInterface.emit('permission-location-not-granted');
	  }
    },
    
    // Check or Request GPS Permissions
    checkAndRequestLocationPermission() {
      try {
        return PermissionsAndroid.check( PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION)
    	.then( granted => {
          appInterface.emit('permission-location-check', { granted: granted });
    	});
	  }
      catch (err) {
	    console.warn('--- GPS CHECK ---', err);
	    appInterface.emit('permission-location-not-granted');
	  } 
    },
    
    // get GPS Location
    getLocation: () => {
      return component.state.location;
    },
    
    // basic alert
    alert: (title, message) => { 
      Alert.alert( title, message, [defaultAlertOptions({})], { 
        cancelable: true 
      });
    },
                        
    // fetch wrapper to handle calls to server
    /*
    avFetch: (route, body = null, headers = {}, extraFetchOptions = {}) => {
      if (server === null || server.length == 0) {
        return new Promise((resolve, reject) => {
          component.setState({
            auth: false,
            authenticating: false
          });
          return reject(new Error('Server URL Required'));
        });
      }
      return fetch(server.concat(route), {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...headers
        },
        body: body,
        ...extraFetchOptions
      })
      .then(response => {
        console.log('--- hooey ---', response);
        return response;
      })
      .catch(error => {
        console.log('--- booey ---', error);
        throw error;
      });
    },
    
    
    // standard fetch response resolver
    onAvResponse: (response, cb) => {
      switch (response.status) {
        case 200:
       	  return response.json();
       	  break;
        case 403:
          if (authTries >= 1) {
        	return appInterface.doAuthentication(server, serverCredentials.userid, serverCredentials.password)
        	.then( res => {
        	  return cb();   
        	})
        	.catch( error => {
        	  authTries = 0;
              component.setState({
                auth: false,
                authenticating: false
              });
              throw error;
        	});
          }
          else {
       	    authTries = 0;
            component.setState({
              auth: false,
              authenticating: false
            });
            return appInterface.nodata;
       	  }
          break;
        case 500:
       	  Alert.alert('Connection Error', 'Unable to Retrieve Data', [defaultAlertOptions({})], { 
            cancelable: true 
          });	
        default:
          return appInterface.nodata;
      }
    },
    */    
    // @todo check for authorization (oAuth) 
    isAuthorized: () => {
    	/*
        return oAuthManager.authorize('audienceView', { scopes: 'profile' })
        .then( resp => {
            console.log('------ oAuthManager ------', resp);
            return resp;
        });
        */

      return appInterface.storage.load({
        key: 'authorization',
      })
      .then( data => {          
        if (typeof data === 'object') {
          if (data.hasOwnProperty('url') && data.hasOwnProperty('username') && data.hasOwnProperty('password')) {
            if (data.url.length > 0) {          
        	  return appInterface.checkServer(data.protocol+'//'+data.url)
        	  .then( response => {
        	    return appInterface.doAuthentication(data.username, data.password);  
        	  })
        	  .catch( error => {
        	    console.log('--- test error', error);
        	    
        	    if (error.hasOwnProperty('message')) {
        	      Alert.alert('Server Error', error.message, [defaultAlertOptions({})], { 
                    cancelable: true 
                  });
        	    }
        	    else {
        	      Alert('unable to login');
        	    }
        	    return {
        	      status: false
        	    };
        	  });      			
            }
          }
        }
        // use authorization to fetch authentication
        throw {
          status: false,
          message: 'No authorization data available.'
        };
      });
    },
    
    // perform authentication
    doAuthentication: (username, password) => {
      component.setState({
        authenticating: true
      });

      authTries = authTries + 1;     
      serverCredentials = {
        'userid': username,
        'password': password,
      };
      
      const formBody = Object.keys(serverCredentials).map( key => {
        return encodeURIComponent(key) + '=' + encodeURIComponent(serverCredentials[key]);
      }).join('&');
      
      /*
      return appInterface.avFetch('/login', formBody, { 
        'Content-Type': 'application/x-www-form-urlencoded'
      })
      .then( response => {
        return response.json(); 
      })
      .then( response => {
        switch (response.status) {
          case 'OK':
            Keyboard.dismiss();
            appInterface.storage.save({
              key: 'authorization',
              data: {
                url: url,
                username: username,
                password: password
              },
              expires: null
            });
            break;
          case 'Error':
            Alert.alert('Authentication Error', response.error, [defaultAlertOptions({})], { 
              cancelable: true 
            });
            break;
        };
        return response;
      })
      .catch( error => {
        Alert.alert('Connection Error', 'Unable to Authenticate', [defaultAlertOptions({})], { 
          cancelable: true 
        });
        
        apiVersion = null;
        sessionId = null;
        server = null;
        serverCredentials = null;
        authTries = 0;
        appInterface.storage.remove({ key: 'authorization' });
        
        throw error;
      });
      */
         
      console.log('--- authenticating ----');
      return AV.authenticate( server, serverCredentials.userid, serverCredentials.password)
      .then(response => {
      
          // console.log('--- authenticating 2 ----', response);
      
          if (response.hasOwnProperty('result')) {
            
            switch (response.result.status) {
              case '0':
              case 0:
                // version needs to be at least 7.21.0
                const session = response.session;
                apiVersion = response.version;
                sessionId = session;
          
                console.log('--- authenticating 3 ----', response);
                // tracker.setUser('12345678') // do we set the tracker userid ?
                      
                // now lets fetch the user data
                return AV.getSessionCustomer(server, session)
                .then( response => {
                
                    console.log('--- authenticating 4 ----', response);
                         
                    const url = new URL(server);
                         
                    Keyboard.dismiss();
                    appInterface.storage.save({
	                  key: 'authorization',
	                  data: {
	                    url: url.host,
	                    protocol: url.protocol,
	                    username: username,
	                    password: password,
	                    session: session
	                  },
	                  expires: null
	                });
                   
                    console.log('--- fetching from registry');
                    return appInterface.getRegistryConfig().then( data => {
                      console.log('--- registry', data);
                      registry = data;
                                       
                      component.setState({
                        auth: true,
                        authenticating: false
                      });
                                                                     
                      return {
                        status: 'OK',
                        error: null,
                        data: {
                          customerId: response.uuid.standard,
                          firstName: response.first_name.standard,
                          lastName: response.last_name.standard
                        }
                      };
                    });
                });
                break;
              default:
                console.log('------',response,'---------');
                Alert.alert('Authentication Error', response, [defaultAlertOptions({})], { 
                  cancelable: true 
                });
            }
          }
          else {
                console.log('------',response,'---------');
                Alert.alert('Authentication Error', response, [defaultAlertOptions({})], { 
                  cancelable: true 
                });            
          }                                                                        
      })
      .catch( error => {
        console.log('---- what is going on ----', error, authTries);
        if (error.hasOwnProperty('status')) {
          switch (error.status) {
            case '99':
            case 99:
              if (authTries < 2) {
                authTries = 0;
                return appInterface.doAuthentication(serverCredentials.userid, serverCredentials.password);
              }
            break;
          }
        }

        Alert.alert('Connection Error', 'Unable to Authenticate', [defaultAlertOptions({})], { 
          cancelable: true 
        });
        
        apiVersion = null;
        sessionId = null;
        // server = null;
        serverCredentials = null;
        authTries = 0;
        appInterface.storage.remove({ key: 'authorization' });
        
        component.setState({
          auth: false,
          authenticating: false,
          user: null
        });
        
        throw error;
      });
    },
    
    
    renewPassword: (username, email) => {
      return AV.renewPassword(server, username, email);
    },
    
    changeUserPassword: (oldPassword, newPassword, confirmPassword) => {
      return AV.changeUserPassword(server, oldPassword, newPassword, confirmPassword);
    }, 
    
    // perform logout
    onLogout: () => {
      const logout = () => {
        apiVersion = null;
        sessionId = null;
        // server = null;
        serverCredentials = null;
        
        appInterface.storage.remove({ key: 'authorization' });
        
        component.setState({
          auth: false,
          authenticating: false,
          user: null
        });
      };
      
      // return appInterface.avFetch('/logout')
      AV.sessionLogout(server, sessionId)
      .then( logout )
      .catch( logout );  
    },
    
    checkServer: userServer => {
      console.log('--- userServer', userServer);
      
      if (!userServer.startsWith('http')) {
        if (!userServer.startsWith('//')) {
          userServer = '//'+userServer;
        }
        userServer = 'https:' + userServer;
      }
      const url = new URL(userServer);     

      console.log('--- dizzy', userServer);
      
      return AV.ping(userServer)
      .then( data => {
      
        console.log('--- heezy');
        
        // first lets check the version and ensure it meets our minimum version 
        if (!minVersionChecker(data.version, avConfig.minimumVersion)) {
          throw {
            type: 'version',
            message: 'Server version does not meet minimum requirements. Server is version '.concat(data.version, ' and must be at least ', avConfig.minimumVersion)
          };
        }
                
        if (data.hasOwnProperty('result') && data.result.status === '0') {
	      // lets save url
	      appInterface.updateServer(url);
        }
        return data;
      })
      .catch( error => {
        // session timeout?
        console.log('--- sheezy', error);
        if (error.hasOwnProperty('status')) {
          switch (error.status) {
            case '99':
            case 99:
            // just because session timed-out doesnt mean url isn't good.. save
            appInterface.updateServer(url);
            return appInterface.checkServer(url.protocol+'//'+url.host);
            break;
            default:
              throw error;
          }
        }
        else {
          throw error;
        }
      });
    },
   
    updateServer: (url) => {
      appInterface.storage.save({
        key: 'servers',
        data: {
          protocol: url.protocol,
          url: url.host,
        },
        expires: null
      });  
      server = url.protocol+'//'+url.host;
    },
    
    isFavouritePerson: (customerid) => {
      return personFavourites instanceof Set && personFavourites.has(customerid);
    },
    
    setFavouritePerson: (customerid) => {
      personFavourites.add(customerid);
      appInterface.storage.save({ key: 'personFavourites', data: Array.from(personFavourites), expires: null });
    },
    
    unsetFavouritePerson: (customerid) => {
      personFavourites.delete(customerid);
      appInterface.storage.save({ key: 'personFavourites', data: Array.from(personFavourites), expires: null });
    },
    
    // load customer data
    getPerson: (params) => {
      if (!networkConnected) {
        return new Promise( (resolve, reject) => {
          resolve(appInterface.nodata);
        });
      }

      console.log('--- getPerson');
      return AV.customer(server, sessionId, params)
      .then( response => {
        return response;
      })
      .catch(e => appInterface.dataConnectionError(e, () => { return appInterface.getPerson(params) }));  
    },
    
    // get people list data
    getPeople: (params) => {      
      if (!networkConnected) {
      	return new Promise( (resolve, reject) => {
      	  resolve(appInterface.nodata);
      	});
      }
      
      if (params.filters.hasOwnProperty('filterFavourites') && params.filters.filterFavourites) {
        Object.assign(params, { favourites: Array.from(personFavourites) });
      }
      
      /*
      return appInterface.avFetch('/customers', JSON.stringify(params))
      .then( response => {
    	  return appInterface.onAvResponse(response, () => {
    	    return appInterface.getPeople(params);
    	  });
      })
      .catch( appInterface.dataConnectionError );
      */
      
      // console.log(' -- some params -- ', params);
      console.log('--- getPeople');
      return AV.customers(server, sessionId, params)
	  .then( response => {
	    return response;
	  })
	  .catch(e => appInterface.dataConnectionError(e, () => { return appInterface.getPeople(params) }));  
    },
    
    // get person stats
    getPersonStats: (params) => {
      if (!networkConnected) {
        return new Promise( (resolve, reject) => {
          resolve(appInterface.nodata);
        });
      }
      
      /*
      return appInterface.avFetch('/customer/'+params.customerId+'/stats', JSON.stringify(params))
      .then( response => {
      	return appInterface.onAvResponse(response, () => {
      	  return appInterface.getPersonStats(params);
      	});
      })
      .catch( appInterface.dataConnectionError );
      */
      
      let responses = [];
      console.log('--- getPersonStats');
      return AV.customerMostRecentOrder(server, sessionId, params)
	  .then( response => {
	    Object.assign(responses, { mostRecentOrder: response });
	  
	    // now get most recent gift
	    return AV.customerMostRecentGift(server, sessionId, params)
	    .then( response => {
	      Object.assign(responses, { mostRecentGift: response });
	      
	      // now total spend
	      return AV.customerTotalSpend(server, sessionId, params)
	      .then( response => {
	        Object.assign(responses, { totalSpend: response }); 
	  
	            // now get the total pledged
	        return AV.customerTotalPledged(server, sessionId, params)
	        .then( response => {
	          Object.assign(responses, { totalPledged: response });
	        
	          // finally the total pledged actually paid
	          return AV.customerTotalPledgedGiven(server, sessionId, params)
	          .then( response => {
	            Object.assign(responses, { totalGiven: response });

	            return responses;
	          });
	        });
	      });
	    }); 
	  })
	  .catch(e => appInterface.dataConnectionError(e, () => { return appInterface.getPersonStats(params) }));  
    },
    
    // get person events list
    getPersonEvents: params => {
      if (!networkConnected) {
      	return new Promise( (resolve, reject) => {
      	  resolve(appInterface.nodata);
      	});
      }
      
      /*
      return appInterface.avFetch('/customer/'+params.customerId+'/events', JSON.stringify(params))
      .then( response => {
      	return appInterface.onAvResponse(response, () => {
      	  return appInterface.getPersonEvents(params);
      	});
      })
      .catch( appInterface.dataConnectionError );
      */
      
      if (params.filters.hasOwnProperty('favourites') && params.filters.favourites) {
        if (Array.from(eventFavourites).length === 0) {
          return new Promise((resolve, reject) => {
             resolve({
               data: [],
               total: 0,
               page: 0
             }); 
          });
        }
        
        Object.assign(params, { 
          favourites: Array.from(eventFavourites) 
        });
      }

      return AV.customerEvents(server, sessionId, params)
	  .then( response => {
        return response;
      })
      .catch(e => appInterface.dataConnectionError(e, () => { return appInterface.getPersonEvents(params) }));
    },

    // get person events list
    getPersonActivity: params => {
      if (!networkConnected) {
        return new Promise( (resolve, reject) => {
          resolve(appInterface.nodata);
        });
      }

      /*
      return appInterface.avFetch('/customer/'+params.customerId+'/activity', JSON.stringify(params))
      .then( response => {
        return appInterface.onAvResponse(response, () => {
          return appInterface.getPersonActivity(params);
        });
      })
      .catch( appInterface.dataConnectionError );
      */
      return AV.customerActivity(server, sessionId, params)
      .then( response => {
        return response;
      })
      .catch(e => appInterface.dataConnectionError(e, () => { return appInterface.getPersonActivity(params) }));  
    },
    
    isFavouriteEvent: (eventid) => {
      return eventFavourites instanceof Set && eventFavourites.has(eventid);
    },
    
    setFavouriteEvent: (eventid) => {
      eventFavourites.add(eventid);
      appInterface.storage.save({ key: 'eventFavourites', data: Array.from(eventFavourites), expires: null });
    },
    
    unsetFavouriteEvent: (eventid) => {
      eventFavourites.delete(eventid);
      appInterface.storage.save({ key: 'eventFavourites', data: Array.from(eventFavourites), expires: null });
    },
    
    // get dashboard insights
    getInsights: (params) => {
      if (!networkConnected) {
        return new Promise( (resolve, reject) => {
          resolve(appInterface.nodata);
        });
      }
      
      Object.assign(params, { 
        personFavourites: Array.from(personFavourites), 
        eventFavourites: Array.from(eventFavourites) 
      });

      /*
      return appInterface.avFetch('/dashboard/insights', JSON.stringify(params))
      .then( response => {
        return appInterface.onAvResponse(response, () => {
          return appInterface.getInsights(params);
        });
      })
      .catch( appInterface.dataConnectionError );
      */
      console.log('--- getInsights');
      return AV.insights(server, sessionId, params)
      .then( response => {
        return response;
      })
      .catch(e => appInterface.dataConnectionError(e, () => { return appInterface.getInsights(params) }));       
    },
    
    // get event list data
    getEvents: (params) => {
      if (!networkConnected) {
        return new Promise( (resolve, reject) => {
          resolve(appInterface.nodata);
        });
      }
      
      if (params.filters.hasOwnProperty('filterFavourites') && params.filters.filterFavourites) {
        Object.assign(params, { favourites: Array.from(eventFavourites) });
      }
      
      console.log('---- AV Events ----');
      /*
      return appInterface.avFetch('/events', JSON.stringify(params))
      .then( response => {        
      	return appInterface.onAvResponse(response, () => {
      	  return appInterface.getEvents(params);
      	});
      })
      .catch( appInterface.dataConnectionError );    
      */
	  return AV.events(server, sessionId, params)
	  .then( response => {
        return response;
      })
	  .catch(e => appInterface.dataConnectionError(e, () => { return appInterface.getEvents(params) }));  	
    },
    
    // get event insights for events taking place today
    getEventsToday: (params) => {
      if (!networkConnected) {
        return new Promise( (resolve, reject) => {
          resolve(appInterface.nodata);
        });
      }
      
      /*
      return appInterface.avFetch('/events/today', JSON.stringify(params))
      .then( response => {
        return appInterface.onAvResponse(response, () => {
          return appInterface.getEventsToday(params);
        });
      })
      .catch( appInterface.dataConnectionError );
      */
      
      return AV.eventsToday(server, sessionId, params)
      .then( response => {
        return response;
      })
      .catch(e => appInterface.dataConnectionError(e, () => { return appInterface.getEventsToday(params) }));
    },
    
    getEventDashboard: (params) => {
      if (!networkConnected) {
        return new Promise( (resolve, reject) => {
          resolve(appInterface.nodata);
        });
      }
      
      /*
      return appInterface.avFetch('/events/dashboard', JSON.stringify(params))
      .then( response => {
        return appInterface.onAvResponse(response, () => {
          return appInterface.getEventDashboard(params);
        });
      })
      .catch( appInterface.dataConnectionError );      
      */
      
      
      let responses = {};

      console.log('--- getEventDashboard');
      return AV.newDonors(server, sessionId, params)
	  .then( response => {
	    Object.assign(responses, { newDonors: response });
	  console.log('--- 2');  
	    return AV.newDonorsAmount(server, sessionId, params)
	    .then( response => {     
	      Object.assign(responses, { newDonorsAmount: response });
	console.log('--- 3');
	      return AV.newCustomersCount(server, sessionId, params)
	      .then( response => {
	        Object.assign(responses, { newCustomersCount: response });
	        console.log('--- 4');
	        return AV.newCustomersSales(server, sessionId, params)
	        .then( response => {
	          Object.assign(responses, { newCustomersSales: response });
	          console.log('--- 5 ', response);
	          return AV.eventSales(server, sessionId, params)
	          .then( response => {
	            Object.assign(responses, { eventSales: response });
	console.log('--- 6');
	            return AV.eventAdmissionsSoldCount(server, sessionId, params)
	            .then( response => {
	              Object.assign(responses, { eventAdmissionsSoldCount: response });
	            console.log('--- 7');
	              return AV.ticketSalesByDateRange(server, sessionId, params)
                  .then( response => {
                    Object.assign(responses, { ticketSalesByDateRange: response });
console.log('--- 8');
                    return responses;
                  });
	            });
	          });
	        });
	      });
	    });
	  })
	  .catch(e => appInterface.dataConnectionError(e, () => { return appInterface.getEventDashboard(params) }));  
  
    },
    
    getAdmissionsDetails: (params) => {
      if (!networkConnected) {
        return new Promise( (resolve, reject) => {
          resolve(appInterface.nodata);
        });
      }
      
      // let responses = {};
      return AV.eventAdmissionsSoldPriceTypes(server, sessionId, params)
      .then( response => {
        // Object.assign(responses, { newDonors: response });
        return response;
      })
      .catch(e => appInterface.dataConnectionError(e, () => { return appInterface.getAdmissionsDetails(params) }));  
    },
    
    getServer: () => {
      return server;
    },
    
    getAssetServerDomain: () => {
      if (appInterface.isAssetOverrideDomainEnabled()) {
        return appInterface.getAssetOverrideDomain();
      }
      return appInterface.getServer();
    },
    
    isAssetOverrideDomainEnabled: () => {
      let enabled = false;
      if (registry.hasOwnProperty('System::Insights::Domain')) {
        if (registry['System::Insights::Domain'].hasOwnProperty('Enabled') && registry['System::Insights::Domain'].Enabled.length > 0) {
          if (registry['System::Insights::Domain'].Enabled[0] != '0') {
            enabled = true;
          }
        }
      }
      return enabled;
    },
        
    getAssetOverrideDomain: () => {
      let domain = null;
      if (registry.hasOwnProperty('System::Insights::Domain')) {
        if (registry['System::Insights::Domain'].hasOwnProperty('URL') && registry['System::Insights::Domain'].URL.length > 0) {
          domain = registry['System::Insights::Domain'].URL[0];
        }
      }
      return domain;
    },
    
    getRegistryConfigValue: (node, key) => {
      if (registry.hasOwnProperty(node)) {
        if (typeof registry[node] !== 'undefined' && registry[node].hasOwnProperty(key)) {
          const value = registry[node][key];
          if (Array.isArray(value) && value.length === 1) {
            return value[0];
          }
          return value;
        }
      }
      return null;
    },
    
    getRegistryConfig: () => {
      // we can load any nodes, primitives we need for the app here, and save them accordingly with an appropriate expiry  
      const nodes = [
        'System::Insights::Domain',
        'Registry::Insights::Scene::Dashboards',
        'Registry::Insights::Scene::Event',
        'Registry::Insights::Scene::Events',
        'Registry::Insights::Scene::Insights',
        'Registry::Insights::Scene::Logout',
        'Registry::Insights::Scene::Navigation',
        'Registry::Insights::Scene::People',
        'Registry::Insights::Scene::Person',
      ];
      
      return AV.registry.values(server, sessionId, nodes)
      .then( response => {
        if (response.hasOwnProperty('registryNodeValues')) {
          let config = {};

          nodes.reduce( (c, node) => {
            if (response.registryNodeValues.hasOwnProperty(node)) {
              c[node] = response.registryNodeValues[node];
            } 
            return c;
          }, config);
    
          return config;
        }
        return {};
      })
      .then( data => {
        console.log('--- registry', data);
        
        if (data === null || data.length === 0) {
          return data;
        }
        
        appInterface.storage.save({
          key: 'registryConfiguration',
          data: data,
          expires: 1000 * 3600 // 1 hour
        });
  
        return data;
      })
      .catch(e => appInterface.dataConnectionError(e, () => { return appInterface.getRegistryConfig() }));
            
      return appInterface.storage.load({
        key: 'registryConfiguration'
      }); 
    },

    getCustomerKeywords: () => {
      return appInterface.storage.load({
        key: 'customerKeywords'
      });
    },
        
    getServers: () => {
      return appInterface.storage.load({
        key: 'servers',
      });
    },
    
    // get event categories from storage
    getEventCategories: params => {
      return appInterface.storage.load({
        key: 'eventCategories',
      });
    },

    getEventTypes: () => {
      return appInterface.storage.load({
        key: 'eventTypes'
      });
    },
    
    getEventGroups: () => {
      return appInterface.storage.load({
        key: 'eventGroups'
      });
    },
        
    // get event categories from storage
    getEventLocations: params => {
      return appInterface.storage.load({
        key: 'eventLocations',
      });
    },
    
    getEventVenues: params => {
      return appInterface.storage.load({
        key: 'eventVenues',
      });
    },
    
    // Event Details
    getEventStats: (params) => {      
      if (!networkConnected) {
        return new Promise( (resolve, reject) => {
          resolve(appInterface.nodata);
        });
      }
      
      console.log('--- getEventStats');
      let responses = {};
	  return AV.eventAttendance(server, sessionId, params)
	  .then( response => {  
	    // console.log('---- tickets ----');
	    Object.assign(responses, { tickets: response });
	  
	    return AV.eventAdmissionsSold(server, sessionId, params)
	    .then( response => {
	      // console.log('admissionsSold');
	      Object.assign(responses, { admissionsSold: response });
	      
	      return AV.eventRevenue(server, sessionId, params)
	      .then( response => {
	        // console.log('revenues');
	        Object.assign(responses, { revenues: response });
	          
	        return AV.eventAdmissionsCosts(server, sessionId, params)
	        .then( response => {
	          // console.log('admissions');
	          Object.assign(responses, { admissions: response });
	          
	          return AV.eventPricing(server, sessionId, params)
	          .then( response => {
	            // console.log('pricing', response);
	            Object.assign(responses, { pricing: response });
	            
            	return AV.eventAdmissionsComped(server, sessionId, params)
	            .then( response => {
	              // console.log('comped', response);
	              Object.assign(responses, { comps: response });
	              return responses;
	            });
	          });          
	        });     
	      });     
	    });
	  })
	  .catch(e => appInterface.dataConnectionError(e, () => { return appInterface.getEventStats(params) }));
  
    },
    
    getEventAttendanceDetails: (params) => {
      if (!networkConnected) {
        return new Promise( (resolve, reject) => {
          resolve(appInterface.nodata);
        });
      }

      console.log('--- getEventStatsAttendanceDetails');
      return AV.eventAttendanceDetails(server, sessionId, params)
      .catch(e => appInterface.dataConnectionError(e, () => { return appInterface.getEventStats(params) }));
    },
    
    getEventPeople: (params) => {
      if (!networkConnected) {
        return new Promise( (resolve, reject) => {
          resolve(appInterface.nodata);
        });
      }

      /*
      return appInterface.avFetch('/event/'+params.eventId+'/customers', JSON.stringify(params))
      .then( response => {
        return appInterface.onAvResponse(response, () => {
          return appInterface.getEventPeople(params);
        });
      })
      .catch( appInterface.dataConnectionError );      
      */
      
      if (params.filters.hasOwnProperty('favourites') && params.filters.favourites) {
        if (Array.from(personFavourites).length === 0) {
          return new Promise((resolve, reject) => {
             resolve({
               data: [],
               total: 0,
               page: 0
             }); 
          });
        }
        
        Object.assign(params, { 
          favourites: Array.from(personFavourites) 
        });
      }
      
      return AV.eventCustomers(server, sessionId, params)
	  .then( response => {
        return response;
      })
      .catch(e => appInterface.dataConnectionError(e, () => { return appInterface.getEventPeople(params) })); 
    },
    
    getEventPersonAdmissions: (params) => {
      if (!networkConnected) {
        return new Promise( (resolve, reject) => {
          resolve(appInterface.nodata);
        });
      }

      /*
      return appInterface.avFetch('/event/'+params.eventId+'/customers', JSON.stringify(params))
      .then( response => {
        return appInterface.onAvResponse(response, () => {
          return appInterface.getEventPeople(params);
        });
      })
      .catch( appInterface.dataConnectionError );      
      */
      
        return AV.eventCustomerAdmissions(server, sessionId, params)
        .then( response => {
          return response;
        })
        .catch(e => appInterface.dataConnectionError(e, () => { return appInterface.getEventPersonAdmissions(params) })); 
    },
    
    // Main Storage Setup
    storage: new Storage({
    	// maximum capacity, default 1000  
    	size: 1000,

    	// Use AsyncStorage for RN, or window.localStorage for web.
    	// If not set, data would be lost after reload.
    	storageBackend: AsyncStorage,
    	
    	// expire time, default 1 day(1000 * 3600 * 24 milliseconds).
    	// can be null, which means never expire.
    	defaultExpires: 1000 * 3600 * 24,
    	
    	// cache data in the memory. default is true.
    	enableCache: true,
    	
    	// if data was not found in storage or expired,
    	// the corresponding sync method will be invoked and return 
    	// the latest data.
    	sync : {
    		eventCategories(params) {
    			let { resolve, reject } = params;

    		    if (!networkConnected) {
    		      resolve(appInterface.nodata);
    		    }
    		    else {
    		      /*    		    	
    		        appInterface.avFetch('/event/categories')
    		        .then( response => {
    		          return appInterface.onAvResponse(response, () => {
    		        	return appInterface.storage.sync.eventCategories(params);
    		          });
    		        })
    		        .then( resolve )
    		        .catch( error => {
	        		  resolve(appInterface.nodata);
    		        });
    		      */
    		      console.log('--- eventCategories');
    		      return AV.eventCategories(server, sessionId, {})
				  .then( resolve )
                  .catch(e => appInterface.dataConnectionError(e, () => { return appInterface.getEventCategories() }));
    		    }
    		},
    		eventLocations(params) {
    			let { resolve, reject } = params;

    		    if (!networkConnected) {
    		      resolve(appInterface.nodata);
    		    }
    		    else {
    		      /*
    		        appInterface.avFetch('/event/locations')
    		        .then( response => {
    		          return appInterface.onAvResponse(response, () => {
    		        	return appInterface.storage.sync.eventLocations(params);
    		          });
    		        })
    		        .then( resolve )
    		        .catch( error => {
	        		  resolve(appInterface.nodata);
    		        });
    		      */
    		      console.log('--- eventLocations');
    		      return AV.eventLocations(server, sessionId, {})
				  .then( resolve )
                  .catch(e => appInterface.dataConnectionError(e, () => { return appInterface.getEventLocations() }));
    		    }
    		},
    		eventVenues(params) {
                let { resolve, reject } = params;

                if (!networkConnected) {
                  resolve(appInterface.nodata);
                }
                else {
                    /*
                    appInterface.avFetch('/event/venues')
                    .then( response => {
                      return appInterface.onAvResponse(response, () => {
                        return appInterface.storage.sync.eventVenues(params);
                      });
                    })
                    .then( resolve )
                    .catch( error => {
                      resolve(appInterface.nodata);
                    });
                    */
                  console.log('--- eventVenues');
				  return AV.eventVenues(server, sessionId, {})
				  .then( resolve )
				  .catch(e => appInterface.dataConnectionError(e, () => { return appInterface.getEventVenues() }));
                }
    		},
    		customerKeywords(params) {
              let { resolve, reject } = params;
              if (!networkConnected) {
                resolve(appInterface.nodata);
              }
              else {
                console.log('--- customerKeywords');
                const list = 'customer keywords';
                return AV.registry.list(server, sessionId, [list])
                .then( response => {                                       
                  if (response.hasOwnProperty('lists') && response.lists.hasOwnProperty(list)) {
                    return response.lists[list];
                  }
                  return null;
                })
                .then( data => {
                  if (data === null) {
                    return data;
                  }
                  appInterface.storage.save({
                    key: 'customerKeywords',
                    data: data,
                    expires: 1000 * 3600 // 1 hour
                  });
                  return data;
                })
                .then( resolve )
                .catch(e => appInterface.dataConnectionError(e, () => { return appInterface.getCustomerKeywords() }));
              }    		  
    		},
            eventTypes(params) {
              let { resolve, reject } = params;
              if (!networkConnected) {
                resolve(appInterface.nodata);
              }
              else {
                console.log('--- eventTypes');
                const list = 'Performance Types';
                return AV.registry.list(server, sessionId, [list])
                .then( response => {                                       
                  if (response.hasOwnProperty('lists') && response.lists.hasOwnProperty(list)) {
                    return response.lists[list];
                  }
                  return null;
                })
                .then( data => {
                  if (data === null) {
                    return data;
                  }
                  appInterface.storage.save({
                    key: 'eventTypes',
                    data: data,
                    expires: 1000 * 3600 // 1 hour
                  });
                  return data;
                })
                .then( resolve )
                .catch(e => appInterface.dataConnectionError(e, () => { return appInterface.getEventTypes() }));
              }           
            },
            eventGroups(params) {
              let { resolve, reject } = params;
              if (!networkConnected) {
                resolve(appInterface.nodata);
              }
              else {
                console.log('--- eventGroups');
                const list = 'event groups';
                return AV.registry.list(server, sessionId, [list])
                .then( response => {                                       
                  if (response.hasOwnProperty('lists') && response.lists.hasOwnProperty(list)) {
                    return response.lists[list];
                  }
                  return null;
                })
                .then( data => {
                  if (data === null) {
                    return data;
                  }
                  appInterface.storage.save({
                    key: 'eventGroups',
                    data: data,
                    expires: 1000 * 3600 // 1 hour
                  });
                  return data;
                })
                .then( resolve )
                .catch(e => appInterface.dataConnectionError(e, () => { return appInterface.getEventGroups() }));
              }           
            },
            registryConfiguration(params) {
              let { resolve, reject } = params;
              if (!networkConnected) {
                resolve(appInterface.nodata);
              }
              else {
                // we can load any nodes, primitives we need for the app here, and save them accordingly with an appropriate expiry  
                const nodes = [
                  'System::Insights::Domain',
                  'Registry::Insights::Scene::Dashboards',
                  'Registry::Insights::Scene::Event',
                  'Registry::Insights::Scene::Events',
                  'Registry::Insights::Scene::Insights',
                  'Registry::Insights::Scene::Logout',
                  'Registry::Insights::Scene::Navigation',
                  'Registry::Insights::Scene::People',
                  'Registry::Insights::Scene::Person',
                ];
                  
                return AV.registry.values(server, sessionId, nodes)
                .then( response => {
                  if (response.hasOwnProperty('registryNodeValues')) {
                    let config = {};

                    nodes.reduce( (c, node) => {
                      if (response.registryNodeValues.hasOwnProperty(node)) {
                        c[node] = response.registryNodeValues[node];
                      } 
                      return c;
                    }, config);
                    
                    return config;
                  }
                  return {};
                })
                .then( data => {
                  if (data === null || data.length === 0) {
                    return data;
                  }
                  
                  appInterface.storage.save({
                    key: 'registryConfiguration',
                    data: data,
                    expires: 1000 * 3600 // 1 hour
                  });
      
                  return data;
                })
                .then( resolve )
                .catch(e => appInterface.dataConnectionError(e, () => { return appInterface.getRegistryConfig() }));
              }
            }	
    	}
    }),
    
    // default connection error handler
    dataConnectionError: (error, cb) => {
      if (error.hasOwnProperty('status')) {
        switch (error.status) {
          case '99':
          case 99:
            // need to reauthenticate and execute cb
            if (authTries >= 1) {
	            return appInterface.doAuthentication(serverCredentials.userid, serverCredentials.password)
	            .then( data => {
	              if (typeof data === 'object' && data !== null && data.hasOwnProperty('status')) {
	                switch (data.status) {
	                  case 'OK':
	                    return cb();        
	                    break;
	                }
	              }
	              return data;
	            })
	            .catch( error => {
	              authTries = 0;
	              component.setState({
	                auth: false,
	                authenticating: false
	              });
	              throw error;
	            });
	        }
	        else {
	            authTries = 0;
	            component.setState({
	              auth: false,
	              authenticating: false
	            });
	            return appInterface.nodata;
	        }          
            break;
          default:           
            console.log('--- data connect', error);
	        Alert.alert( 'Server Error', error.message, [defaultAlertOptions({})], { 
		      cancelable: true 
		    });
        }
      }
      else {
        console.log('--- vhat', error);
	      Alert.alert( 'Connection Error', 'Unable to Retrieve Data', [defaultAlertOptions({})], { 
	         cancelable: true 
	      });
      }
      return appInterface.nodata;
    }
  };
  
  // app signals
  appInterface.connect('permission-location', data => { 
	  if (data.granted === PermissionsAndroid.RESULTS.GRANTED) {
      appInterface.emit('permission-location-granted');
    } 
    else {
      appInterface.emit('permission-location-not-granted');
      permissions.location = false;
    }
  });
  
  appInterface.connect('permission-location-check', data => {
    if (data.granted === PermissionsAndroid.RESULTS.GRANTED) {
      appInterface.emit('permission-location-granted');
    } 
    else {
      if (permissions.location) {
    	  appInterface.requestLocationPermission();
      }
      else {
    	  appInterface.emit('permission-location-not-granted');
      }
    }
  });
  
  appInterface.connect('permission-storage', data => { 
    if (data.granted === PermissionsAndroid.RESULTS.GRANTED) {
      appInterface.emit('permission-storage-granted');
    } 
    else {
      appInterface.emit('permission-storage-not-granted');
      permissions.storage = false;
    }
  });
  
  appInterface.connect('permission-storage-check', data => {
    if (data.granted === PermissionsAndroid.RESULTS.GRANTED) {
      appInterface.emit('permission-storage-granted');
    } 
    else {
      if (permissions.storage) {
        appInterface.requestStoragePermission();
      }
      else {
        appInterface.emit('permission-storage-not-granted');
      }
    }
  });
  
  // favourite persons index
  appInterface.storage.load({
    key: 'personFavourites',
  })
  .then( data => {
    let setData = [];
    if (data instanceof Array) {
      setData = data;
    }
    personFavourites = new Set(setData);
  })
  .catch( err => {
    personFavourites = new Set();
  });
  
  // favourite events index
  appInterface.storage.load({
    key: 'eventFavourites',
  })
  .then( data => {
    let setData = [];
    if (data instanceof Array) {
      setData = data;
    }
    eventFavourites = new Set(setData);
  })
  .catch( err => {
    eventFavourites = new Set();
  });
  
  return appInterface;
};