/*       */

import { createStore, applyMiddleware } from 'redux';
import Immutable from 'immutable';
import thunk from 'redux-thunk';
import {composeWithDevTools} from 'redux-devtools-extension';
import createSagaMiddleware, {END} from 'redux-saga';
import axios from 'axios';
import createHelpers from './createHelpers';
//import reducer from '../reducers';
//import rootReducer from '../modules/rootReducer';
import createReducer from '../rootReducers';

function configureStore(initialState) {

  const sagaMiddleware = createSagaMiddleware();
  const helpersConfig ={};
  const helpers = createHelpers(helpersConfig);

  // Redux Dev Tools store enhancer.
  // @see https://github.com/zalmoxisus/redux-devtools-extension
  // We only want this enhancer enabled for development and when in a browser
  // with the extension installed.
  const enhancers = composeWithDevTools(
    // Middleware store enhancer.
    applyMiddleware(
      // Initialising redux-thunk with extra arguments will pass the below
      // arguments to all the redux-thunk actions. Below we are passing a
      // preconfigured axios instance which can be used to fetch data with.
      // @see https://github.com/gaearon/redux-thunk
      thunk.withExtraArgument(helpers),
      sagaMiddleware
    ));
    // Redux Dev Tools store enhancer.
    // @see https://github.com/zalmoxisus/redux-devtools-extension
    // We only want this enhancer enabled for development and when in a browser
    // with the extension installed.

  //   process.env.NODE_ENV === 'development'
  //     && typeof window !== 'undefined'
  //     && typeof window.devToolsExtension !== 'undefined'
  //     // Call the brower extension function to create the enhancer.
  //     ? window.devToolsExtension()
  //     // Else we return a no-op function.
  //     : f => f
  // );

  // const store = initialState
  //   ? createStore(reducer, initialState, enhancers)
  //   : createStore(reducer, enhancers);
  // use immutable.js  see docs about immutable
  const data = Immutable.fromJS(initialState);
  const store = data
    ? createStore(createReducer(), data, enhancers)
    : createStore(createReducer(), enhancers);
  // const store = data
  //   ? createStore(rootReducer, data, enhancers)
  //   : createStore(rootReducer, enhancers);
  if (process.env.NODE_ENV === 'development' && module.hot) {
    // Enable Webpack hot module replacement for reducers. This is so that we
    // don't lose all of our current application state during hot reloading.
    // module.hot.accept('../reducers', () => {
    //   const nextRootReducer = require('../reducers').default; // eslint-disable-line global-require
        module.hot.accept('../rootReducers', () => {
        const nextRootReducer = require('../rootReducers').default; // eslint-disable-line global-require
          // module.hot.accept('../modules/rootReducer', () => {
          //   const nextRootReducer = require('../modules/rootReducer').default; // eslint-disable-line global-require
      store.replaceReducer(nextRootReducer);
    });
  }
  store.runSaga = sagaMiddleware.run;
  store.asyncReducers = {}; // Async reducer registry
  store.close = () => store.dispatch(END);
  return store;
}

// NOTE: If we create an '/api' endpoint in our application then we will neeed to
// configure the axios instances so that they will resolve to the proper URL
// endpoints on the server. We have to provide absolute URLs for any of our
// server bundles. To do so we can set the default 'baseURL' for axios. Any
// relative path requests will then be appended to the 'baseURL' in order to
// form an absolute URL.
// We don't need to worry about this for client side executions, relative paths
// will work fine there.
// Example:
//
// const axiosConfig = process.env.IS_NODE === true
//   ? { baseURL: process.env.NOW_URL || notEmpty(process.env.SERVER_URL) }
//   : {};
//
// Then we will then have to initialise our redux-thunk middlware like so:
//
// thunk.withExtraArgument({
//   axios: axios.create(axiosConfig),
// })

export default configureStore;
