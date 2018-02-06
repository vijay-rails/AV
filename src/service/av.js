/**
 * AudienceView WebAPI Abstraction Library
 */
import * as d3 from 'd3-format';
import { default as ACC } from 'accounting';
const Moment = require('moment');
const CryptoJS = require('crypto-js');

/**
 * Search Counter
 */
let counter = 0;

/**
 * Get New Handle
 */
const getHandle = (rootHandle) => {  
  if (counter == Number.MAX_SAFE_INTEGER) {
    counter = 0;
  }
  
  counter++;
  return rootHandle.concat(counter.toString());
};

/**
 * used to create a hash code of a cryptographically secure hash
 * @param string str
 * @return int
 */
const hashCode = str => {
    const hash = CryptoJS.SHA256(str).toString(CryptoJS.enc.Hex);
    let hashcode = 0;
    for (var i = 0; i < hash.length; i++) {
        hashcode = ~~(((hashcode << 5) - hashcode) + hash.charCodeAt(i));
    }
    return Math.abs(hashcode); // force positive
};

/**
 * AV Business Objects
 */
const BO = {
    CUSTOMER: 'TScustomerBO',
    SEARCH: 'TSsearchBO'
};

/**
 * @param string
 *          sessionId
 * @return object
 */
const getSessionCookieHeader = sessionId => {
  return {};
  return {
    'Cookie': 'session=' + sessionId
  }
};


/**
 * returns the data as a application/x-www-form-urlencoded value
 * 
 * @param object
 *          data
 * @return string
 */
const getFormUrlEncoded = ( data, parent = null ) => {
  if ( Array.isArray( data ) ) {
    return data.map(( val, i ) => {
      return getFormUrlEncoded( val, parent.concat( '[' + i + ']' ) );
    }).join( '&' );
  }
  else if ( typeof data === 'object' && data !== null) {
    return Object.keys( data ).map(( key, i ) => {
      if ( parent === null ) {
        return getFormUrlEncoded( data[key], key );
      }
      return getFormUrlEncoded( data[key], key.concat( '[' + i + ']' ) );
    }).join( '&' );
  }
  return encodeURIComponent( parent ) + '=' + encodeURIComponent( data );
};

/**
 * @param string
 *          endpoint
 * @param object
 *          data
 * @param object
 *          headers
 * @return Promise
 */
const avPOST = ( endpoint, data, headers = {}) => {
  const headerData = Object.assign( {
    'Accept': 'application/json',
    'Content-Type': 'application/x-www-form-urlencoded'
  }, headers );
  
  // console.log('--- req ', endpoint, data);
  return fetch( endpoint , {
    method: 'POST',
    headers: headerData,
    body: getFormUrlEncoded( data ),
    credentials: 'include'
  })
  .then( response => {
    return response.json();
  })
  .then( json => {
	// console.log('--- pre json ', json);
    return json.response;
  })
  .then( json => {
	// console.log('--- json ', json);
	if (typeof json === 'undefined') {
		throw {};
	}
	
    switch ( json.result.status ) {
    case '0':
      if ( json.hasOwnProperty( 'data' ) ) {
        return json.data;
      }
      return json;
      break;
    default:
      throw json.result;
    }
  });
};

/**
 * @param string
 *          server
 */
const ping = server => {
  return avPOST( server.concat('/app/WebAPI/session'), {} );
};

/**
 * @param string
 *          sessionId
 * @param string
 *          handle
 * @param string
 *          objectName
 * @return Promise
 */
const createBO = (server, sessionId, handle, objectName ) => {
  return avPOST( server.concat('/app/WebAPI/session/boCreate'), {
    handle: handle,
    object: objectName,
  }, getSessionCookieHeader( sessionId ) );
};

/**
 * @param string
 *          sessionId
 * @param string
 *          handle
 * @param object
 *          data
 * @return Promise
 */
const loadBO = ( server, sessionId, handle, data ) => {
  return avPOST( server.concat('/app/WebAPI/v2/' + handle), {
    ...data,
    action: 'load'
  }, getSessionCookieHeader( sessionId ) );
};

/**
 * @param string
 *          sessionId
 * @param string
 *          handle
 * @param string
 *          key
 * @return Promise
 */
const getBO = ( server, sessionId, handle, key ) => {
  return avPOST( server.concat( '/app/WebAPI/object/' + handle), {
    'GET': key
  }, getSessionCookieHeader( sessionId ) );
};

/**
 * @param string
 *          sessionId
 * @param string
 *          handle
 * @return Promise
 */
const checkBO = ( server, sessionId, handle ) => {
  return avPOST( server.concat('/app/WebAPI/v2/' + handle), {}, getSessionCookieHeader( sessionId ) );
}

/**
 * @param string
 *          sessionId
 * @param string
 *          handle
 * @param object
 *          data
 * @return Promise
 * @deprecated
 */
const setPrimaryEntityBO = ( server, sessionId, object, data ) => {
  return avPOST( server.concat('/app/WebAPI/v2/' + object), {
    ...data,
    action: 'setPrimaryEntity'
  }, getSessionCookieHeader( sessionId ) );
};

/**
 * fetch registry data
 *
 */
const registryValues = ( server, sessionId, nodes ) => {
  return avPOST( server.concat('/app/WebAPI/session'), {
    'getRegistryNodeValues' : nodes,
  }, getSessionCookieHeader( sessionId ));
};

/**
 * @param string
 *          server
 * @param string
 *          sessionId
 * @param array
 *          primitives
 * @return Promise
 */
const registryValue = ( server, sessionId, primitives ) => {
  return avPOST( server.concat('/app/WebAPI/session'), {
    'getRegistryNodeValue' : primitives,
  }, getSessionCookieHeader( sessionId ));
};

/**
 * @param string
 *          server
 * @param string
 *          sessionId
 * @param array
 *          names
 * @return Promise
 */
const registryList = ( server, sessionId, names ) => {
  return avPOST( server.concat('/app/WebAPI/session'), {
    'getList' : names,
  }, getSessionCookieHeader( sessionId ));
};


/**
 * @param string
 *          server
 * @param string
 *          username
 * @param string
 *          password
 * @return Promise
 */
const authenticate = ( server, username, password ) => {
  return avPOST( server.concat('/app/WebAPI/session/authenticateUser'), {
    'userid': username,
    'password': password,
  });
};

/**
 * @param string
 *          server
 * @param string
 *          username
 * @param string
 *          email
 * @return Promise
 */
const renewPassword = ( server, username, email ) => {
  console.log('--- doing renewPassword');
  return avPOST( server.concat('/app/WebAPI/session/renewPassword'), {
    'userid': username,
    'email': email,
  })
  .then(response => {
    console.log('--- renew pass response', response);
    return response;
  })
  .catch(err => {
    console.log('--- renew pass err', err);
    throw err;
  })
  ;
};

/**
 * @param string
 *          server
 * @param string
 *          username
 * @param string
 *          oldPassword
 * @param string
 *          newPassword
 * @param string
 *          confirmPassword  
 * @return Promise
 */
const changeUserPassword = ( server, username, oldPassword, newPassword, confirmPassword ) => {
  return avPOST( server.concat('/app/WebAPI/session/changeUserPassword'), {
    'userid': username,
    'oldPassword': oldPassword,
    'newPassword': newPassword,
    'confirmPassword': confirmPassword,
  });
};

/**
 * @param string
 *          sessionId
 * @return Promise
 */
const sessionLogout = (server, sessionId) => {
  return avPOST( server.concat('/app/WebAPI/session/logout'), {}, getSessionCookieHeader( sessionId ) );
};

/**
 * @param string
 *          sessionId
 * @return Promise
 */
const getSessionCustomer = (server, sessionId) => {
  return avPOST( server.concat('/app/WebAPI/session'), {
    'GET': ['uuid', 'first_name', 'last_name', 'session_language'],
  }, getSessionCookieHeader( sessionId ) );
};

/**
 * @param array
 *          params
 * @return object
 */
const createQueryResultMemberParameters = ( params, offset = 0 ) => {
  return params.reduce(( result, item, idx ) => {
    for ( let key in item ) {
      result["SET::Query::ResultMember::" + ( idx + offset + 1 ).toString().concat( '::', key )] = item[key].toString();
    }
    return result;
  }, {});
};

/**
 * @param array
 *          clauses
 * @param string
 *          name
 * @param string
 *          value
 * @param string
 *          type
 * @param string
 *          oper
 * @return void
 */
const addClause = ( criteria, name, value, oper = '=', type = 'matchCondition', func = null ) => {
  const length = ( criteria.clauses.length + 1 ).toString();

  const clause = {};
  clause['SET::Query::Clause::' + length + '::name'] = name;
  clause['SET::Query::Clause::' + length + '::value'] = value;
  clause['SET::Query::Clause::' + length + '::type'] = type;
  clause['SET::Query::Clause::' + length + '::oper'] = oper;

  if (func !== null) {
    clause['SET::Query::Clause::' + length + '::aggregate_oper'] = func;
  }
  
  criteria.clauses.push( clause );
};

/**
 * @param array
 *          filters
 * @param string
 *          name
 * @param string
 *          value
 * @param string
 *          type
 * @param string
 *          oper
 * @return void
 */
const addFilter = ( criteria, name, value, oper = '=', type = 'matchCondition' ) => {
  const length = ( criteria.filters.length + 1 ).toString();

  const filter = {};
  filter['SET::Query::Filter::' + length + '::name'] = name;
  filter['SET::Query::Filter::' + length + '::value'] = value;
  filter['SET::Query::Filter::' + length + '::type'] = type;
  filter['SET::Query::Filter::' + length + '::oper'] = oper;

  criteria.filters.push( filter );
};

/**
 * @param object
 * @return Promise
 */
const searchQuery = ({ server, entity, onEntity, sessionId }) => {
 
  return onEntity( ( resultParams, onSearchResponse ) => {
    resultParams['action'] = 'search';
 
    const requestParams = Object.assign({ 'SET::Search::object': entity }, resultParams);
    // console.log('--- resultParams', requestParams);
    
    console.log('---', requestParams);
    
    return avPOST( server.concat('/app/WebAPI/v2/search'), requestParams, getSessionCookieHeader( sessionId ) )
    .then( response => {
      // console.log('--- resultResponse', response);
      return response;
    })
    .then( onSearchResponse )
    .catch( error => {
      // console.log('search', error);
      throw error;
    });
  });
  
};

/**
 * @param object
 * @return Promise
 */
const updateQuery = ( { BO, handle, onLoad, sessionId } ) => {
  const update = (createBoRes) => {
    return onLoad(( updateParams, onUpdateResponse ) => {
      return avPOST( '/app/WebAPI/object/' + handle + '/update', updateParams, getSessionCookieHeader( sessionId ) )
      .then( onUpdateResponse );      
    });
  }

  return checkBO( sessionId, handle )
  .then( update )
  .catch( error => {
    switch ( error.status ) {
    case '2':
      return createBO( sessionId, handle, BO )
      .then( update );
      break;
    default:
      throw error;
    }
  });
};

/**
 * @param string
 *          sessionId
 * @param object
 *          params
 * @return Promise
 */
const customers = ( server, sessionId, params ) => {

  // console.log(params, 'hehe');

  return searchQuery( {
    server: server,
    sessionId: sessionId,
    entity: 'ts_customer',
    onEntity: ( doSearch ) => {

      let idOption = 1;
      if (!params.hasOwnProperty('search') || params.search === null || params.search.length == 0) {
        switch ( params.sortType ) {
        case 'sortByLifetimeGiving':
        case 'sortByPledgesOutstanding':
        case 'sortByLifetimeSpend':
        case 'sortByEventsAttended':
          idOption = 5; // Grouped
          break;
        }
      }
      // default alphabetical

      let order = 0;
      const resultParams = createQueryResultMemberParameters([{
        name: 'customer_id',
        order: ++order,
        option: idOption
      }, {
        name: 'customer_number',
        order: ++order,
      }, {
        name: 'customer_value',
        order: ++order,
      }, {
        name: 'customer_organization_name',
        order: ++order,
      }, {
        name: 'customer_active_date',
        order: ++order,
      }, {
        name: 'DefaultContact.contact_first_name',
        order: ++order,
      }, {
        name: 'DefaultContact.contact_last_name',
        order: ++order,
      }, {
        name: 'DefaultContact.contact_email',
        order: ++order,
      }, {
        name: 'DefaultContact.contact_gender',
        order: ++order,
      }, {
        name: 'DefaultContact.contact_birth_date',
        order: ++order,
      }, {
        name: 'DefaultContact.contact_language',
        order: ++order,
      }, {
        name: 'DefaultContact.contact_company',
        order: ++order,
      }, {
        name: 'DefaultContact.contact_phone_number1',
        order: ++order,
      }, {
        name: 'DefaultContact.contact_phone_number2',
        order: ++order,
      }, {
        name: 'DefaultContact.contact_phone_number3',
        order: ++order,
      }, {
        name: 'DefaultAddress.address_city',
        order: ++order,
      }, {
        name: 'DefaultAddress.address_state',
        order: ++order,
      }, {
        name: 'DefaultAddress.address_country',
        order: ++order,
      }, {
        name: 'DefaultAddress.address_verification_state',
        order: ++order,
      }, {
        name: 'DefaultAddress.address_latitude',
        order: ++order,
      }, {
        name: 'DefaultAddress.address_longitude',
        order: ++order,
      }] );

      // now filters
      const criteria = { clauses: [], filters: [] };
      
      // check favourites
      if (params.hasOwnProperty('favourites') && params.favourites.length > 0) {
        addClause( criteria, 'customer_id', params.favourites);
      }
      
      // grouping options / filters
      if ( idOption > 1 ) {
        switch ( params.sortType ) {
        case 'sortByLifetimeGiving':
          Object.assign( resultParams, createQueryResultMemberParameters( [{
            name: 'Order.OrderGift.ordergift_pledge_paid_amount_delta',
            // name: 'Order.order_total_gift_amount', // query never returns
            order: ++order,
            'function': 104, // SUM
            option: params.sortDirection === 'DESC' ? 2 : 1 
          }], order - 1 ) ); // offset by 16 based on above additions

          break;
//        case 'sortByPledgesOutstanding':
//          break;
        case 'sortByLifetimeSpend':
          Object.assign( resultParams, createQueryResultMemberParameters( [{
            name: 'Order.order_total_net_delta', // OrderPayment.orderpayment_transaction_amount',
            order: ++order,
            'function': 104, // SUM
            option: params.sortDirection === 'DESC' ? 2 : 1 
          }], order - 1 ) ); // offset by 16 based on above additions

          break;
        case 'sortByEventsAttended':
          Object.assign( resultParams, createQueryResultMemberParameters( [{
            name: 'Order.Ticket.ticket_id',
            order: ++order,
            'function': 101, // COUNT
            option: params.sortDirection === 'DESC' ? 2 : 1 
          }], order - 1 ) ); // offset by 16 based on above additions
          
          addClause( criteria, 'Order.Ticket.ticket_status', [5,7]);
          break;
        }
      }
      
      // if not search.. check filters
      if ( params.hasOwnProperty( 'filters' ) ) {
        if (params.filters.hasOwnProperty('filterByFundraising')) {
          if (params.filters.filterByFundraising.amountMin !== null && params.filters.filterByFundraising.amountMax !== null) {
            addClause( criteria, 'Order.OrderGift.ordergift_pledge_paid_amount_delta', [
              params.filters.filterByFundraising.amountMin,
              params.filters.filterByFundraising.amountMax
            ], 'A<=X<=B', 'matchCondition', 104);
          }
          else if (params.filters.filterByFundraising.amountMin === null && params.filters.filterByFundraising.amountMax !== null) {
        	addClause( criteria, 'Order.OrderGift.ordergift_pledge_paid_amount_delta', params.filters.filterByFundraising.amountMax, '<=', 'matchCondition', 104);
          }
          else if (params.filters.filterByFundraising.amountMin !== null && params.filters.filterByFundraising.amountMax === null) {
        	addClause( criteria, 'Order.OrderGift.ordergift_pledge_paid_amount_delta', params.filters.filterByFundraising.amountMin, '>=', 'matchCondition', 104);
          }
        }
        
        if (params.filters.hasOwnProperty('filterBySpend')) {
          if (params.filters.filterBySpend.amountMin !== null && params.filters.filterBySpend.amountMax !== null) {
            addClause( criteria, 'Order.order_total_net_delta', [ // OrderPayment.orderpayment_transaction_amount', [
              params.filters.filterBySpend.amountMin,
              params.filters.filterBySpend.amountMax
            ], 'A<=X<=B', 'matchCondition', 104);
          }
          else if (params.filters.filterBySpend.amountMin === null && params.filters.filterBySpend.amountMax !== null) {
          
            addClause( criteria, 'Order.order_total_net_delta', params.filters.filterBySpend.amountMax, '<=', 'matchCondition', 104);
        	// addClause( criteria, 'Order.OrderPayment.orderpayment_transaction_amount', params.filters.filterBySpend.amountMax, '<=', 'matchCondition', 104);
          }
          else if (params.filters.filterBySpend.amountMin !== null && params.filters.filterBySpend.amountMax === null) {
        	addClause( criteria, 'Order.order_total_net_delta', params.filters.filterBySpend.amountMin, '>=', 'matchCondition', 104);
        	// addClause( criteria, 'Order.OrderPayment.orderpayment_transaction_amount', params.filters.filterBySpend.amountMin, '>=', 'matchCondition', 104);
          }
        }
        
        if (params.filters.hasOwnProperty('filterByEvents')) {
          if (params.filters.filterByEvents.min >= 0 && params.filters.filterByEvents.max) {
            addClause( criteria, 'Order.Ticket.ticket_id', [
              params.filters.filterByEvents.min,
              params.filters.filterByEvents.max
            ], 'A<=X<=B', 'matchCondition', 101);
          }
          else if (params.filters.filterByEvents.min === null && params.filters.filterByEvents.max !== null) {
      	    addClause( criteria, 'Order.Ticket.ticket_id', params.filters.filterByEvents.max, '<=', 'matchCondition', 101);
          }
          else if (params.filters.filterByEvents.min !== null && params.filters.filterByEvents.max === null) {
      	    addClause( criteria, 'Order.Ticket.ticket_id', params.filters.filterByEvents.min, '>=', 'matchCondition', 101);
          }
        }

        /*
        if ( params.filters.hasOwnProperty( 'filterByEvents' ) ) {

          let min = Number( params.filters.filterByEvents.min );
          let max = Number( params.filters.filterByEvents.max );

          if ( max > min || min > 0 ) {
            Object.assign( resultParams, createQueryResultMemberParameters( [{
              name: 'Order.OrderAdmission.Ticket.ticket_id',
              order: ++order,
              'function': 101 // 104 = SUM // 101 = COUNT
            }], order - 1 ) ); // offset by 16 based on above
            // additions

            // addClause(criteria,
            // 'Order.OrderAdmission.Ticket.Customer.customerid',
            // params.customerId);
            addFilter( criteria, 'Order.OrderAdmission.Ticket.ticket_id', min, '>' );
          }
        }
        */

        if ( params.filters.hasOwnProperty( 'filterByProfile' ) && params.filters.filterByProfile.customerTags.length > 0 ) {
          // addClause( criteria, 'Keywords.customerkeyword_keyword', params.filters.filterByProfile.customerTags, 'hasValue', 'hasValue' );
          addClause( criteria, 'Keywords.customerkeyword_keyword', params.filters.filterByProfile.customerTags );
        }
      }        
      
      // if searching
      if (params.hasOwnProperty('search') && params.search !== null) {        
        // we may be able to split the name into two or more.. if two or more.. use first and use last only
        const names = params.search.split(' ');
        if (names.length > 1) {
          const contains = [
            names[0].concat('%'), 
            names[names.length - 1].concat('%')
          ];
          
          addClause( criteria, 'DefaultContact.contact_first_name', contains, 'CONTAINS');
          addClause( criteria, 'DefaultContact.contact_last_name', contains, 'CONTAINS');
        }
        else if (names.length > 0) {
          addClause( criteria, 'DefaultContact.contact_first_name', names[0].concat('%'), 'CONTAINS');
          // addClause( criteria, 'DefaultContact.contact_last_name', '', 'CONTAINS');
        }
      }

      // add criteria to resultParams
      criteria.clauses.forEach( criterion => {
        Object.assign( resultParams, criterion );
      });

      // add filters to resultParams
      criteria.filters.forEach( criterion => {
        Object.assign( resultParams, criterion );
      });

      if ( params.hasOwnProperty( 'pageSize' ) ) {
        resultParams['SET::Search::page_size'] = params.pageSize;
      }
      if ( params.hasOwnProperty( 'page' ) ) {
        resultParams['SET::Query::current_page'] = params.page;
      }
      // resultParams['SET::Query::max_rows'] = '5000';
      resultParams['GET'] = ['Result', 'Query::total_records', 'Query::current_page'];
      resultParams['ACCEPTWARNING'] = '4276'; // error otherwise

      // Order By ?
      if (idOption === 1) {
        switch ( params.sortType ) {
        case 'sortByAlpha':
        
	      Object.assign( resultParams, {
	        "SET::Query::OrderBy::1::name" : 'DefaultContact.contact_last_name',
	        "SET::Query::OrderBy::1::type" : params.sortDirection
	      });
	      Object.assign( resultParams, {
	        "SET::Query::OrderBy::2::name" : 'DefaultContact.contact_first_name',
	        "SET::Query::OrderBy::2::type" : params.sortDirection
	      });
	      break;
        case 'sortByActivity':        
          Object.assign( resultParams, {
            "SET::Query::OrderBy::1::name" : 'customer_active_date',
            "SET::Query::OrderBy::1::type" : params.sortDirection
          });
          break;
        }
      }
            
      // console.log(resultParams);
      
      return doSearch( resultParams, ( search ) => {
        return Object.keys( search.Result ).reduce(( result, idx ) => {
          if ( Number.isNaN( Number( idx ) ) ) {
            return result;
          }
          const row = search.Result[idx];

          const data = {
              customerid: row['customer_id'].standard,
              customernumber: row['customer_number'].display,
              customervalue: row['customer_value'].display,
              organization: row['customer_organization_name'].display,
              firstname: row['DefaultContact.contact_first_name'].display,
              lastname: row['DefaultContact.contact_last_name'].display,
              email: row['DefaultContact.contact_email'].display,
              gender: row['DefaultContact.contact_gender'].display,
              birthdate: row['DefaultContact.contact_birth_date'].display,
              language: row['DefaultContact.contact_language'].display,
              company: row['DefaultContact.contact_company'].display,
              phone1: row['DefaultContact.contact_phone_number1'].display,
              phone2: row['DefaultContact.contact_phone_number2'].display,
              phone3: row['DefaultContact.contact_phone_number3'].display,
              addresscity: row['DefaultAddress.address_city'].display,
              addressstate: row['DefaultAddress.address_state'].display,
              addresscountry: row['DefaultAddress.address_country'].display,
              addressverified: row['DefaultAddress.address_verification_state'].display,
              addresslat: row['DefaultAddress.address_latitude'].display,
              addresslng: row['DefaultAddress.address_longitude'].display,
              sortValue: null,
              hashCode: hashCode(row['customer_id'].standard)
          };

          if ( idOption > 1 ) {
            switch ( params.sortType ) {
            case 'sortByLifetimeGiving':
              Object.assign( data, {
                sortValue: ACC.formatMoney(Math.trunc(row['Order.OrderGift.ordergift_pledge_paid_amount_delta'].standard), { symbol: '$', format: "%s%v", precision: 0 }) 
                // sortValue: row['Order.OrderGift.ordergift_pledge_paid_amount'].display 
              });
              break;
//            case 'sortByPledgesOutstanding':
//              Object.assign( data, { sortValue: '0' });
//              break;
            case 'sortByLifetimeSpend':
              Object.assign( data, {
                // sortValue: ACC.formatMoney(Math.trunc(row['Order.OrderPayment.orderpayment_transaction_amount'].standard), { symbol: '$', format: "%s%v", precision: 0 })
                sortValue: ACC.formatMoney(Math.trunc(row['Order.order_total_net_delta'].standard), { symbol: '$', format: "%s%v", precision: 0 })                 
                // sortValue: row['Order.OrderPayment.orderpayment_transaction_amount'].display 
              });
              break;
            case 'sortByEventsAttended':
              Object.assign( data, {
                sortValue: row['Order.Ticket.ticket_id'].display 
              });
              break;
            }
          }

          result.data.push( data );
          return result;
        }, {
          total: search.hasOwnProperty('total_records') ? Number( search.total_records.standard ) : 0,
          page: search.hasOwnProperty('current_page') ? Number( search.current_page.standard ) : params.page,
          data: []
        });
      });
    }
  });
};

const customer = ( server, sessionId, params ) => {

  return searchQuery( {
    server: server,
    sessionId: sessionId,
    entity: 'ts_customer',
    onEntity: ( doSearch ) => {

      let order = 0;
      const resultParams = createQueryResultMemberParameters([{
        name: 'customer_id',
        order: ++order,
      }, {
        name: 'customer_number',
        order: ++order,
      }, {
        name: 'customer_value',
        order: ++order,
      }, {
        name: 'customer_organization_name',
        order: ++order,
      }, {
        name: 'customer_active_date',
        order: ++order,
      }, {
        name: 'DefaultContact.contact_first_name',
        order: ++order,
      }, {
        name: 'DefaultContact.contact_last_name',
        order: ++order,
      }, {
        name: 'DefaultContact.contact_email',
        order: ++order,
      }, {
        name: 'DefaultContact.contact_gender',
        order: ++order,
      }, {
        name: 'DefaultContact.contact_birth_date',
        order: ++order,
      }, {
        name: 'DefaultContact.contact_language',
        order: ++order,
      }, {
        name: 'DefaultContact.contact_company',
        order: ++order,
      }, {
        name: 'DefaultContact.contact_phone_number1',
        order: ++order,
      }, {
        name: 'DefaultContact.contact_phone_number2',
        order: ++order,
      }, {
        name: 'DefaultContact.contact_phone_number3',
        order: ++order,
      }, {
        name: 'DefaultAddress.address_city',
        order: ++order,
      }, {
        name: 'DefaultAddress.address_state',
        order: ++order,
      }, {
        name: 'DefaultAddress.address_country',
        order: ++order,
      }, {
        name: 'DefaultAddress.address_verification_state',
        order: ++order,
      }, {
        name: 'DefaultAddress.address_latitude',
        order: ++order,
      }, {
        name: 'DefaultAddress.address_longitude',
        order: ++order,
      }] );

      // now filters
      const criteria = { clauses: [], filters: [] };
      
      addClause( criteria, 'customer_id', params.customerid);
      
      // add criteria to resultParams
      criteria.clauses.forEach( criterion => {
        Object.assign( resultParams, criterion );
      });

      // resultParams['SET::Query::max_rows'] = '5000';
      resultParams['GET'] = ['Result'];
      resultParams['ACCEPTWARNING'] = '4276'; // error otherwise

      return doSearch( resultParams, ( search ) => {
        return Object.keys( search.Result ).reduce(( result, idx ) => {
          if ( Number.isNaN( Number( idx ) ) ) {
            return result;
          }
          const row = search.Result[idx];

          const data = {
              customerid: row['customer_id'].standard,
              customernumber: row['customer_number'].display,
              customervalue: row['customer_value'].display,
              organization: row['customer_organization_name'].display,
              firstname: row['DefaultContact.contact_first_name'].display,
              lastname: row['DefaultContact.contact_last_name'].display,
              email: row['DefaultContact.contact_email'].display,
              gender: row['DefaultContact.contact_gender'].display,
              birthdate: row['DefaultContact.contact_birth_date'].display,
              language: row['DefaultContact.contact_language'].display,
              company: row['DefaultContact.contact_company'].display,
              phone1: row['DefaultContact.contact_phone_number1'].display,
              phone2: row['DefaultContact.contact_phone_number2'].display,
              phone3: row['DefaultContact.contact_phone_number3'].display,
              addresscity: row['DefaultAddress.address_city'].display,
              addressstate: row['DefaultAddress.address_state'].display,
              addresscountry: row['DefaultAddress.address_country'].display,
              addressverified: row['DefaultAddress.address_verification_state'].display,
              addresslat: row['DefaultAddress.address_latitude'].display,
              addresslng: row['DefaultAddress.address_longitude'].display,
              hashCode: hashCode(row['customer_id'].standard)
          };

          Object.assign( result, data );

          return result;
        }, { });
      });
    }
  });
};

/**
 * 
 */
const favouritesAttending = ( server, sessionId, params ) => {

  if (params.personFavourites.length === 0) {
    return new Promise((resolve, reject) => {
      resolve({
        data: [],
        total: 0,
        page: 0
      }); 
    });
  }
       
  return searchQuery( {
    server: server,
    sessionId: sessionId,
    entity: 'ts_customer',
    onEntity: ( doSearch ) => {

      let order = 0;
      const resultParams = createQueryResultMemberParameters( [{
        name: 'customer_id',
        order: ++order,
        option: 5 // grouped
      }, {
        name: 'Order.OrderAdmission.Performance.performance_id',
        order: ++order,
        option: 5 // grouped
      }, {
        name: 'Order.OrderAdmission.Performance.performance_name',
        order: ++order,
      }, {
        name: 'Order.OrderAdmission.Performance.performance_start_date',
        order: ++order,
      }, {
        name: 'customer_organization_name',
        order: ++order,
      }, {
        name: 'DefaultContact.contact_company',
        order: ++order,
      }, {
        name: 'DefaultContact.contact_first_name',
        order: ++order,
      }, {
        name: 'DefaultContact.contact_last_name',
        order: ++order,
      }, {
        name: 'DefaultContact.contact_email',
        order: ++order,
      }, {
        name: 'DefaultContact.contact_phone_number1',
        order: ++order,
      }, {
        name: 'DefaultContact.contact_phone_number2',
        order: ++order,
      }, {
        name: 'DefaultContact.contact_phone_number3',
        order: ++order,
      }/*, {
        name: 'OrderAdmission.Seat.seat_aisle',
        order: ++order,
      }, {
        name: 'OrderAdmission.Seat.seat_row',
        order: ++order,
      }, {
        name: 'OrderAdmission.Seat.seat_seat',
        order: ++order,
      }*/] );

      // now filters
      const criteria = { clauses: [] };
      
      // events occurring today
      addClause( criteria, 'Order.OrderAdmission.Performance.performance_start_date', Moment().format('YYYY-MM-DDT00:00:00.000'), '>=', 'matchCondition');
      addClause( criteria, 'Order.OrderAdmission.Performance.performance_start_date', Moment().format('YYYY-MM-DDT23:59:59.999'), '<=', 'matchCondition');

      // only favourite customer ids
      addClause( criteria, 'customer_id', params.personFavourites);
      
      // add criteria to resultParams
      criteria.clauses.forEach( criterion => {
        Object.assign( resultParams, criterion );
      });

      if ( params.hasOwnProperty( 'pageSize' ) ) {
        resultParams['SET::Search::page_size'] = params.pageSize;
      }
      if ( params.hasOwnProperty( 'page' ) ) {
        resultParams['SET::Query::current_page'] = params.page;
      }
      // resultParams['SET::Query::max_rows'] = '5000';
      resultParams['GET'] = ['Result'];//, 'Query::total_records', 'Query::current_page'];
      resultParams['ACCEPTWARNING'] = '4276'; // error otherwise
      
      return doSearch( resultParams, ( search ) => {
        
        return Object.keys( search.Result ).reduce(( result, idx ) => {
          if ( Number.isNaN( Number( idx ) ) ) {
            return result;
          }
          const row = search.Result[idx];

          const data = {
              id: 'customer_id_'+row['customer_id'].standard+'_'+row['Order.OrderAdmission.Performance.performance_id'].standard,
              customer_id: row['customer_id'].display,
              firstname: row['DefaultContact.contact_first_name'].display,
              lastname: row['DefaultContact.contact_last_name'].display,
              organization: row['customer_organization_name'].display,
              company: row['DefaultContact.contact_company'].display,
              email: row['DefaultContact.contact_email'].display,
              phone1: row['DefaultContact.contact_phone_number1'].display,
              phone2: row['DefaultContact.contact_phone_number2'].display,
              phone3: row['DefaultContact.contact_phone_number3'].display,
              performance_name: row['Order.OrderAdmission.Performance.performance_name'].display,
              performance_date: row['Order.OrderAdmission.Performance.performance_start_date'].display,
              // venue_name: row['Order.OrderAdmission.Performance.Venue.venue_name'].display,
              
              // aisle: row['Order.OrderAdmission.Seat.seat_aisle'].display,
              // row: row['Order.OrderAdmission.Seat.seat_row'].display,
              // seat: row['Order.OrderAdmission.Seat.seat_seat'].display,
              insightclass: 'people',
              hashCode: hashCode(row['customer_id'].standard)
          };
                                                                                   
          result.data.push( data );
          return result;
        }, {
          total: search.hasOwnProperty('total_records') ? Number( search.total_records.standard ) : 0,
          page: search.hasOwnProperty('current_page') ? Number( search.current_page.standard ) : params.page,
          data: []
        });
      });
    }
  });
};

const favouritesBoughtAdmissions = ( server, sessionId, params ) => {
  if (params.personFavourites.length === 0) {
    return new Promise((resolve, reject) => {
      resolve({
        data: [],
        total: 0,
        page: 0
      }); 
    });
  }
   
  return searchQuery( {
    server: server,
    sessionId: sessionId,
    entity: 'ts_customer',
    onEntity: ( doSearch ) => {

      let order = 0;
      const resultParams = createQueryResultMemberParameters( [{
        name: 'customer_id',
        order: ++order,
        option: 5 // grouped
      }, {
        name: 'Order.OrderAdmission.Performance.performance_id',
        order: ++order,
        option: 5 // grouped
      }, {
        name: 'Order.OrderAdmission.Performance.performance_name',
        order: ++order,
      }, {
        name: 'Order.OrderAdmission.Performance.performance_start_date',
        order: ++order,
      }, {
        name: 'customer_organization_name',
        order: ++order,
      }, {
        name: 'DefaultContact.contact_company',
        order: ++order,
      }, {
        name: 'DefaultContact.contact_first_name',
        order: ++order,
      }, {
        name: 'DefaultContact.contact_last_name',
        order: ++order,
      }] );

      // now filters
      const criteria = { clauses: [] };
      
      // events occurring today
      addClause( criteria, 'Order.order_invoice_date', Moment().format('YYYY-MM-DDT00:00:00.000'), '>=', 'matchCondition');
      addClause( criteria, 'Order.order_invoice_date', Moment().format('YYYY-MM-DDT23:59:59.999'), '<=', 'matchCondition');

      // only favourite customer ids
      addClause( criteria, 'customer_id', params.personFavourites);
      
      // add criteria to resultParams
      criteria.clauses.forEach( criterion => {
        Object.assign( resultParams, criterion );
      });

      if ( params.hasOwnProperty( 'pageSize' ) ) {
        resultParams['SET::Search::page_size'] = params.pageSize;
      }
      if ( params.hasOwnProperty( 'page' ) ) {
        resultParams['SET::Query::current_page'] = params.page;
      }
      // resultParams['SET::Query::max_rows'] = '5000';
      resultParams['GET'] = ['Result', 'Query::total_records', 'Query::current_page'];
      resultParams['ACCEPTWARNING'] = '4276'; // error otherwise
      
      return doSearch( resultParams, ( search ) => {        
        return Object.keys( search.Result ).reduce(( result, idx ) => {
          if ( Number.isNaN( Number( idx ) ) ) {
            return result;
          }
          const row = search.Result[idx];

          const data = {
              id: 'customer_id_'+row['customer_id'].standard+'_'+row['Order.OrderAdmission.Performance.performance_id'].standard,
              customer_id: row['customer_id'].display,
              firstname: row['DefaultContact.contact_first_name'].display,
              lastname: row['DefaultContact.contact_last_name'].display,
              organization: row['customer_organization_name'].display,
              company: row['DefaultContact.contact_company'].display,
              performance_name: row['Order.OrderAdmission.Performance.performance_name'].display,
              performance_date: row['Order.OrderAdmission.Performance.performance_start_date'].display,
              // venue_name: row['Order.OrderAdmission.Performance.Venue.venue_name'].display,
              
              // aisle: row['Order.OrderAdmission.Seat.seat_aisle'].display,
              // row: row['Order.OrderAdmission.Seat.seat_row'].display,
              // seat: row['Order.OrderAdmission.Seat.seat_seat'].display,
              insightclass: 'favouritesBoughtAdmissions',
              hashCode: hashCode(row['customer_id'].standard)
          };
                                                                                   
          result.data.push( data );
          return result;
        }, {
          total: search.hasOwnProperty('total_records') ? Number( search.total_records.standard ) : 0,
          page: search.hasOwnProperty('current_page') ? Number( search.current_page.standard ) : params.page,
          data: []
        });
      });
    }
  });
};

const favouritesDonated = ( server, sessionId, params ) => {
  if (params.personFavourites.length === 0) {
    return new Promise((resolve, reject) => {
      resolve({
        data: [],
        total: 0,
        page: 0
      }); 
    });
  } 
  return searchQuery( {
    server: server,
    sessionId: sessionId,
    entity: 'ts_customer',
    onEntity: ( doSearch ) => {

      let order = 0;
      const resultParams = createQueryResultMemberParameters( [{
        name: 'customer_id',
        order: ++order,
        option: 5 // grouped
      }, {
        name: 'Order.OrderGift.ordergift_pledge_paid_amount_delta',
        order: ++order,
        'function': 104 // SUM
      }, {
        name: 'customer_organization_name',
        order: ++order,
      }, {
        name: 'DefaultContact.contact_company',
        order: ++order,
      }, {
        name: 'DefaultContact.contact_first_name',
        order: ++order,
      }, {
        name: 'DefaultContact.contact_last_name',
        order: ++order,
      }] );

      // now filters
      const criteria = { clauses: [] };
      
      // events occurring today
      addClause( criteria, 'Order.order_invoice_date', Moment().format('YYYY-MM-DDT00:00:00.000'), '>=', 'matchCondition');
      addClause( criteria, 'Order.order_invoice_date', Moment().format('YYYY-MM-DDT23:59:59.999'), '<=', 'matchCondition');

      // only favourite customer ids
      addClause( criteria, 'customer_id', params.personFavourites);
      
      // add criteria to resultParams
      criteria.clauses.forEach( criterion => {
        Object.assign( resultParams, criterion );
      });

      if ( params.hasOwnProperty( 'pageSize' ) ) {
        resultParams['SET::Search::page_size'] = params.pageSize;
      }
      if ( params.hasOwnProperty( 'page' ) ) {
        resultParams['SET::Query::current_page'] = params.page;
      }
      // resultParams['SET::Query::max_rows'] = '5000';
      resultParams['GET'] = ['Result', 'Query::total_records', 'Query::current_page'];
      resultParams['ACCEPTWARNING'] = '4276'; // error otherwise
      
      return doSearch( resultParams, ( search ) => {        
        return Object.keys( search.Result ).reduce(( result, idx ) => {
          if ( Number.isNaN( Number( idx ) ) ) {
            return result;
          }
          const row = search.Result[idx];

          const data = {
              id: 'customer_id_'+row['customer_id'].standard,
              customer_id: row['customer_id'].display,
              firstname: row['DefaultContact.contact_first_name'].display,
              lastname: row['DefaultContact.contact_last_name'].display,
              organization: row['customer_organization_name'].display,
              company: row['DefaultContact.contact_company'].display,
              amount: row['Order.OrderGift.ordergift_pledge_paid_amount_delta'].display,
              insightclass: 'favouritesDonated',
              hashCode: hashCode(row['customer_id'].standard)
          };
                                                                                   
          result.data.push( data );
          return result;
        }, {
          total: search.hasOwnProperty('total_records') ? Number( search.total_records.standard ) : 0,
          page: search.hasOwnProperty('current_page') ? Number( search.current_page.standard ) : params.page,
          data: []
        });
      });
    }
  });
};

/**
 * Total Sales and Revenue Amount 
 */
const eventFavouritesYesterdaySummary = ( server, sessionId, params ) => {
  if (params.eventFavourites.length === 0) {
    return new Promise((resolve, reject) => {
      resolve({
        data: [],
        total: 0,
        page: 0
      }); 
    });
  } 
  return searchQuery( {
    server: server,
    sessionId: sessionId,
    entity: 'ts_performance',
    onEntity: ( doSearch ) => {

      let order = 0;
      const resultParams = createQueryResultMemberParameters( [{
        name: 'performance_id',
        order: ++order,
        option: 5 // grouped
      }, {
        name: 'Admission.admission_id',
        order: ++order,
        'function': 101 // COUNT       
      }, {
        name: 'OrderAdmission.orderadmission_id',
        order: ++order,
        'function': 101 // COUNT       
      }, {
        name: 'OrderAdmission.orderadmission_net_paid_delta',
        order: ++order,
        'function': 104 // SUM
      }, {
        name: 'performance_name',
        order: ++order,
      }, {
        name: 'performance_short_description',
        order: ++order,
      }, {
        name: 'performance_start_date',
        order: ++order,
      }, {
        name: 'performance_logo1',
        order: ++order,
      }, {
        name: 'performance_logo2',
        order: ++order,
      }] );

      // now filters
      const criteria = { clauses: [] };
      
      // events occurring today
      addClause( criteria, 'OrderAdmission.Order.order_invoice_date', Moment().subtract(-1, 'day').format('YYYY-MM-DDT00:00:00.000'), '>=', 'matchCondition');
      addClause( criteria, 'OrderAdmission.Order.order_invoice_date', Moment().subtract(-1, 'day').format('YYYY-MM-DDT23:59:59.999'), '<=', 'matchCondition');

      // only favourite event ids
      addClause( criteria, 'performance_id', params.eventFavourites);
      
      // add criteria to resultParams
      criteria.clauses.forEach( criterion => {
        Object.assign( resultParams, criterion );
      });

      if ( params.hasOwnProperty( 'pageSize' ) ) {
        resultParams['SET::Search::page_size'] = params.pageSize;
      }
      if ( params.hasOwnProperty( 'page' ) ) {
        resultParams['SET::Query::current_page'] = params.page;
      }
      // resultParams['SET::Query::max_rows'] = '5000';
      resultParams['GET'] = ['Result', 'Query::total_records', 'Query::current_page'];
      resultParams['ACCEPTWARNING'] = '4276'; // error otherwise
      
      return doSearch( resultParams, ( search ) => {        
        return Object.keys( search.Result ).reduce(( result, idx ) => {
          if ( Number.isNaN( Number( idx ) ) ) {
            return result;
          }
          const row = search.Result[idx];

          const data = {
              id: 'eventFavouritesYesterdaySummary_performance_id_'+row['performance_id'].standard,
              event_id: row['performance_id'].standard,
              eventname: row['performance_name'].display,
              eventdesc: row['performance_short_description'].display,
              eventstart: row['performance_start_date'].standard,
              soldSeatCount: row['OrderAdmission.orderadmission_id'].standard,
              totalSeatCount: row['Admission.admission_id'].standard,
              amount: row['OrderAdmission.orderadmission_net_paid_delta'].display,
              logoOne: row['performance_logo1'].standard,
              logoTwo: row['performance_logo2'].standard,
              insightclass: 'eventFavouritesYesterdaySummary',
              hashCode: hashCode(row['performance_id'].standard)
          };
                                                                                   
          result.data.push( data );
          return result;
        }, {
          total: search.hasOwnProperty('total_records') ? Number( search.total_records.standard ) : 0,
          page: search.hasOwnProperty('current_page') ? Number( search.current_page.standard ) : params.page,
          data: []
        });
      });
    }
  });
};

const eventTodaySummary = ( server, sessionId, params ) => { 
  return searchQuery( {
    server: server,
    sessionId: sessionId,
    entity: 'ts_performance',
    onEntity: ( doSearch ) => {

      let order = 0;
      const resultParams = createQueryResultMemberParameters( [{
        name: 'performance_id',
        order: ++order,
        option: 5 // grouped
      }, {
        name: 'Admission.admission_id',
        order: ++order,
        'function': 101 // COUNT       
      }, {
        name: 'OrderAdmission.orderadmission_id',
        order: ++order,
        'function': 101 // COUNT       
      }, {
        name: 'OrderAdmission.orderadmission_net_paid_delta',
        order: ++order,
        'function': 104 // SUM
      }, {
        name: 'performance_name',
        order: ++order,
      }, {
        name: 'performance_short_description',
        order: ++order,
      }, {
        name: 'performance_start_date',
        order: ++order,
      }, {
        name: 'performance_logo1',
        order: ++order,
      }, {
        name: 'performance_logo2',
        order: ++order,
      }/*, {
        name: 'PerformanceSeats.performanceseats_sold_seat_count',
        order: ++order,
      }, {
        name: 'PerformanceSeats.performanceseats_total_seat_count',
        order: ++order,
      }*/] );

      // now filters
      const criteria = { clauses: [] };
      
      // events occurring today
      addClause( criteria, 'performance_start_date', Moment().format('YYYY-MM-DDT00:00:00.000'), '>=', 'matchCondition');
      addClause( criteria, 'performance_start_date', Moment().format('YYYY-MM-DDT23:59:59.999'), '<=', 'matchCondition');

      // only favourite event ids
      addClause( criteria, 'performance_id', params.eventFavourites);
      
      // add criteria to resultParams
      criteria.clauses.forEach( criterion => {
        Object.assign( resultParams, criterion );
      });

      if ( params.hasOwnProperty( 'pageSize' ) ) {
        resultParams['SET::Search::page_size'] = params.pageSize;
      }
      if ( params.hasOwnProperty( 'page' ) ) {
        resultParams['SET::Query::current_page'] = params.page;
      }
      // resultParams['SET::Query::max_rows'] = '5000';
      resultParams['GET'] = ['Result', 'Query::total_records', 'Query::current_page'];
      resultParams['ACCEPTWARNING'] = '4276'; // error otherwise
      
      return doSearch( resultParams, ( search ) => {              
        return Object.keys( search.Result ).reduce(( result, idx ) => {
          if ( Number.isNaN( Number( idx ) ) ) {
            return result;
          }
          const row = search.Result[idx];
               
          const data = {
              id: 'eventTodaySummary_performance_id_'+row['performance_id'].standard,
              event_id: row['performance_id'].standard,
              eventname: row['performance_name'].display,
              eventdesc: row['performance_short_description'].display,
              eventstart: row['performance_start_date'].standard,
              amount: row['OrderAdmission.orderadmission_net_paid_delta'].display,
              logoOne: row['performance_logo1'].standard,
              logoTwo: row['performance_logo2'].standard,
              soldSeatCount: row['OrderAdmission.orderadmission_id'].standard,
              totalSeatCount: row['Admission.admission_id'].standard, 
              insightclass: 'eventTodaySummary',
              hashCode: hashCode(row['performance_id'].standard)
          };
                                                                                   
          result.data.push( data );
          return result;
        }, {
          total: search.hasOwnProperty('total_records') ? Number( search.total_records.standard ) : 0,
          page: search.hasOwnProperty('current_page') ? Number( search.current_page.standard ) : params.page,
          data: []
        });
      });
    }
  });
};

const eventYesterdaySummary = ( server, sessionId, params ) => { 
  return searchQuery( {
    server: server,
    sessionId: sessionId,
    entity: 'ts_performance',
    onEntity: ( doSearch ) => {

      let order = 0;
      const resultParams = createQueryResultMemberParameters( [{
        name: 'performance_id',
        order: ++order,
        option: 5 // grouped
      }, {
        name: 'Admission.admission_id',
        order: ++order,
        'function': 101
      }, {
        name: 'OrderAdmission.orderadmission_id',
        order: ++order,
        'function': 101 // COUNT       
      }, {
        name: 'OrderAdmission.orderadmission_net_paid_delta',
        order: ++order,
        'function': 104 // SUM
      }, {
        name: 'performance_name',
        order: ++order,
      }, {
        name: 'performance_short_description',
        order: ++order,
      }, {
        name: 'performance_start_date',
        order: ++order,
      }, {
        name: 'performance_logo1',
        order: ++order,
      }, {
        name: 'performance_logo2',
        order: ++order,
      }/*, {
        name: 'PerformanceSeats.performanceseats_sold_seat_count',
        order: ++order,
      }, {
        name: 'PerformanceSeats.performanceseats_total_seat_count',
        order: ++order,
      }*/] );

      // now filters
      const criteria = { clauses: [] };
      
      // events occurring today
      addClause( criteria, 'performance_start_date', Moment().subtract(-1, 'day').format('YYYY-MM-DDT00:00:00.000'), '>=', 'matchCondition');
      addClause( criteria, 'performance_start_date', Moment().subtract(-1, 'day').format('YYYY-MM-DDT23:59:59.999'), '<=', 'matchCondition');

      // only favourite event ids
      addClause( criteria, 'performance_id', params.eventFavourites);
      
      // add criteria to resultParams
      criteria.clauses.forEach( criterion => {
        Object.assign( resultParams, criterion );
      });

      if ( params.hasOwnProperty( 'pageSize' ) ) {
        resultParams['SET::Search::page_size'] = params.pageSize;
      }
      if ( params.hasOwnProperty( 'page' ) ) {
        resultParams['SET::Query::current_page'] = params.page;
      }
      // resultParams['SET::Query::max_rows'] = '5000';
      resultParams['GET'] = ['Result', 'Query::total_records', 'Query::current_page'];
      resultParams['ACCEPTWARNING'] = '4276'; // error otherwise
      
      return doSearch( resultParams, ( search ) => {        
        return Object.keys( search.Result ).reduce(( result, idx ) => {
          if ( Number.isNaN( Number( idx ) ) ) {
            return result;
          }
          const row = search.Result[idx];
               
          const data = {
              id: 'eventYesterdaySummary_performance_id_'+row['performance_id'].standard,
              event_id: row['performance_id'].standard,
              eventname: row['performance_name'].display,
              eventdesc: row['performance_short_description'].display,
              eventstart: row['performance_start_date'].standard,
              amount: row['OrderAdmission.orderadmission_net_paid_delta'].display,
              logoOne: row['performance_logo1'].standard,
              logoTwo: row['performance_logo2'].standard,
              soldSeatCount: row['OrderAdmission.orderadmission_id'].standard,
              totalSeatCount: row['Admission.admission_id'].standard,
              insightclass: 'eventYesterdaySummary',
              hashCode: hashCode(row['performance_id'].standard)
          };
                                                                                   
          result.data.push( data );
          return result;
        }, {
          total: search.hasOwnProperty('total_records') ? Number( search.total_records.standard ) : 0,
          page: search.hasOwnProperty('current_page') ? Number( search.current_page.standard ) : params.page,
          data: []
        });
      });
    }
  });
};

/**
 * @param string
 *          sessionId
 * @param object
 *          params
 * @return Promise
 */
const customerMostRecentOrder = ( server, sessionId, params = {}) => {
  return searchQuery( {
    server: server,
    sessionId: sessionId,
    entity: 'ts_order',
    onEntity: ( doSearch ) => {

      const resultParams = createQueryResultMemberParameters( [{
        name: 'order_number',
        order: 1,
        option: 2, // sort desc
      }, {
        name: 'order_active_date',
        order: 2,
      }] );

      const criteria = { clauses: [] };
      addClause( criteria, 'order_customer_id', params.customerId );
      criteria.clauses.forEach(( item ) => {
        Object.assign( resultParams, item );
      });

      resultParams['SET::Search::page_size'] = 1;
      resultParams['SET::Query::current_page'] = 1;
      resultParams['GET'] = ['Result', 'Query::total_records', 'Query::current_page'];
      resultParams['ACCEPTWARNING'] = '4276'; // error otherwise

      return doSearch( resultParams, ( search ) => {
        return Object.keys( search.Result ).reduce(( result, idx ) => {
          if ( Number.isNaN( Number( idx ) ) ) {
            return result;
          }

          const row = search.Result[idx];
          const activeDate = row['order_active_date'].standard[0].trim();
          result.data['orderActiveDate'] = activeDate;
          return result;
        }, {
          total: search.hasOwnProperty('total_records') ? Number( search.total_records.standard ) : 0,
          page: search.hasOwnProperty('current_page') ? Number( search.current_page.standard ) : params.page,
          data: {}
        });
      });
    }
  });
};

/**
 * @param string
 *          sessionId
 * @param object
 *          params
 * @return Promise
 */
const customerMostRecentGift = ( server, sessionId, params = {}) => {
  return searchQuery( {
    server: server,  
    sessionId: sessionId,
    entity: 'ts_order_gift',
    onEntity: ( doSearch ) => {

      const resultParams = createQueryResultMemberParameters( [{
        name: 'ordergift_pledge_date',
        order: 1,
        option: 2, // sort desc
      }, {
        name: 'ordergift_pledge_amount_delta',
        order: 2,
      }, {
        name: 'ordergift_pledge_paid_amount_delta',
        order: 3,
      }] );

      const criteria = { clauses: [] };
      addClause( criteria, 'Order.order_customer_id', params.customerId );
      criteria.clauses.forEach(( item ) => {
        Object.assign( resultParams, item );
      });

      resultParams['SET::Search::page_size'] = 1;
      resultParams['SET::Query::current_page'] = 1;
      resultParams['GET'] = ['Result', 'Query::total_records', 'Query::current_page'];
      resultParams['ACCEPTWARNING'] = '4276'; // error otherwise

      return doSearch( resultParams, ( search ) => {
        return Object.keys( search.Result ).reduce(( result, idx ) => {
          if ( Number.isNaN( Number( idx ) ) ) {
            return result;
          }

          const row = search.Result[idx];

          const pledgeDate = row['ordergift_pledge_date'].standard[0].trim();
          const pledged = row['ordergift_pledge_amount_delta'].display.trim();
          const pledgePaid = row['ordergift_pledge_paid_amount_delta'].display.trim();

          Object.assign( result.data, {
            pledgeDate, pledged, pledgePaid
          });

          return result;
        }, {
          total: search.hasOwnProperty('total_records') ? Number( search.total_records.standard ) : 0,
          page: search.hasOwnProperty('current_page') ? Number( search.current_page.standard ) : params.page,
          data: {}
        });
      });
    }
  });
};

/**
 * @param string
 *          sessionId
 * @param object
 *          params
 * @return Promise
 */
const customerTotalPledged = ( server, sessionId, params = {}) => {
  return searchQuery( {
    server: server,
    sessionId: sessionId,
    entity: 'ts_order_gift',
    onEntity: ( doSearch ) => {

      let order = 0;
      const resultParams = createQueryResultMemberParameters( [{
        name: 'ordergift_pledge_amount_delta',
        order: ++order,
        'function': 104 // SUM
      }, {
        name: 'ordergift_pledge_currency',
        order: ++order,
      }] );

      const criteria = { clauses: [] };
      addClause( criteria, 'Order.order_customer_id', params.customerId );
      criteria.clauses.forEach(( item ) => {
        Object.assign( resultParams, item );
      });

      resultParams['SET::Search::page_size'] = 1;
      resultParams['SET::Query::current_page'] = 1;
      resultParams['GET'] = ['Result', 'Query::total_records', 'Query::current_page'];
      resultParams['ACCEPTWARNING'] = '4276'; // error otherwise

      return doSearch( resultParams, ( search ) => {
        return Object.keys( search.Result ).reduce(( result, idx ) => {
          if ( Number.isNaN( Number( idx ) ) ) {
            return result;
          }

          const row = search.Result[idx];
          result.data['amount'] = row['ordergift_pledge_amount_delta'].standard;
          result.data['amountFormatted'] = row['ordergift_pledge_amount_delta'].display;
          result.data['amountCurrency'] = row['ordergift_pledge_currency'].standard;

          return result;
        }, {
          total: search.hasOwnProperty('total_records') ? Number( search.total_records.standard ) : 0,
          page: search.hasOwnProperty('current_page') ? Number( search.current_page.standard ) : params.page,
          data: {}
        });
      });
    }
  });
};

/**
 * @param string
 *          sessionId
 * @param object
 *          params
 * @return Promise
 */
const customerTotalPledgedGiven = ( server, sessionId, params = {}) => {
  return searchQuery( {
    server: server,
    sessionId: sessionId,
    entity: 'ts_order_gift',
    onEntity: ( doSearch ) => {

      let order = 0;
      const resultParams = createQueryResultMemberParameters( [{
        name: 'ordergift_pledge_paid_amount_delta',
        order: ++order,
        'function': 104 // SUM
      }, {
        name: 'ordergift_pledge_paid_currency',
        order: ++order,
      }] );
      
      const criteria = { clauses: [] };
      addClause( criteria, 'Order.order_customer_id', params.customerId );
      criteria.clauses.forEach(( item ) => {
        Object.assign( resultParams, item );
      });

      resultParams['SET::Search::page_size'] = 1;
      resultParams['SET::Query::current_page'] = 1;
      resultParams['GET'] = ['Result', 'Query::total_records', 'Query::current_page'];
      resultParams['ACCEPTWARNING'] = '4276'; // error otherwise

      return doSearch( resultParams, ( search ) => {
        return Object.keys( search.Result ).reduce(( result, idx ) => {
          if ( Number.isNaN( Number( idx ) ) ) {
            return result;
          }

          const row = search.Result[idx];
          
          result.data['amount'] = row['ordergift_pledge_paid_amount_delta'].standard;
          result.data['amountFormatted'] = row['ordergift_pledge_paid_amount_delta'].display;
          result.data['amountCurrency'] = row['ordergift_pledge_paid_currency'].standard;
          
          return result;
        }, {
          total: search.hasOwnProperty('total_records') ? Number( search.total_records.standard ) : 0,
          page: search.hasOwnProperty('current_page') ? Number( search.current_page.standard ) : params.page,
          data: {}
        });
      });
    }
  });
};

/**
 * @param string
 *          sessionId
 * @param object
 *          params
 * @return Promise
 */
const customerTotalSpend = ( server, sessionId, params = {}) => {
  return searchQuery( {
    server: server,  
    sessionId: sessionId,
    entity: 'ts_order',
    onEntity: ( doSearch ) => {
      let order = 0;
      const resultParams = createQueryResultMemberParameters( [{
        name: 'order_total_net_delta',
        order: ++order,
        'function': 104 // SUM
      }, {
        name: 'order_total_gift_amount_delta',
        order: ++order,
        'function': 104 // SUM
      }, {
        name: 'order_payment_currency',
        order: ++order,
      }] );

      const criteria = { clauses: [] };
      addClause( criteria, 'order_customer_id', params.customerId );
      criteria.clauses.forEach(( item ) => {
        Object.assign( resultParams, item );
      });

      resultParams['SET::Search::page_size'] = 1;
      resultParams['SET::Query::current_page'] = 1;
      resultParams['GET'] = ['Result', 'Query::total_records', 'Query::current_page'];
      resultParams['ACCEPTWARNING'] = '4276'; // error otherwise

      return doSearch( resultParams, ( search ) => {
        return Object.keys( search.Result ).reduce(( result, idx ) => {
          if ( Number.isNaN( Number( idx ) ) ) {
            return result;
          }
          const row = search.Result[idx];

          const totalNet = Number(row['order_total_net_delta'].standard);
          const totalGift = Number(row['order_total_gift_amount_delta'].standard) * -1;
          result.data['amount'] = totalNet + totalGift;
        
          // result.data['amountFormatted'] = row['order_payment_total'].display;
          result.data['amountCurrency'] = row['order_payment_currency'].standard;
          
          return result;
        }, {
          total: search.hasOwnProperty('total_records') ? Number( search.total_records.standard ) : 0,
          page: search.hasOwnProperty('current_page') ? Number( search.current_page.standard ) : params.page,
          data: {}
        });
      });
    }
  });
};

const customerActivity = ( server, sessionId, params = {}) => {
  return searchQuery( {
    server: server,
    sessionId: sessionId,
    entity: 'ts_customer',
    onEntity: ( doSearch ) => {

      let order = 0;
      const resultParams = createQueryResultMemberParameters( [{
        name: 'customer_id',
        order: ++order,
      }, {
        name: 'CorrespondenceDetail.correspondencedetail_id',
        order: ++order,
      }, {
        name: 'CorrespondenceDetail.correspondencedetail_memo',
        order: ++order,
      }, {
        name: 'CorrespondenceDetail.correspondencedetail_reason',
        order: ++order,
      }, {
        name: 'CorrespondenceDetail.Correspondence.correspondence_type',
        order: ++order,
      }, {
        name: 'CorrespondenceDetail.Correspondence.correspondence_sent_date',
        order: ++order,
        option: 2 // desc
      }, {
        name: 'CorrespondenceDetail.Correspondence.correspondence_description',
        order: ++order,
      }, {
        name: 'CorrespondenceDetail.Correspondence.correspondence_additional_info',
        order: ++order,
      }, {
        name: 'CorrespondenceDetail.Correspondence.Message.message_category',
        order: ++order,
      }, {
        name: 'CorrespondenceDetail.Correspondence.Message.message_from',
        order: ++order,
      }, {
        name: 'CorrespondenceDetail.Correspondence.Message.message_type',
        order: ++order,
      }, {
        name: 'CorrespondenceDetail.Correspondence.Message.message_description',
        order: ++order,
      }, {
        name: 'CorrespondenceDetail.Correspondence.Message.message_subject',
        order: ++order,
      }] );
      
      if ( params.hasOwnProperty( 'pageSize' ) ) {
        resultParams['SET::Search::page_size'] = params.pageSize;
      }
      if ( params.hasOwnProperty( 'page' ) ) {
        resultParams['SET::Query::current_page'] = params.page;
      }
      // resultParams['SET::Query::max_rows'] = '5000';

      resultParams['GET'] = ['Result', 'Query::total_records', 'Query::current_page'];
      resultParams['ACCEPTWARNING'] = '4276'; // error otherwise

      const criteria = { clauses: [] };

      addClause( criteria, 'customer_id', params.customerId );
      addClause( criteria, 'CorrespondenceDetail.correspondencedetail_id', '', '!=');
      
      // addClause( criteria, 'CorrespondenceDetail.correspondencedetail_memo', 'hasValue', 'hasValue');
      // addClause( criteria, 'CorrespondenceDetail.Correspondence.correspondence_description', 'hasValue', 'hasValue');
      addClause( criteria, 'CorrespondenceDetail.Correspondence.correspondence_description', '', '!=');
      
      criteria.clauses.forEach(( item ) => {
        Object.assign( resultParams, item );
      });

      Object.assign( resultParams, {
        "SET::Query::OrderBy::1::name" : 'CorrespondenceDetail.Correspondence.correspondence_sent_date',
        "SET::Query::OrderBy::1::type" : 'DESC'
      });

      return doSearch( resultParams, search => {      
        return Object.keys( search.Result ).reduce(( result, idx ) => {
          if ( Number.isNaN( Number( idx ) ) ) {
            return result;
          }
          
          const row = search.Result[idx];
          if (row['CorrespondenceDetail.Correspondence.correspondence_description'].display.length === 0) {
            return result;
          }

          result.data.push({
            id: row['customer_id'].display,
            correspondenceDetailId: row['CorrespondenceDetail.correspondencedetail_id'].display,
            memo: row['CorrespondenceDetail.correspondencedetail_memo'].display,
            reason: row['CorrespondenceDetail.correspondencedetail_reason'].display,
            correspondenceType: row['CorrespondenceDetail.Correspondence.correspondence_type'].display,
            sent: row['CorrespondenceDetail.Correspondence.correspondence_sent_date'].standard,
            desc: row['CorrespondenceDetail.Correspondence.correspondence_description'].display,
            additionalInfo: row['CorrespondenceDetail.Correspondence.correspondence_additional_info'].display,
            messageCategory: row['CorrespondenceDetail.Correspondence.Message.message_category'].display,
            messageFrom: row['CorrespondenceDetail.Correspondence.Message.message_from'].display,
            messageType: row['CorrespondenceDetail.Correspondence.Message.message_type'].display,
            messageDesc: row['CorrespondenceDetail.Correspondence.Message.message_description'].display,
            messageSubject: row['CorrespondenceDetail.Correspondence.Message.message_subject'].display,
          });       
        
          return result;
        }, {
          total: search.hasOwnProperty('total_records') ? Number( search.total_records.standard ) : 0,
          page: search.hasOwnProperty('current_page') ? Number( search.current_page.standard ) : params.page,
          data: []
        });
      });
    }
  });
};

/**
 * @param string
 *          sessionId
 * @param object
 *          params
 * @return Promise
 */
const customerEvents = ( server, sessionId, params = {}) => {
  return searchQuery( {
    server: server,
    sessionId: sessionId,
    entity: 'ts_performance',
    onEntity: ( doSearch ) => {
      
      const sortOption = sortType => (params.sort.sortType === sortType && params.sort.sortDirection === 'ASC') ? 1 : ((params.sort.sortType === sortType && params.sort.sortDirection === 'DESC') ? 2 : null); // 1 = asc, 2 = desc
      const selectField = (field, sort) => (sort !== null) ? Object.assign(field, { option: sort }) : field;

      let order = 0;
      const resultParams = createQueryResultMemberParameters( [{
        name: 'performance_id',
        order: ++order,
        option: 5 // grouped
      }, {
        name: 'performance_name',
        order: ++order,
      }, {
        name: 'performance_additional_info',
        order: ++order,
      }, {
        name: 'performance_description',
        order: ++order,
      }, 
      selectField({
        name: 'performance_start_date',
        order: ++order,
      }, sortOption('date')),
      {
        name: 'performance_end_date',
        order: ++order,
      }, {
        name: 'performance_group',
        order: ++order,
      }, {
        name: 'performance_logo1',
        order: ++order,
      }, {
        name: 'performance_logo2',
        order: ++order,
      }, {
        name: 'performance_merchant_description',
        order: ++order,
      }, {
        name: 'performance_short_description',
        order: ++order,
      },/* {
        name: 'PerformanceCategory.performancecategory_category',
        order: ++order,
      }, {
        name: 'PerformanceKeyword.performancekeyword_keyword',
        order: ++order,
      },*/ {
        name: 'Venue.venue_name',
        order: ++order,
      }] );

      if ( params.hasOwnProperty( 'pageSize' ) ) {
        resultParams['SET::Search::page_size'] = params.pageSize;
      }
      if ( params.hasOwnProperty( 'page' ) ) {
        resultParams['SET::Query::current_page'] = params.page;
      }
      // resultParams['SET::Query::max_rows'] = '5000';

      const criteria = { clauses: [] };
      
      addClause( criteria, 'OrderAdmission.Order.order_customer_id', params.customerId );
      
      // check favourites
      if (params.hasOwnProperty('favourites') && params.favourites.length > 0) {
        addClause( criteria, 'performance_id', params.favourites);
      }

      // search
      if (params.hasOwnProperty('search') && params.search !== null) {        
        // we may be able to split the name into two or more.. if two or more.. use first and use last only
        const names = params.search.split(' ');
        if (names.length > 1) {
          const contains = [
            names[0].concat('%'), 
            names[names.length - 1].concat('%')
          ];
          addClause( criteria, 'performance_short_description', contains, 'CONTAINS');
        }
        else if (names.length > 0) {
          addClause( criteria, 'performance_short_description', names[0].concat('%'), 'CONTAINS');
        }
      }
      
      if (params.sort.sortTime === 'upcoming') {
        addClause( criteria, 'performance_start_date', Moment().format('YYYY-MM-DDT00:00:00.000'), '>=');
      }
      else if (params.sort.sortTime === 'past') {
        addClause( criteria, 'performance_start_date', Moment().format('YYYY-MM-DDT23:59:59.000'), '<=');
      }
      
      criteria.clauses.forEach(( item ) => {
        Object.assign( resultParams, item );
      });

      Object.assign( resultParams, {
        "SET::Query::OrderBy::name" : 'performance_start_date',
        "SET::Query::OrderBy::type" : params.sort.sortDirection
      });
      
      resultParams['GET'] = ['Result', 'Query::total_records', 'Query::current_page'];
      resultParams['ACCEPTWARNING'] = '4276'; // error otherwise

      return doSearch( resultParams, search => {

        return Object.keys( search.Result ).reduce(( result, idx ) => {          
          if ( Number.isNaN( Number( idx ) ) ) {
            return result;
          }
          const row = search.Result[idx];

          // console.log('---', row['Customer.DefaultContact.contact_first_name'].display);

          result.data.push( {
            id: row['performance_id'].display,
            name: row['performance_name'].display,
            additionalInfo: row['performance_additional_info'].display,
            description: row['performance_description'].display,
            startDate: row['performance_start_date'].standard,
            endDate: row['performance_end_date'].standard,
            group: row['performance_group'].display,
            logoOne: row['performance_logo1'].standard,
            logoTwo: row['performance_logo2'].standard,
            merchantDescription: row['performance_merchant_description'].display,
            shortDescription: row['performance_short_description'].display,
            // category: row['PerformanceCategory.performancecategory_category'].display,
            // keyword: row['PerformanceKeyword.performancekeyword_keyword'].display,
            venueName: row['Venue.venue_name'].display,
          });
          return result;
        }, {
          total: search.hasOwnProperty('total_records') ? Number( search.total_records.standard ) : 0,
          page: search.hasOwnProperty('current_page') ? Number( search.current_page.standard ) : params.page,
          data: []
        });
      });
    }
  });
};


/**
 * @param string
 *          sessionId
 * @param object
 *          params
 * @return Promise
 */
const events = ( server, sessionId, params = {}) => {
  return searchQuery({
    server: server, 
    sessionId: sessionId,
    entity: 'ts_performance',
    onEntity: ( doSearch ) => {
      
      const sortOption = sortType => (params.sort.sortType === sortType && params.sort.sortDirection === 'ASC') ? 1 : ((params.sort.sortType === sortType && params.sort.sortDirection === 'DESC') ? 2 : null); // 1 = asc, 2 = desc
      const selectField = (field, sort) => (sort !== null) ? Object.assign(field, { option: sort }) : field;
      
      let order = 0;
      const resultParams = createQueryResultMemberParameters( [{
        name: 'performance_id',
        order: ++order,
        option: 5 // grouped
      }, {
        name: 'performance_name',
        order: ++order,
      }, {
        name: 'performance_additional_info',
        order: ++order,
      }, {
        name: 'performance_description',
        order: ++order,
      }, 
      selectField({
        name: 'performance_start_date',
        order: ++order,
      }, sortOption('date')), 
      selectField({
        name: 'performance_end_date',
        order: ++order,
      }, sortOption('date')),  
      {
        name: 'performance_group',
        order: ++order,
      }, {
        name: 'performance_logo1',
        order: ++order,
      }, {
        name: 'performance_logo2',
        order: ++order,
      }, {
        name: 'performance_merchant_description',
        order: ++order,
      }, {
        name: 'performance_total_seats',
        order: ++order,
      }, 
      selectField({
        name: 'performance_short_description',
        order: ++order,
      }, sortOption('alpha')), 
      {
        name: 'performance_venue_id',
        order: ++order,
      }, {
        name: 'performance_state',
        order: ++order,
      }, {
        name: 'performance_settlement_amount',
        order: ++order,
      }, {
        name: 'performance_rank',
        order: ++order,
      }, {
        name: 'performance_performance_type',
        order: ++order,
      }/*, {
        name: 'PerformanceCategory.performancecategory_category',
        order: ++order,
      }, {
        name: 'PerformanceKeyword.performancekeyword_keyword',
        order: ++order,
      }*/, {
        name: 'PerformanceSeats.performanceseats_sold_seat_count',
        order: ++order,
      }, {
        name: 'PerformanceSeats.performanceseats_total_seat_count',
        order: ++order,
      }, {
        name: 'Venue.venue_name',
        order: ++order,
      }, {
        name: 'Venue.venue_image',
        order: ++order,
      }, {
        name: 'Venue.venue_short_description',
        order: ++order,
      }, {
        name: 'Venue.venue_percent_excellent',
        order: ++order,
      }, {
        name: 'Venue.venue_percent_good',
        order: ++order,
      }, {
        name: 'Venue.venue_percent_low',
        order: ++order,
      }, {
        name: 'Venue.venue_percent_sold_out',
        order: ++order,
      }] ); 
  
      if ( params.hasOwnProperty( 'pageSize' ) ) {
        resultParams['SET::Search::page_size'] = params.pageSize;
      }
      if ( params.hasOwnProperty( 'page' ) ) {
        resultParams['SET::Query::current_page'] = params.page;
      }
      // resultParams['SET::Query::max_rows'] = '5000';

      let criteria = {
          clauses: []
      };
                                                                                
      // check favourites
      if (params.hasOwnProperty('favourites') && params.favourites.length > 0) {
        addClause( criteria, 'performance_id', params.favourites);
      }
            
      if (params.hasOwnProperty('filters')) {        
        // check venues
        if (params.filters.hasOwnProperty('filterByVenue') && params.filters.filterByVenue.ids.length > 0) {
        
          const venues = params.filters.filterByVenue.ids.reduce( (data, item) => {
            data.push(item.id);
            return data;
          }, []);

          addClause( criteria, 'Venue.venue_id', venues);
        }

        // check dates
        if ( params.filters.hasOwnProperty('filterByDate') && params.filters.filterByDate.startDate && params.filters.filterByDate.startDate.length > 0 ) {
          const startDate = Moment(params.filters.filterByDate.startDate).format('YYYY-MM-DDT00:00:00.000');
          addClause( criteria, 'performance_start_date', startDate, '>=' );
        }
        
        if ( params.filters.hasOwnProperty('filterByDate') && params.filters.filterByDate.endDate && params.filters.filterByDate.endDate.length > 0 ) {
          const endDate = Moment(params.filters.filterByDate.endDate).format('YYYY-MM-DDT23:59:59.999');
          addClause( criteria, 'performance_start_date', endDate, '<=' );
        }
        
        // check categories
        if ( params.filters.hasOwnProperty( 'filterByEventType' ) && params.filters.filterByEventType.type && params.filters.filterByEventType.type.length > 0 ) {
          addClause( criteria, 'performance_performance_type', params.filters.filterByEventType.type); // , 'hasValue', 'hasValue' );
        }
        if ( params.filters.hasOwnProperty( 'filterByEventGroup' ) && params.filters.filterByEventGroup.type && params.filters.filterByEventGroup.type.length > 0 ) {
          addClause( criteria, 'performance_group', params.filters.filterByEventGroup.type); // , 'hasValue', 'hasValue' );
        }
                
        // sales
        /*
        if (params.filters.hasOwnProperty('filterBySales')) {
          const addFilterBySalesToResultMembers = () => {
            Object.assign( resultParams, createQueryResultMemberParameters( [{
              name: 'OrderAdmission.orderadmission_amount_paid',
              order: ++order,
              'function': 104, // SUM
            }], order - 1 ) ); 
          };
          
          if (params.filters.filterBySales.min !== null && params.filters.filterBySales.max !== null) {
            addFilterBySalesToResultMembers();
            addClause( criteria, 'OrderAdmission.orderadmission_amount_paid', [
              params.filters.filterBySales.min,
              params.filters.filterBySales.max
            ], 'A<=X<=B', 'matchCondition', 104);
          }
          else if (params.filters.filterBySales.min === null && params.filters.filterBySales.max !== null) {
            addFilterBySalesToResultMembers();
            addClause( criteria, 'OrderAdmission.orderadmission_amount_paid', params.filters.filterBySales.max, '<=', 'matchCondition', 104);
          }
          else if (params.filters.filterBySales.min !== null && params.filters.filterBySales.max === null) {
            addFilterBySalesToResultMembers();
            addClause( criteria, 'OrderAdmission.orderadmission_amount_paid', params.filters.filterBySales.min, '>=', 'matchCondition', 104);
          }
        }
        */
      }
      
      if (params.hasOwnProperty('search') && params.search !== null) {        
        // we may be able to split the name into two or more.. if two or more.. use first and use last only
        const names = params.search.split(' ');
        if (names.length > 1) {
          const contains = [
            names[0].concat('%'), 
            names[names.length - 1].concat('%')
          ];
          addClause( criteria, 'performance_short_description', contains, 'CONTAINS');
        }
        else if (names.length > 0) {
          addClause( criteria, 'performance_short_description', names[0].concat('%'), 'CONTAINS');
        }
      }

      if (params.sort.sortTime === 'upcoming') {
        addClause( criteria, 'performance_start_date', Moment().format('YYYY-MM-DDT00:00:00.000'), '>=');
      }
      else if (params.sort.sortTime === 'past') {
        addClause( criteria, 'performance_start_date', Moment().format('YYYY-MM-DDT23:59:59.000'), '<=');
      }
                        
      criteria.clauses.forEach(( item ) => {
        Object.assign( resultParams, item );
      });
     
      let sortField;
      if (params.sort.sortType === 'date') {
        sortField = 'performance_start_date';
      }
      else if (params.sort.sortType === 'alpha') {
        sortField = 'performance_short_description';
      }
      
      Object.assign( resultParams, {
        "SET::Query::OrderBy::name" : sortField,
        "SET::Query::OrderBy::type" : params.sort.sortDirection
      });
       
      resultParams['GET'] = ['Result', 'Query::total_records', 'Query::current_page'];
      resultParams['ACCEPTWARNING'] = '4276'; // error otherwise
      
      // console.log(resultParams);
      
      return doSearch( resultParams, search => {
        return Object.keys( search.Result ).reduce(( result, idx ) => {
          if ( Number.isNaN( Number( idx ) ) ) {
            return result;
          }
          const row = search.Result[idx];
          result.data.push( {
            id: row['performance_id'].display,
            name: row['performance_name'].display,
            additionalInfo: row['performance_additional_info'].display,
            description: row['performance_description'].display,
            startDate: row['performance_start_date'].standard,
            endDate: row['performance_end_date'].standard,
            group: row['performance_group'].display,
            logoOne: row['performance_logo1'].display,
            logoTwo: row['performance_logo2'].display,
            merchantDescription: row['performance_merchant_description'].display,
            totalSeats: row['performance_total_seats'].display,
            soldSeatsCount: row['PerformanceSeats.performanceseats_sold_seat_count'].display,
            totalSeatsCount: row['PerformanceSeats.performanceseats_total_seat_count'].display,
            shortDescription: row['performance_short_description'].display,
            venueId: row['performance_venue_id'].standard,
            state: row['performance_state'].standard,
            settlementAmount: row['performance_settlement_amount'].standard,
            rank: row['performance_rank'].standard,
            type: row['performance_performance_type'].display,
            // category: row['PerformanceCategory.performancecategory_category'].display,
            // keyword: row['PerformanceKeyword.performancekeyword_keyword'].display,
            venueName: row['Venue.venue_name'].display,
            venueDesc: row['Venue.venue_short_description'].display,
            venueImage: row['Venue.venue_image'].display,
            venueExcellentPercent: row['Venue.venue_percent_excellent'].display,
            venueGoodPercent: row['Venue.venue_percent_good'].display,
            venueLowPercent: row['Venue.venue_percent_low'].display,
            venueSoldOutPercent: row['Venue.venue_percent_sold_out'].display,
          });
          return result;
        }, {
          total: search.hasOwnProperty('total_records') ? Number( search.total_records.standard ) : 0,
          page: search.hasOwnProperty('current_page') ? Number( search.current_page.standard ) : params.page,
          data: []
        });
      });
    }
  });
};

const eventsToday = ( server, sessionId, params = {}) => {
  return searchQuery({
    server: server,
    sessionId: sessionId,
    entity: 'ts_performance',
    onEntity: ( doSearch ) => {

      const resultParams = createQueryResultMemberParameters( [{
        name: 'performance_id',
        order: 1,
      }, {
        name: 'performance_name',
        order: 2,
      }, {
        name: 'performance_additional_info',
        order: 3,
      }, {
        name: 'performance_description',
        order: 4,
      }, {
        name: 'performance_start_date',
        order: 5,
      }, {
        name: 'performance_end_date',
        order: 6,
      }, {
        name: 'performance_group',
        order: 7,
      }, {
        name: 'performance_logo1',
        order: 8,
      }, {
        name: 'performance_logo2',
        order: 9,
      }, {
        name: 'performance_merchant_description',
        order: 10,
      }, {
        name: 'performance_total_seats',
        order: 11,
      }, {
        name: 'performance_short_description',
        order: 12,
      }/*, {
        name: 'PerformanceCategory.performancecategory_category',
        order: 13,
      }, {
        name: 'PerformanceKeyword.performancekeyword_keyword',
        order: 14,
      }*/, {
        // name:
        // 'PerformanceSeats.performanceseats_sold_seat_count',
        // order: 5,
        // }, {
        // name:
        // 'PerformanceSeats.performanceseats_total_seat_count',
        // order: 5,
        // }, {
        name: 'Venue.venue_name',
        order: 15,
      }, {
        name: 'Venue.venue_percent_excellent',
        order: 16,
      }, {
        name: 'Venue.venue_percent_good',
        order: 17,
      }, {
        name: 'Venue.venue_percent_low',
        order: 18,
      }, {
        name: 'Venue.venue_percent_sold_out',
        order: 19,
      }] );
      
      if ( params.hasOwnProperty( 'pageSize' ) ) {
        resultParams['SET::Search::page_size'] = params.pageSize;
      }
      if ( params.hasOwnProperty( 'page' ) ) {
        resultParams['SET::Query::current_page'] = params.page;
      }
      // resultParams['SET::Query::max_rows'] = '5000';

      let criteria = {
          clauses: []
      };
      
      addClause( criteria, 'performance_start_date', Moment().format('YYYY-MM-DDT00:00:00.000'), '>=' );
      addClause( criteria, 'performance_end_date', Moment().format('YYYY-MM-DDT23:59:59.999'), '<=' );
      criteria.clauses.forEach(( item ) => {
        Object.assign( resultParams, item );
      });

      resultParams['GET'] = ['Result', 'Query::total_records', 'Query::current_page'];
      resultParams['ACCEPTWARNING'] = '4276'; // error otherwise

      return doSearch( resultParams, search => {
        return Object.keys( search.Result ).reduce(( result, idx ) => {
          if ( Number.isNaN( Number( idx ) ) ) {
            return result;
          }
          const row = search.Result[idx];
          result.data.push( {
            id: row['performance_id'].display,
            name: row['performance_name'].display,
            additionalInfo: row['performance_additional_info'].display,
            description: row['performance_description'].display,
            startDate: row['performance_start_date'].display,
            endDate: row['performance_end_date'].display,
            group: row['performance_group'].display,
            logoOne: row['performance_logo1'].display,
            logoTwo: row['performance_logo2'].display,
            merchantDescription: row['performance_merchant_description'].display,
            totalSeats: row['performance_total_seats'].display,
            shortDescription: row['performance_short_description'].display,
            // category: row['PerformanceCategory.performancecategory_category'].display,
            // keyword: row['PerformanceKeyword.performancekeyword_keyword'].display,
            venueName: row['Venue.venue_name'].display,
            venueExcellentPercent: row['Venue.venue_percent_excellent'].display,
            venueGoodPercent: row['Venue.venue_percent_good'].display,
            venueLowPercent: row['Venue.venue_percent_low'].display,
            venueSoldOutPercent: row['Venue.venue_percent_sold_out'].display,
            insightclass: 'Event',
            title: row['performance_name'].display,
            insighthtml: row['performance_short_description'].display,
            timeframe: 'today'
          });
          
          return result;
        }, {
          total: search.hasOwnProperty('total_records') ? Number( search.total_records.standard ) : 0,
          page: search.hasOwnProperty('current_page') ? Number( search.current_page.standard ) : params.page,
          data: []
        });
      });
    }
  });
};

/**
 * Event Categories probably doesn't change too often, this can probably be
 * pulled from Cache (like Redis) and have a service which periodically updates
 * or wipes the cache key when a new performance category is created
 * 
 * @param string
 *          sessionId
 * @param object
 *          params
 * @return Promise
 */
const eventCategories = ( server, sessionId, params = {}) => {
  return searchQuery({
    server: server,
    sessionId: sessionId,
    entity: 'ts_performance',
    onEntity: ( doSearch ) => {
      const resultParams = createQueryResultMemberParameters( [{
        name: 'PerformanceCategory.performancecategory_category',
        order: 1,
        // option: 3
      }] );

      resultParams['SET::Search::page_size'] = 1000;
      resultParams['SET::Query::current_page'] = 1;

      // resultParams['SET::Query::max_rows'] = '5000';
      resultParams['GET'] = ['Result', 'Query::total_records', 'Query::current_page'];
      resultParams['ACCEPTWARNING'] = '4276'; // error otherwise

      return doSearch( resultParams, search => {
        console.log('--- eventCategories', search);
        
        return Object.keys( search.Result ).reduce(( result, idx ) => {
          if ( Number.isNaN( Number( idx ) ) ) {
            return result;
          }
          const row = search.Result[idx];
          const value = row['PerformanceCategory.performancecategory_category'].display.trim();
          if ( value.length > 0 ) {
            result.data.push( value );
          }
          return result;
        }, {
          total: search.hasOwnProperty('total_records') ? Number( search.total_records.standard ) : 0,
          page: search.hasOwnProperty('current_page') ? Number( search.current_page.standard ) : params.page,
          data: []
        });
      }); 
    }
  });
};

const eventLocations = ( server, sessionId, params = {}) => {
  const handle = 'eventLocations';
  return createBO( server, sessionId, handle, BO.SEARCH )
  .then( createBoRes => {

    return setPrimaryEntityBO( server, sessionId, handle, {
      'PARAM::primaryEntity': 'ts_venue'
    })
    .then( setPrimaryEntityRes => {
      const resultParams = createQueryResultMemberParameters( [{
        name: 'Address.address_country',
        order: 1,
        option: 3,
      }, {
        name: 'Address.address_state',
        order: 2,
        option: 3,
      }, {
        name: 'Address.address_city',
        order: 3,
        option: 3
      }] );

      resultParams['SET::Search::page_size'] = 1000;
      resultParams['SET::Query::current_page'] = 1;

      // resultParams['SET::Query::max_rows'] = '5000';
      resultParams['GET'] = ['Result', 'Query::total_records', 'Query::current_page'];
      resultParams['ACCEPTWARNING'] = '4276'; // error otherwise

      return avPOST( server.concat('/app/WebAPI/object/' + handle + '/search'), resultParams, getSessionCookieHeader( sessionId ) )
      .then( search => {
        return Object.keys( search.Result ).reduce(( result, idx ) => {
          if ( Number.isNaN( Number( idx ) ) ) {
            return result;
          }
          const row = search.Result[idx];
          const country = row['Address.address_country'].display.trim();
          const state = row['Address.address_state'].display.trim();
          const city = row['Address.address_city'].display.trim();

          if ( country.length <= 0 || state.length <= 0 || city.length <= 0 ) {
            return result;
          }

          if ( !result.data.hasOwnProperty( country ) ) {
            result.data[country] = {};
          }
          if ( !result.data[country].hasOwnProperty( state ) ) {
            result.data[country][state] = [];
          }
          result.data[country][state].push( city );
          return result;
        }, {
          total: search.hasOwnProperty('total_records') ? Number( search.total_records.standard ) : 0,
          page: search.hasOwnProperty('current_page') ? Number( search.current_page.standard ) : params.page,
          data: {}
        });
      });
    });
  });
};

const eventVenues = ( server, sessionId, params = {}) => {
  
  return searchQuery({
    server: server,
    sessionId: sessionId,
    entity: 'ts_venue',
    onEntity: ( doSearch ) => {
      
      let orders = 0;
      const resultParams = createQueryResultMemberParameters( [{
        name: 'venue_id',
        order: ++orders,
        // option: 3,
      }, {
        name: 'venue_name',
        order: ++orders,
        option: 1,
      }] );

      resultParams['SET::Search::page_size'] = 1000;
      resultParams['SET::Query::current_page'] = 1;

      // resultParams['SET::Query::max_rows'] = '5000';
      resultParams['GET'] = ['Result', 'Query::total_records', 'Query::current_page'];
      resultParams['ACCEPTWARNING'] = '4276'; // error otherwise

      return doSearch( resultParams, search => {
        return Object.keys( search.Result ).reduce(( result, idx ) => {
          if ( Number.isNaN( Number( idx ) ) ) {
            return result;
          }
          
          const row = search.Result[idx];
          
          result.data.push({
            key: row['venue_id'].standard.trim(),
            value: row['venue_name'].display.trim(),
          });
          
          return result;
        }, {
          total: search.hasOwnProperty('total_records') ? Number( search.total_records.standard ) : 0,
          page: search.hasOwnProperty('current_page') ? Number( search.current_page.standard ) : params.page,
          data: []
        });
      });
    }
  });
};

const newDonors = ( server, sessionId, params = {}) => {
  return searchQuery({
    server: server,
    sessionId: sessionId,
    entity: 'ts_customer',
    onEntity: ( doSearch ) => {

      const resultParams = createQueryResultMemberParameters([{
        name: 'customer_id',
        order: 1,
        'function': 101 // COUNT
      }]);

      let criteria = {
          clauses: []
      };
      
      // we only people that have donated between a start and enddate
      if (params.startDate !== null && typeof params.startDate !== 'undefined') {
        const startDate = Moment(params.startDate).format('YYYY-MM-DDT00:00:00.000');
        addClause( criteria, 'CreateAudit.audit_time', startDate, '>=' );
      }
      if (params.endDate !== null && typeof params.endDate !== 'undefined') {
        const endDate = Moment(params.endDate).format('YYYY-MM-DDT023:59:59.999');
        addClause( criteria, 'CreateAudit.audit_time', endDate, '<=' );
      }

      // we only people that have donated between a start and enddate
      if (params.startDate !== null && typeof params.startDate !== 'undefined') {
        const startDate = Moment(params.startDate).format('YYYY-MM-DDT00:00:00.000');
        addClause( criteria, 'Order.OrderGift.ordergift_pledge_date', startDate, '>=' );
      }
      if (params.endDate !== null && typeof params.endDate !== 'undefined') {
        const endDate = Moment(params.endDate).format('YYYY-MM-DDT23:59:59.999');
        addClause( criteria, 'Order.OrderGift.ordergift_pledge_date', endDate, '<=' );
      }

      criteria.clauses.forEach(( item ) => {
        Object.assign( resultParams, item );
      });

      resultParams['GET'] = ['Result', 'Query::total_records', 'Query::current_page'];
      resultParams['ACCEPTWARNING'] = '4276'; // error otherwise
      
      return doSearch( resultParams, search => {

        return Object.keys( search.Result ).reduce(( result, idx ) => {
          if ( Number.isNaN( Number( idx ) ) ) {
            return result;
          }
          const row = search.Result[idx];

          // result.data['count'] = row['customer_id'].display;
          result.data['count'] = row['customer_id'].display;
          
          return result;
        }, {
          total: search.hasOwnProperty('total_records') ? Number( search.total_records.standard ) : 0,
          page: search.hasOwnProperty('current_page') ? Number( search.current_page.standard ) : params.page,
          data: {}
        });
      });
    }
  });
};

const newDonorsAmount = ( server, sessionId, params = {}) => {
  return searchQuery({
    server: server,
    sessionId: sessionId,
    entity: 'ts_order_gift',
    onEntity: ( doSearch ) => {

      const resultParams = createQueryResultMemberParameters([{
        name: 'ordergift_pledge_paid_currency',
        order: 1,
        option: 5 // GROUP BY CURRENCY
      }, {
        name: 'ordergift_pledge_paid_amount_delta',
        order: 2,
        'function': 104 // SUM
      }]);

      let criteria = {
          clauses: []
      };
      
      // we only people that have donated between a start and enddate
      if (params.startDate !== null && typeof params.startDate !== 'undefined') {
        const startDate = Moment(params.startDate).format('YYYY-MM-DDT00:00:00.000');
        addClause( criteria, 'ordergift_pledge_date', startDate, '>=' );
      }
      if (params.endDate !== null && typeof params.endDate !== 'undefined') {
        const endDate = Moment(params.endDate).format('YYYY-MM-DDT23:59:59.999');
        addClause( criteria, 'ordergift_pledge_date', endDate, '<=' );
      }
      
      // we only people that have donated between a start and enddate
      if (params.startDate !== null && typeof params.startDate !== 'undefined') {
        const startDate = Moment(params.startDate).format('YYYY-MM-DDT00:00:00.000');
        addClause( criteria, 'Order.BillingCustomer.CreateAudit.audit_time', startDate, '>=' );
      }
      if (params.endDate !== null && typeof params.endDate !== 'undefined') {
        const endDate = Moment(params.endDate).format('YYYY-MM-DDT023:59:59.999');
        addClause( criteria, 'Order.BillingCustomer.CreateAudit.audit_time', endDate, '<=' );
      }
            
      criteria.clauses.forEach(( item ) => {
        Object.assign( resultParams, item );
      });

      resultParams['GET'] = ['Result'];
      resultParams['ACCEPTWARNING'] = '4276'; // error otherwise
      
      return doSearch( resultParams, search => {
        return Object.keys( search.Result ).reduce(( result, idx ) => {
          if ( Number.isNaN( Number( idx ) ) ) {
            return result;
          }

          const row = search.Result[idx];
          result.data.push({
            currency: row['ordergift_pledge_paid_currency'].display,
            amount: row['ordergift_pledge_paid_amount_delta']
          });
          
          return result;
        }, {
          data: []
        });
      });
    }
  });
};

const newCustomersCount = ( server, sessionId, params = {}) => {
  return searchQuery({
    server: server,
    sessionId: sessionId,
    entity: 'ts_customer',
    onEntity: ( doSearch ) => {

      const resultParams = createQueryResultMemberParameters([{
        name: 'customer_id',
        order: 1,
        'function': 101 // COUNT
      }]);

      let criteria = {
          clauses: []
      };

      // we only people that have donated between a start and enddate
      if (params.startDate !== null && typeof params.startDate !== 'undefined') {
        const startDate = Moment(params.startDate).format('YYYY-MM-DDT00:00:00.000');
        addClause( criteria, 'CreateAudit.audit_time', startDate, '>=' );
      }
      if (params.endDate !== null && typeof params.endDate !== 'undefined') {
        const endDate = Moment(params.endDate).format('YYYY-MM-DDT023:59:59.999');
        addClause( criteria, 'CreateAudit.audit_time', endDate, '<=' );
      }
      
      criteria.clauses.forEach(( item ) => {
        Object.assign( resultParams, item );
      });

      resultParams['GET'] = ['Result'];
      resultParams['ACCEPTWARNING'] = '4276'; // error otherwise

      return doSearch( resultParams, search => {
        return Object.keys( search.Result ).reduce(( result, idx ) => {
          if ( Number.isNaN( Number( idx ) ) ) {
            return result;
          }

          const row = search.Result[idx];
          // result.data['count'] = row['customer_id'].display;
          result.data['count'] = row['customer_id'].display;

          return result;
        }, {
          data: {}
        });
      });
    }
  });
};

const newCustomersSales = ( server, sessionId, params = {}) => {
  return searchQuery({
    server: server,
    sessionId: sessionId,
    entity: 'ts_order',
    onEntity: ( doSearch ) => {

      const resultParams = createQueryResultMemberParameters([{
        name: 'order_total_net_currency',
        order: 1,
        option: 5 // GROUP BY CURRENCY
      }, {
        name: 'order_total_net_delta',
        order: 2,
        'function': 104 // SUM
      }, {
        name: 'order_total_gift_amount_delta',
        order: 2,
        'function': 104 // SUM
      }, {
        name: 'BillingCustomer.customer_id',
        order: 3,
        'function': 101 // COUNT
      }]);

      let criteria = {
          clauses: []
      };
      
      // we only people that have donated between a start and enddate
      if (params.startDate !== null && typeof params.startDate !== 'undefined') {
        const startDate = Moment(params.startDate).format('YYYY-MM-DDT00:00:00.000');
        addClause( criteria, 'BillingCustomer.CreateAudit.audit_time', startDate, '>=' );
      }
      if (params.endDate !== null && typeof params.endDate !== 'undefined') {
        const endDate = Moment(params.endDate).format('YYYY-MM-DDT023:59:59.999');
        addClause( criteria, 'BillingCustomer.CreateAudit.audit_time', endDate, '<=' );
      }

      criteria.clauses.forEach(( item ) => {
        Object.assign( resultParams, item );
      });

      resultParams['GET'] = ['Result'];
      resultParams['ACCEPTWARNING'] = '4276'; // error otherwise

      return doSearch( resultParams, search => {
        return Object.keys( search.Result ).reduce(( result, idx ) => {
          if ( Number.isNaN( Number( idx ) ) ) {
            return result;
          }

          const row = search.Result[idx];

          result.data.push({
            currency: row['order_total_net_currency'].display,
            amount: Math.abs(Number(row['order_total_net_delta'].standard) - Number(row['order_total_gift_amount_delta'].standard)),
          });
        
          return result;
        }, {
          data: []
        });
      });
    }
  });
};

const eventSales = ( server, sessionId, params = {}) => {
  return searchQuery({
    server: server,
    sessionId: sessionId,
    entity: 'ts_order_admission',
    onEntity: ( doSearch ) => {

      const resultParams = createQueryResultMemberParameters([{
        name: 'orderadmission_net_paid_currency',
        order: 1,
        option: 5 // GROUP BY CURRENCY
      }, {
        name: 'orderadmission_net_paid_delta',
        order: 2,
        'function': 104 // SUM
      }]);

      let criteria = {
          clauses: []
      };
      
      // we only people that have donated between a start and enddate
      if (params.startDate !== null && typeof params.startDate !== 'undefined') {
        const startDate = Moment(params.startDate).format('YYYY-MM-DDT00:00:00.000');
        addClause( criteria, 'orderadmission_audit_time', startDate, '>=' );
      }
      if (params.endDate !== null && typeof params.endDate !== 'undefined') {
        const endDate = Moment(params.endDate).format('YYYY-MM-DDT23:59:59.999');
        addClause( criteria, 'orderadmission_audit_time', endDate, '<=' );
      }

      criteria.clauses.forEach(( item ) => {
        Object.assign( resultParams, item );
      });

      resultParams['GET'] = ['Result'];
      resultParams['ACCEPTWARNING'] = '4276'; // error otherwise

      return doSearch( resultParams, search => {
        
        return Object.keys( search.Result ).reduce(( result, idx ) => {
          if ( Number.isNaN( Number( idx ) ) ) {
            return result;
          }

          const row = search.Result[idx];
          result.data.push({
            currency: row['orderadmission_net_paid_currency'].standard,
            // amount: row['orderadmission_net_paid'].standard,
            amount: row['orderadmission_net_paid_delta'].standard,
            // value: row['orderadmission_net_paid'].display
            value: row['orderadmission_net_paid_delta'].display
          });
          
          return result;
        }, {
          data: []
        });
      });
    }
  });
};


const eventAdmissionsSoldCount = ( server, sessionId, params = {}) => {
  return searchQuery({
    server: server,
    sessionId: sessionId,
    entity: 'ts_order_admission',
    onEntity: ( doSearch ) => {

      const resultParams = createQueryResultMemberParameters([{
        name: 'orderadmission_id',
        order: 1,
        'function': 101 // COUNT
      }]);

      let criteria = {
          clauses: []
      };
      
      // we only people that have donated between a start and enddate
      if (params.startDate !== null && typeof params.startDate !== 'undefined') {
        const startDate = Moment(params.startDate).format('YYYY-MM-DDT00:00:00.000');
        addClause( criteria, 'orderadmission_audit_time', startDate, '>=' );
      }  
      if (params.endDate !== null && typeof params.endDate !== 'undefined') {
        const endDate = Moment(params.endDate).format('YYYY-MM-DDT23:59:59.999');
        addClause( criteria, 'orderadmission_audit_time', endDate, '<=' );
      }

      criteria.clauses.forEach(( item ) => {
        Object.assign( resultParams, item );
      });

      resultParams['GET'] = ['Result'];
      resultParams['ACCEPTWARNING'] = '4276'; // error otherwise

      return doSearch( resultParams, search => {
        return Object.keys( search.Result ).reduce(( result, idx ) => {
          if ( Number.isNaN( Number( idx ) ) ) {
            return result;
          }

          const row = search.Result[idx];
          // result.data['count'] = row['orderadmission_id'].display;
          result.data['count'] = row['orderadmission_id'].display;
          
          return result;
        }, {
          data: {}
        });
      });
    }
  });
};

const eventAdmissionsSoldPriceTypes = ( server, sessionId, params = {}) => {
  return searchQuery({
    server: server,
    sessionId: sessionId,
    entity: 'ts_order_admission',
    onEntity: ( doSearch ) => {

      let order = 0;
      const resultParams = createQueryResultMemberParameters( [{
        name: 'orderadmission_id',
        order: ++order,
        option: 2, // desc
        'function': 101 // COUNT
      }, {
        name: 'PriceType.price_type_name',
        order: ++order,
        option: 5 // grouped     
      }] );
      
      /*
      Object.assign( resultParams, {
        "SET::Query::OrderBy::1::name" : 'orderadmission_id',
        "SET::Query::OrderBy::1::type" : 'DESC'
      });
      */
      resultParams['SET::Search::page_size'] = 1000;
      resultParams['SET::Query::current_page'] = 1;
      
      let criteria = {
          clauses: []
      };
      
      // we only people that have donated between a start and enddate
      if (params.startDate !== null && typeof params.startDate !== 'undefined') {
        const startDate = Moment(params.startDate).format('YYYY-MM-DDT00:00:00.000');
        addClause( criteria, 'orderadmission_audit_time', startDate, '>=' );
      }  
      if (params.endDate !== null && typeof params.endDate !== 'undefined') {
        const endDate = Moment(params.endDate).format('YYYY-MM-DDT23:59:59.999');
        addClause( criteria, 'orderadmission_audit_time', endDate, '<=' );
      }

      criteria.clauses.forEach(( item ) => {
        Object.assign( resultParams, item );
      });

      resultParams['GET'] = ['Result', 'Query::total_records', 'Query::current_page'];
      resultParams['ACCEPTWARNING'] = '4276'; // error otherwise
      
      //console.log('--- woooot params', resultParams);
      
      return doSearch( resultParams, search => {
        return Object.keys( search.Result ).reduce(( result, idx ) => {
          if ( Number.isNaN( Number( idx ) ) ) {
            return result;
          }                                                                                         
                                                                                          
          const row = search.Result[idx];

          result.data['total'] += Number(row['orderadmission_id'].standard.trim());
          result.data['set'].push({
            total: Number(row['orderadmission_id'].standard.trim()),            
            type: row['PriceType.price_type_name'].display.trim()
          });

          return result;
        }, {
          total: search.hasOwnProperty('total_records') ? Number( search.total_records.standard ) : 0,
          page: search.hasOwnProperty('current_page') ? Number( search.current_page.standard ) : params.page,
          data: {
            total: 0,
            set: []
          }
        });
      });
    }
  });
};


/**
 * @param string
 *          sessionId
 * @param object
 *          params
 * @return Promise
 */
const eventAttendance = ( server, sessionId, params = {}) => {
  return searchQuery({
    server: server,
    sessionId: sessionId,
    entity: 'ts_ticket', // ts_order_admission',
    onEntity: ( doSearch ) => {

      let order = 0;
      const resultParams = createQueryResultMemberParameters( [{
        name: 'ticket_id', // orderadmission_id',
        order: ++order,
        'function': 101 // COUNT
      }] );

      resultParams['SET::Search::page_size'] = 1000;
      resultParams['SET::Query::current_page'] = 1;

      let criteria = {
          clauses: []
      };
      
      addClause( criteria, 'ticket_performance_id', params.eventId);
      addClause( criteria, 'ticket_status', [5,7]);

      criteria.clauses.forEach(( item ) => {
        Object.assign( resultParams, item );
      });
      
      // resultParams['SET::Query::max_rows'] = '5000';
      resultParams['GET'] = ['Result', 'Query::total_records', 'Query::current_page'];
      resultParams['ACCEPTWARNING'] = '4276'; // error otherwise
      
      return doSearch( resultParams, search => {
        return Object.keys( search.Result ).reduce(( result, idx ) => {
          if ( Number.isNaN( Number( idx ) ) ) {
            return result;
          }                                                                                         
                                                                                          
          const row = search.Result[idx];

          result.data['total'] += Number(row['ticket_id'].standard.trim());
   
          return result;
        }, {
          total: search.hasOwnProperty('total_records') ? Number( search.total_records.standard ) : 0,
          page: search.hasOwnProperty('current_page') ? Number( search.current_page.standard ) : params.page,
          data: {
            total: 0,
          }
        });
      });
    }
  });
};
const eventAttendanceDetails = ( server, sessionId, params = {}) => {
  return searchQuery({
    server: server,
    sessionId: sessionId,
    entity: 'ts_ticket', // ts_order_admission',
    onEntity: ( doSearch ) => {

      let order = 0;
      const resultParams = createQueryResultMemberParameters( [{
        name: 'ticket_id', // orderadmission_id',
        order: ++order,
        option: 2, // desc
        'function': 101 // COUNT
      }, {
        name: 'PriceType.price_type_name',
        order: ++order,
        option: 5 // grouped     
      }] );

      resultParams['SET::Search::page_size'] = 1000;
      resultParams['SET::Query::current_page'] = 1;

      let criteria = {
          clauses: []
      };
      
      addClause( criteria, 'ticket_performance_id', params.eventId);
      addClause( criteria, 'ticket_status', [5,7]);

      criteria.clauses.forEach(( item ) => {
        Object.assign( resultParams, item );
      });
      
      // resultParams['SET::Query::max_rows'] = '5000';
      resultParams['GET'] = ['Result', 'Query::total_records', 'Query::current_page'];
      resultParams['ACCEPTWARNING'] = '4276'; // error otherwise
      
      return doSearch( resultParams, search => {
        return Object.keys( search.Result ).reduce(( result, idx ) => {
          if ( Number.isNaN( Number( idx ) ) ) {
            return result;
          }                                                                                         
                                                                                          
          const row = search.Result[idx];

          result.data['total'] += Number(row['ticket_id'].standard.trim());
          result.data['set'].push({
            total: Number(row['ticket_id'].standard.trim()),            
            type: row['PriceType.price_type_name'].display.trim()
          });
          
          return result;
        }, {
          total: search.hasOwnProperty('total_records') ? Number( search.total_records.standard ) : 0,
          page: search.hasOwnProperty('current_page') ? Number( search.current_page.standard ) : params.page,
          data: {
            total: 0,
            set: []
          }
        });
      });
    }
  });
};

/**
* @param string
*          sessionId
* @param object
*          params
* @return Promise
*/
const eventAdmissionsSold = ( server, sessionId, params = {}) => {
 return searchQuery({
   server: server,
   sessionId: sessionId,
   entity: 'ts_order_admission',
   onEntity: ( doSearch ) => {

     let order = 0;
     const resultParams = createQueryResultMemberParameters( [{
       name: 'orderadmission_id',
       order: ++order,
       'function': 101 // COUNT
     }, {
       name: 'orderadmission_net_paid_delta',
       order: ++order,
       'function': 104
     }] );

     resultParams['SET::Search::page_size'] = 1000;
     resultParams['SET::Query::current_page'] = 1;

     let criteria = {
         clauses: []
     };
     
     addClause( criteria, 'orderadmission_performance_id', params.eventId);

     criteria.clauses.forEach(( item ) => {
       Object.assign( resultParams, item );
     });
     
     // resultParams['SET::Query::max_rows'] = '5000';
     resultParams['GET'] = ['Result', 'Query::total_records', 'Query::current_page'];
     resultParams['ACCEPTWARNING'] = '4276'; // error otherwise

     return doSearch( resultParams, search => {
       return Object.keys( search.Result ).reduce(( result, idx ) => {
         if ( Number.isNaN( Number( idx ) ) ) {
           return result;
         }

         const row = search.Result[idx];

         result.data['total'] = Number(row['orderadmission_id'].standard.trim());
         result.data['amount'] = row['orderadmission_net_paid_delta'].standard.trim();
         
         return result;
       }, {
         total: search.hasOwnProperty('total_records') ? Number( search.total_records.standard ) : 0,
         page: search.hasOwnProperty('current_page') ? Number( search.current_page.standard ) : params.page,
         data: {
           total: 0,
           amount: '0'
         }
       });
     });
   }
 });
};

/**
* @param string
*          sessionId
* @param object
*          params
* @return Promise
*/
const eventAdmissionsComped = ( server, sessionId, params = {}) => {
 return searchQuery({
   server: server,
   sessionId: sessionId,
   entity: 'ts_order_admission',
   onEntity: ( doSearch ) => {

     let order = 0;
     const resultParams = createQueryResultMemberParameters( [{
       name: 'orderadmission_id',
       order: ++order,
     }, {
       name: 'orderadmission_comp_count_delta',
       order: ++order,
       'function': 104 // SUM
     }] );

     resultParams['SET::Search::page_size'] = 1000;
     resultParams['SET::Query::current_page'] = 1;

     let criteria = {
         clauses: []
     };
     
     addClause( criteria, 'orderadmission_performance_id', params.eventId);

     criteria.clauses.forEach(( item ) => {
       Object.assign( resultParams, item );
     });
     
     // resultParams['SET::Query::max_rows'] = '5000';
     resultParams['GET'] = ['Result', 'Query::total_records', 'Query::current_page'];
     resultParams['ACCEPTWARNING'] = '4276'; // error otherwise

     return doSearch( resultParams, search => {
       return Object.keys( search.Result ).reduce(( result, idx ) => {
         if ( Number.isNaN( Number( idx ) ) ) {
           return result;
         }

         const row = search.Result[idx];

         result.data['total'] = Number(row['orderadmission_comp_count_delta'].standard.trim());
         
         return result;
       }, {
         total: search.hasOwnProperty('total_records') ? Number( search.total_records.standard ) : 0,
         page: search.hasOwnProperty('current_page') ? Number( search.current_page.standard ) : params.page,
         data: {}
       });
     });
   }
 });
};

/**
* @param string
*          sessionId
* @param object
*          params
* @return Promise
*/
const eventAdmissionsCosts = ( server, sessionId, params = {}) => {
  return searchQuery({
    server: server,
    sessionId: sessionId,
    entity: 'ts_admission',
    onEntity: ( doSearch ) => {

      let order = 0;
      const resultParams = createQueryResultMemberParameters( [{
        name: 'admission_id',
        order: ++order,
        'function': 101 // COUNT
      }, {
        name: 'admission_acquisition_cost_currency',
        order: ++order,
        option: 5
      }, {
        name: 'admission_acquisition_cost_amount',
        order: ++order,
        'function': 104 // SUM
      } ] );

      resultParams['SET::Search::page_size'] = 1000;
      resultParams['SET::Query::current_page'] = 1;

      let criteria = {
          clauses: []
      };
      
      addClause( criteria, 'admission_performance_id', params.eventId);

      criteria.clauses.forEach(( item ) => {
        Object.assign( resultParams, item );
      });
      
      // resultParams['SET::Query::max_rows'] = '5000';
      resultParams['GET'] = ['Result', 'Query::total_records', 'Query::current_page'];
      resultParams['ACCEPTWARNING'] = '4276'; // error otherwise

      return doSearch( resultParams, search => {
        return Object.keys( search.Result ).reduce(( result, idx ) => {
          if ( Number.isNaN( Number( idx ) ) ) {
            return result;
          }

          const row = search.Result[idx];

          result.data['costCurrency'] = row['admission_acquisition_cost_currency'].standard.trim();
          result.data['costTotal'] = Number(row['admission_acquisition_cost_amount'].standard.trim());
          result.data['costTotalFormatted'] = row['admission_acquisition_cost_amount'].display.trim();
          result.data['total'] = Number(row['admission_id'].standard.trim());
          
          return result;
        }, {
          total: search.hasOwnProperty('total_records') ? Number( search.total_records.standard ) : 0,
          page: search.hasOwnProperty('current_page') ? Number( search.current_page.standard ) : params.page,
          data: {}
        });
      });
    }
  });
};
 
const eventAdmissions = ( server, sessionId, params = {}) => {
  return searchQuery({
    server: server,
    sessionId: sessionId,
    entity: 'ts_admission',
    onEntity: ( doSearch ) => {

      let order = 0;
      const resultParams = createQueryResultMemberParameters( [{
        name: 'admission_id',
        order: ++order,
      },{
        name: 'admission_price_value_id',
        order: ++order,
      },{
        name: 'PriceValue.',
        order: ++order,
      },{
        name: 'PriceValue.StoredValueAmounts.stored_value_amounts_amount',
        order: ++order,
      }]);

      resultParams['SET::Search::page_size'] = 1000;
      resultParams['SET::Query::current_page'] = 1;

      let criteria = {
          clauses: []
      };
      
      addClause( criteria, 'admission_performance_id', params.eventId);

      criteria.clauses.forEach(( item ) => {
        Object.assign( resultParams, item );
      });
      
      // resultParams['SET::Query::max_rows'] = '5000';
      resultParams['GET'] = ['Result', 'Query::total_records', 'Query::current_page'];
      resultParams['ACCEPTWARNING'] = '4276'; // error otherwise

      return doSearch( resultParams, search => {
        return Object.keys( search.Result ).reduce(( result, idx ) => {
          if ( Number.isNaN( Number( idx ) ) ) {
            return result;
          }

          const row = search.Result[idx];

          result.data['costCurrency'] = row['admission_acquisition_cost_currency'].standard.trim();
          result.data['costTotal'] = Number(row['admission_acquisition_cost_amount'].standard.trim());
          result.data['costTotalFormatted'] = row['admission_acquisition_cost_amount'].display.trim();
          result.data['total'] = Number(row['admission_id'].standard.trim());
          
          return result;
        }, {
          total: search.hasOwnProperty('total_records') ? Number( search.total_records.standard ) : 0,
          page: search.hasOwnProperty('current_page') ? Number( search.current_page.standard ) : params.page,
          data: {}
        });
      });
    }
  });
};

/**
* @param string
*          sessionId
* @param object
*          params
* @return Promise
*/
const eventRevenue = ( server, sessionId, params = {}) => {
 return searchQuery({
   server: server,
   sessionId: sessionId,
   entity: 'ts_order_admission',
   onEntity: ( doSearch ) => {

     let order = 0;
     const resultParams = createQueryResultMemberParameters( [{
       name: 'orderadmission_net_paid_delta',
       order: ++order,
       'function': 104 // SUM
     }, {
       name: 'orderadmission_net_paid_currency',
       order: ++order,
       option: 5
     }] );

     resultParams['SET::Search::page_size'] = 1000;
     resultParams['SET::Query::current_page'] = 1;

     let criteria = {
         clauses: []
     };
     
     addClause( criteria, 'orderadmission_performance_id', params.eventId);

     criteria.clauses.forEach(( item ) => {
       Object.assign( resultParams, item );
     });
     
     // resultParams['SET::Query::max_rows'] = '5000';
     resultParams['GET'] = ['Result', 'Query::total_records', 'Query::current_page'];
     resultParams['ACCEPTWARNING'] = '4276'; // error otherwise

     return doSearch( resultParams, search => {
       return Object.keys( search.Result ).reduce(( result, idx ) => {
         if ( Number.isNaN( Number( idx ) ) ) {
           return result;
         }

         const row = search.Result[idx];

         result.data.push({
           total: Number(row['orderadmission_net_paid_delta'].standard.trim()),
           totalFormatted: row['orderadmission_net_paid_delta'].display.trim(),
           totalCurrency: row['orderadmission_net_paid_currency'].standard.trim()
         });
         
         return result;
       }, {
         total: search.hasOwnProperty('total_records') ? Number( search.total_records.standard ) : 0,
         page: search.hasOwnProperty('current_page') ? Number( search.current_page.standard ) : params.page,
         data: []
       });
     });
   }
 });
};

const eventPricing = ( server, sessionId, params = {}) => {
  return searchQuery({
    server: server,
    sessionId: sessionId,
    entity: 'ts_performance_model_pricing',
    onEntity: ( doSearch ) => {

      let order = 0;
      const resultParams = createQueryResultMemberParameters( [{
        name: 'performancemodelpricing_id',
        order: ++order,
      }, {
        name: 'performancemodelpricing_performance_id',
        order: ++order,
      }, {
        name: 'performancemodelpricing_price_zone_id',
        order: ++order,
      }, {
        name: 'performancemodelpricing_rate_amount',
        order: ++order,
      }, {
        name: 'performancemodelpricing_rate_type',
        order: ++order,
      }, {
        name: 'PriceZone.value_legend_label',
        order: ++order,
      }, {
        name: 'PriceZone.value_legend_value',
        order: ++order,
      }]);

      let criteria = {
          clauses: []
      };

      addClause( criteria, 'performancemodelpricing_performance_id', params.eventId);

      criteria.clauses.forEach(( item ) => {
        Object.assign( resultParams, item );
      });
      
      // resultParams['SET::Query::max_rows'] = '5000';
      resultParams['GET'] = ['Result'];
      resultParams['ACCEPTWARNING'] = '4276'; // error otherwise
      
      return doSearch( resultParams, search => {
        return Object.keys( search.Result ).reduce(( result, idx ) => {
          if ( Number.isNaN( Number( idx ) ) ) {
            return result;
          }

          const row = search.Result[idx];

          result.data.push({
            'priceZoneId': row['performancemodelpricing_price_zone_id'].standard.trim(),
            'rateAmount': row['performancemodelpricing_rate_amount'].standard.trim(),
            'rateType': row['performancemodelpricing_rate_type'].standard.trim(),
            'label': row['PriceZone.value_legend_label'].standard.trim(),
            'value': row['PriceZone.value_legend_value'].standard.trim(),
          });
          
          return result;
        }, {
          data: []
        });
      });
    }
  });
};

// const performancePriceChartAssignment =
const performancePriceChartAssignment = ( server, sessionId, params = {}) => {  
  return searchQuery({
    server: server,
    sessionId: sessionId,
    entity: 'ts_price_chart',
    onEntity: ( doSearch ) => {

      let order = 0;
      const resultParams = createQueryResultMemberParameters( [{
        name: 'pricechart_id',
        order: ++order,
      }/*, {
        name: 'Assignment.assignment_id',
        order: ++order,
      }, {
        name: 'Assignment.pricechartassignment_pricechart_id',
        order: ++order,
      }, {
        name: 'PriceZone.pricechartzone_zone_id',
        order: ++order,
      }*/]);

      let criteria = {
          clauses: []
      };

      addClause( criteria, 'pricechart_id', params.chartId);

      criteria.clauses.forEach(( item ) => {
        Object.assign( resultParams, item );
      });
      
      // resultParams['SET::Query::max_rows'] = '5000';
      resultParams['GET'] = ['Result'];
      // resultParams['ACCEPTWARNING'] = '4276'; // error otherwise

      // console.log(resultParams);
      
      return doSearch( resultParams, search => {
        return Object.keys( search.Result ).reduce(( result, idx ) => {
          if ( Number.isNaN( Number( idx ) ) ) {
            return result;
          }

          const row = search.Result[idx];

          result.data.push({
            'priceChartId': row['pricechart_id'].standard.trim(),
            // 'assignmentId': row['PriceChart.Assignment.pricechartassignment_id'].standard.trim(),
            // 'priceChartId': row['PriceChart.Assignment.pricechartassignment_pricechart_id'].standard.trim(),
            // 'priceZoneId': row['PriceChart.PriceZone.pricechartzone_zone_i'].standard.trim(),
          });
          
          return result;
        }, {
          data: []
        });
      });
    }
  });
};


const eventCustomers = ( server, sessionId, params ) => {
  // console.log('--- params', params);
  
  return searchQuery( {
    server: server,
    sessionId: sessionId,
    entity: 'ts_customer',
    onEntity: ( doSearch ) => {

      let order = 0;
      const resultParams = createQueryResultMemberParameters( [{
        name: 'customer_id',
        order: ++order,
        option: 5 // grouped
      }, {
        name: 'customer_number',
        order: ++order,
      }, {
        name: 'customer_value',
        order: ++order,
      }, {
        name: 'customer_organization_name',
        order: ++order,
      }, {
        name: 'DefaultContact.contact_first_name',
        order: ++order,
      }, {
        name: 'DefaultContact.contact_last_name',
        order: ++order,
      }, {
        name: 'DefaultContact.contact_email',
        order: ++order,
      }, {
        name: 'DefaultContact.contact_gender',
        order: ++order,
      }, {
        name: 'DefaultContact.contact_birth_date',
        order: ++order,
      }, {
        name: 'DefaultContact.contact_language',
        order: ++order,
      }, {
        name: 'DefaultContact.contact_company',
        order: ++order,
      }, {
        name: 'DefaultContact.contact_phone_number1',
        order: ++order,
      }, {
        name: 'DefaultContact.contact_phone_number2',
        order: ++order,
      }, {
        name: 'DefaultContact.contact_phone_number3',
        order: ++order,
      }, {
        name: 'DefaultAddress.address_city',
        order: ++order,
      }, {
        name: 'DefaultAddress.address_state',
        order: ++order,
      }, {
        name: 'DefaultAddress.address_country',
        order: ++order,
      }, {
        name: 'DefaultAddress.address_verification_state',
        order: ++order,
      }, {
        name: 'DefaultAddress.address_latitude',
        order: ++order,
      }, {
        name: 'DefaultAddress.address_longitude',
        order: ++order,
      }] );

      // now filters
      const criteria = { clauses: [], filters: [] };
      
      // check favourites
      if (params.hasOwnProperty('favourites') && params.favourites.length > 0) {
        addClause( criteria, 'customer_id', params.favourites);
      }
      
      addClause( criteria, 'Order.OrderAdmission.orderadmission_performance_id', params.eventId);

      // if searching
      if (params.hasOwnProperty('search') && params.search !== null) {        
        // we may be able to split the name into two or more.. if two or more.. use first and use last only
        const names = params.search.split(' ');

        if (names.length > 1) {
          const contains = [
            names[0].concat('%'), 
            names[names.length - 1].concat('%')
          ];
          
          addClause( criteria, 'DefaultContact.contact_first_name', contains, 'CONTAINS');
          addClause( criteria, 'DefaultContact.contact_last_name', contains, 'CONTAINS');
        }
        else if (names.length > 0) {
          addClause( criteria, 'DefaultContact.contact_first_name', names[0].concat('%'), 'CONTAINS');
        }
      }
       
      // add criteria to resultParams
      criteria.clauses.forEach( criterion => {
        Object.assign( resultParams, criterion );
      });

      // add filters to resultParams
      criteria.filters.forEach( criterion => {
        Object.assign( resultParams, criterion );
      });

      if ( params.hasOwnProperty( 'pageSize' ) ) {
        resultParams['SET::Search::page_size'] = params.pageSize;
      }
      if ( params.hasOwnProperty( 'page' ) ) {
        resultParams['SET::Query::current_page'] = params.page;
      }
      // resultParams['SET::Query::max_rows'] = '5000';
      resultParams['GET'] = ['Result', 'Query::total_records', 'Query::current_page'];
      resultParams['ACCEPTWARNING'] = '4276'; // error otherwise

      // console.log('--- query', resultParams);
      
      return doSearch( resultParams, ( search ) => {
        return Object.keys( search.Result ).reduce(( result, idx ) => {
          if ( Number.isNaN( Number( idx ) ) ) {
            return result;
          }
          const row = search.Result[idx];

          const data = {
              customerid: row['customer_id'].display,
              customernumber: row['customer_number'].display,
              customervalue: row['customer_value'].display,
              organization: row['customer_organization_name'].display,
              firstname: row['DefaultContact.contact_first_name'].display,
              lastname: row['DefaultContact.contact_last_name'].display,
              email: row['DefaultContact.contact_email'].display,
              gender: row['DefaultContact.contact_gender'].display,
              birthdate: row['DefaultContact.contact_birth_date'].display,
              language: row['DefaultContact.contact_language'].display,
              company: row['DefaultContact.contact_company'].display,
              phone1: row['DefaultContact.contact_phone_number1'].display,
              phone2: row['DefaultContact.contact_phone_number2'].display,
              phone3: row['DefaultContact.contact_phone_number3'].display,
              addresscity: row['DefaultAddress.address_city'].display,
              addressstate: row['DefaultAddress.address_state'].display,
              addresscountry: row['DefaultAddress.address_country'].display,
              addressverified: row['DefaultAddress.address_verification_state'].display,
              addresslat: row['DefaultAddress.address_latitude'].display,
              addresslng: row['DefaultAddress.address_longitude'].display,
              hashCode: hashCode(row['customer_id'].standard)
          };

          result.data.push( data );
          return result;
        }, {
          total: search.hasOwnProperty('total_records') ? Number( search.total_records.standard ) : 0,
          page: search.hasOwnProperty('current_page') ? Number( search.current_page.standard ) : params.page,
          data: []
        });
      });
    }
  });
};

const eventCustomerAdmissions = ( server, sessionId, params ) => {
  return searchQuery( {
    server: server,
    sessionId: sessionId,
    entity: 'ts_order_admission',
    onEntity: ( doSearch ) => {

      let order = 0;
      const resultParams = createQueryResultMemberParameters( [{
        name: 'orderadmission_id',
        order: ++order,
      }, {
        name: 'orderadmission_amount_paid',
        order: ++order,
      }, {
        name: 'orderadmission_amount_paid_currency',
        order: ++order,
      }, {
        name: 'orderadmission_default_amount',
        order: ++order,
      }, {
        name: 'orderadmission_resale_price',
        order: ++order,
      }, {
        name: 'orderadmission_print_status',
        order: ++order,
      }, {
        name: 'Seat.Section.section_name',
        order: ++order,
      }, {
        name: 'Seat.seat_row',
        order: ++order,
      }, {
        name: 'Seat.seat_seat',
        order: ++order,
      }, {
        name: 'Seat.seat_sys_section',
        order: ++order,
      }, {
        name: 'Seat.seat_sys_row',
        order: ++order,
      }, {
        name: 'Seat.seat_sys_seat',
        order: ++order,
      }, {
        name: 'Seat.Section.section_level',
        order: ++order,
      }, {
        name: 'Seat.Section.section_admission_type',
        order: ++order,
      }, {
        name: 'Ticket.ticket_status',
        order: ++order,
      }, {
        name: 'Ticket.ticket_mark_description',
        order: ++order,
      }, {
        name: 'Ticket.ticket_taken_date',
        order: ++order,
      }] );

      // now filters
      const criteria = { clauses: [], filters: [] };
      
      addClause( criteria, 'Order.order_customer_id', params.customerId);
      addClause( criteria, 'orderadmission_performance_id', params.eventId);
      
      // add criteria to resultParams
      criteria.clauses.forEach( criterion => {
        Object.assign( resultParams, criterion );
      });

      // add filters to resultParams
      criteria.filters.forEach( criterion => {
        Object.assign( resultParams, criterion );
      });

      // ordering
      Object.assign( resultParams, {
        "SET::Query::OrderBy::1::name" : 'Seat.seat_sys_section',
        "SET::Query::OrderBy::1::type" : 'ASC'
      });
      Object.assign( resultParams, {
        "SET::Query::OrderBy::2::name" : 'Seat.seat_sys_row',
        "SET::Query::OrderBy::2::type" : 'ASC'
      });
      Object.assign( resultParams, {
        "SET::Query::OrderBy::3::name" : 'Seat.seat_sys_seat',
        "SET::Query::OrderBy::3::type" : 'ASC'
      });
            
      // resultParams['SET::Query::max_rows'] = '5000';
      resultParams['GET'] = ['Result'];
      resultParams['ACCEPTWARNING'] = '4276'; // error otherwise

      // console.log(resultParams);
      
      const ticketStatuses = {
        "3": "Cancelled",
        "4": "Not Printed",
        "1": "Printed",
        "7": "Re-entered",
        "10": "Ticket Already Used",
        "15": "Ticket Cancelled",
        "14": "Ticket Error - Other",
        "12": "Ticket Has Not Yet Entered",
        "11": "Ticket Not Found",
        "13": "Ticket Status Invalid",
        "5": "Used (In)",
        "6": "Used (Out)",
        "9": "Wrong Gate",
        "8": "Wrong Performance", 
      };

      return doSearch( resultParams, ( search ) => {
        return Object.keys( search.Result ).reduce(( result, idx ) => {
          if ( Number.isNaN( Number( idx ) ) ) {
            return result;
          }

          const row = search.Result[idx];
                
          const data = {
              orderadmission_id: row['orderadmission_id'].standard,
              amountPaid: row['orderadmission_amount_paid'].display,
              amountPaidCurrency: row['orderadmission_amount_paid_currency'].display,
              amountDefault: row['orderadmission_default_amount'].display,
              resalePrice: row['orderadmission_resale_price'].display,
              printStatus: row['orderadmission_print_status'].display,
              seatRow: row['Seat.seat_row'].display,
              seatSeat: row['Seat.seat_seat'].display,
              seatSection: row['Seat.Section.section_name'].display,
              seatSectionLevel: row['Seat.Section.section_level'].display,
              seatSectionType: row['Seat.Section.section_admission_type'].display,
              ticketStatus: (row['Ticket.ticket_status'].standard == "5" || row['Ticket.ticket_status'].standard == "7") ? 'Scanned' : 'Ready',
              ticketMark: row['Ticket.ticket_mark_description'].display,
              ticketDate: row['Ticket.ticket_taken_date'].standard,
              hashCode: hashCode(row['orderadmission_id'].standard)
          };

          result.data.push( data );
          return result;
        }, {
          data: []
        });
      });
    }
  });
};

// insight aggregator
const insights = ( server, sessionId, params ) => {
  let responses = {
    data: []
  };

  return favouritesAttending(server, sessionId, params)
  .then( response => {
    responses['data'] = responses.data.concat(response.data);

    return favouritesBoughtAdmissions(server, sessionId, params)
    .then( response => {
      responses['data'] = responses.data.concat(response.data);

      return favouritesDonated(server, sessionId, params)
      .then( response => {
        responses['data'] = responses.data.concat(response.data);

        return eventFavouritesYesterdaySummary(server, sessionId, params)
        .then( response => {
          responses['data'] = responses.data.concat(response.data);

          return eventTodaySummary(server, sessionId, params)
          .then( response => {
            responses['data'] = responses.data.concat(response.data);

            return eventYesterdaySummary(server, sessionId, params)
            .then( response => {
              responses['data'] = responses.data.concat(response.data);
              return responses;
            });            
          });
        });
      });
    });
  });
};
    
const ticketSalesByDateRange = ( server, sessionId, params ) => {
  return searchQuery( {
    server: server,
    sessionId: sessionId,
    entity: 'ts_order_admission',
    onEntity: ( doSearch ) => {
      
      // we pre-determine the interval required
      const diffDays = Moment(params.endDate).diff( Moment(params.startDate), 'days');
      let diffFunc;
      let diffPrefix;
      let diffRes;
      if (diffDays < 30) { // < 30 days
        // days
        diffFunc = 210; // 201;
        diffPrefix = '';
        diffRes = 'DAY';
      }
      else if (diffDays <= 180) { // < 6 months
        // weeks
        diffFunc = 209;
        diffPrefix = '';
        diffRes = 'WEEK';
      }
      else if (diffDays <= 730) { // < 2 years
        // months
        diffFunc = 204;
        diffPrefix = '';
        diffRes = 'MONTH';        
      }
      else { // > 2 years
        // years
        diffFunc = 205;
        diffPrefix = '';
        diffRes = 'YEAR';      
      }
      
      let order = 0;
      const resultParams = createQueryResultMemberParameters([{
        name: 'orderadmission_net_paid_currency',
        order: ++order,
        option: 5 // grouped
      }, {
        name: 'orderadmission_net_paid_delta',
        order: ++order,
        'function': 104 // SUM
      }, {
        name: 'orderadmission_audit_time',
        order: ++order,
        'function': diffFunc,
        option: 5 // grouped (ascending) 
      }]);
            
      let criteria = {
          clauses: []
      };
      
      // we only people that have donated between a start and enddate
      if (params.startDate !== null && typeof params.startDate !== 'undefined') {
        const startDate = Moment(params.startDate).format('YYYY-MM-DDT00:00:00.000');
        addClause( criteria, 'orderadmission_audit_time', startDate, '>=' );
      }
      if (params.endDate !== null && typeof params.endDate !== 'undefined') {
        const endDate = Moment(params.endDate).format('YYYY-MM-DDT23:59:59.999');
        addClause( criteria, 'orderadmission_audit_time', endDate, '<=' );
      }

      criteria.clauses.forEach(( item ) => {
        Object.assign( resultParams, item );
      });

      resultParams['GET'] = ['Result'];
      resultParams['ACCEPTWARNING'] = '4276'; // error otherwise
      
      return doSearch( resultParams, ( search ) => {
        return Object.keys( search.Result ).reduce(( result, idx ) => {
          if ( Number.isNaN( Number( idx ) ) ) {
            return result;
          }

          const row = search.Result[idx];
          
          const data = {
              currency: row['orderadmission_net_paid_currency'].standard,
              amount: row['orderadmission_net_paid_delta'].standard,
              interval: row[diffPrefix.concat('orderadmission_audit_time')].standard,
          };

          result.data.push( data );
          return result;
        }, {
          groupBy: diffRes,
          data: []
        });
      });
    }
  });
};

/**
 * @return API interface
 */
module.exports = {
    ping,
    loadBO,
    authenticate,
    renewPassword,
    changeUserPassword,
    getSessionCustomer,
    registry: {
      values: registryValues,
      value: registryValue,
      list: registryList
    },
    sessionLogout,

    insights,
    ticketSalesByDateRange,
    
    newDonors,
    newDonorsAmount,
    favouritesAttending,
    favouritesBoughtAdmissions,
    
    eventYesterdaySummary,
    eventTodaySummary,
    eventFavouritesYesterdaySummary,
    
    customer,
    customers,
    newCustomersCount,
    newCustomersSales,
    // customerStats: customerStats,
    customerMostRecentOrder,
    customerMostRecentGift,
    customerTotalPledged,
    customerTotalPledgedGiven,
    customerTotalSpend,
    customerEvents,
    customerActivity,

    events,
    eventSales,
    eventAdmissionsSoldCount,
    eventsToday,
    eventCategories,
    eventLocations,
    eventVenues,
    eventAttendance,
    eventAttendanceDetails,
    eventAdmissionsSold,
    eventAdmissionsSoldPriceTypes,
    eventRevenue,
    eventAdmissionsCosts,
    eventAdmissions,
    eventAdmissionsComped,
    eventPricing,
    eventCustomers,
    eventCustomerAdmissions
};