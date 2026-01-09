import { AmfHelperMixin } from '@api-components/amf-helper-mixin/amf-helper-mixin.js';
import { LitElement } from 'lit-element';

export const AmfLoader = {};

class HelperElement extends AmfHelperMixin(LitElement) {}
window.customElements.define('helper-element', HelperElement);

const helper = new HelperElement();

AmfLoader.load = async function(compact=false, fileName='demo-api') {
  compact = compact ? '-compact' : '';
  const file = `${fileName}${compact}.json`;
  const url = location.protocol + '//' + location.host + '/base/demo/'+ file;
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.addEventListener('load', (e) => {
      let data;
      try {
        data = JSON.parse(e.target.response);
        /* istanbul ignore next */
      } catch (e) {
        /* istanbul ignore next */
        reject(e);
        /* istanbul ignore next */
        return;
      }
      resolve(data);
    });
    /* istanbul ignore next */
    xhr.addEventListener('error',
      () => reject(new Error('Unable to load model file')));
    xhr.open('GET', url);
    xhr.send();
  });
};

AmfLoader.lookupEndpoint = function(model, endpoint) {
  helper.amf = model;
  const webApi = helper._computeWebApi(model);
  // Try to find by path first (REST)
  let result = helper._computeEndpointByPath(webApi, endpoint);
  
  // If not found and endpoint doesn't start with '/', try finding by name (gRPC)
  if (!result && !endpoint.startsWith('/')) {
    const endpointKey = helper._getAmfKey(helper.ns.aml.vocabularies.apiContract.endpoint);
    const endpoints = helper._ensureArray(webApi[endpointKey]);
    result = endpoints.find((ep) => {
      const name = helper._getValue(ep, helper.ns.aml.vocabularies.core.name);
      return name === endpoint;
    });
  }
  
  return result;
};

AmfLoader.lookupOperation = function(model, endpoint, operation) {
  const endPoint = AmfLoader.lookupEndpoint(model, endpoint, operation);
  const opKey = helper._getAmfKey(helper.ns.aml.vocabularies.apiContract.supportedOperation);
  const ops = helper._ensureArray(endPoint[opKey]);
  return ops.find((item) => helper._getValue(item, helper.ns.aml.vocabularies.apiContract.method) === operation);
};

AmfLoader.responseModel = function(model, endpoint, operation) {
  const method = AmfLoader.lookupOperation(model, endpoint, operation);
  return helper._computeReturns(method);
}

AmfLoader.linksModel = function(model, endpoint, operation, status) {
  status = String(status);
  const returns = AmfLoader.responseModel(model, endpoint, operation);
  const response = returns.find((item) => {
    const value = helper._getValue(item, helper.ns.aml.vocabularies.apiContract.statusCode);
    return value === status;
  });
  const key = helper._getAmfKey(helper.ns.aml.vocabularies.apiContract.link);
  return helper._ensureArray(response[key]);
}
