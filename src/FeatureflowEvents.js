import request from 'request';
import debug from './debug';

export default class Events{
  constructor(apiKey, hostname){
    this.apiKey = apiKey;
    this.hostname = hostname;
  }

  _event(method, path, json){
    debug('%s to "%s" with json=%o', method, this.hostname+path, json);
    request({
      method,
      uri: this.hostname + path,
      json,
      headers: {
        'Authorization': 'Bearer '+this.apiKey,
      }
    }, (error, response, body)=>{
      if (error){
        //TODO Batch up messages in a queue and send them when the server comes back online.
        debug('error %s to "%s". message:', method, this.hostname+path, error.message);
        return;
      }
      if (response.statusCode < 200 || response.statusCode > 299){
        debug('error posting, uri="%s", json=%o, apiKey=%s', this.hostname+path, json, this.apiKey);
        debug('error response, %O', response.body);
      }
    })
  }

  send(featureKey, expectedVariant, evaluatedVariant, context){
    debug('sending evaluate event for feature "%s"', featureKey);
    this._event('POST', '/api/sdk/v1/events', [{
      featureKey,
      evaluatedVariant,
      expectedVariant,
      context
    }]);
  }

  register(features){
    debug('sending registration event for features="%o"', features);
    this._event('PUT', '/api/sdk/v1/register', features);
  }
}