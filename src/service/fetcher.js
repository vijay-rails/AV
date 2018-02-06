const defaultOptions = [
  ['credentials', 'same-origin'],
  ['mode', 'cors'],
  ['redirect', 'follow'],
  ['headers', {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }],
];

const BASE_URL = '';

function fetcher(endpoint, params = {}) {
  const config = createParams(params);
  return fetch(endpoint, config)
    .then(checkStatus)
    .then(response => response.json());
}

// fetch helper functions
function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }
  return response.json().then((err) => {
    const error = new Error(response.statusText);
    error.response = err || {};
    throw error;
  });
}

function createParams(configParams) {
  const newConfig = defaultOptions.reduce((agg, option) => {
    agg[option[0]] = option[1];
    return agg;
  }, {});
  for (const key in configParams) {
    if (configParams.hasOwnProperty(key)) {
      newConfig[key] = configParams[key];
    }
  }
  return newConfig;
}

function createQueryString(queries) {
  const queryStack = [];
  for (const p in queries) {
    if (queries.hasOwnProperty(p)) {
      queryStack.push(encodeURIComponent(p) + '=' + encodeURIComponent(queries[p]));
    }
  }
  return queryStack.length > 0 ? '?' + queryStack.join('&') : '';
}

function createEndpoint(pieces = [], base = true, queryParams) {
  const queryString = createQueryString(queryParams);
  return (base ? BASE_URL : '/') + pieces.join('/') + queryString;
}

// modular rest calls
export function get(pathPieces = [], query = {}, baseUrl = true, config = {}) {
  const endpoint = createEndpoint(pathPieces, baseUrl, query);
  config.method = 'get';
  return fetcher(endpoint, config);
}

export function post(pathPieces = [], body = {}, baseUrl = true, config = {}) {
  const endpoint = createEndpoint(pathPieces, baseUrl);
  config.method = 'post';
  config.body = JSON.stringify(body);
  return fetcher(endpoint, config);
}

export function put(pathPieces = [], body = {}, baseUrl = true, config = {}) {
  const endpoint = createEndpoint(pathPieces, baseUrl);
  config.method = 'put';
  config.body = JSON.stringify(body);
  return fetcher(endpoint, config);
}

export function destroy(pathPieces = [], body = {}, baseUrl = true, config = {}) {
  const endpoint = createEndpoint(pathPieces, baseUrl);
  config.method = 'delete';
  config.body = JSON.stringify(body);
  return fetcher(endpoint, config);
}
