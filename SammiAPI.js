/**
 * SammiAPI class is made to abstract the usage of the SAMMI api
 * @constructor
 * @param {number} port - This is an optional field that will change the
 * port number to whatever is entered on object creation. If no port is
 * entered it defaults to SAMMI's default api port 9450. You can change
 * this port with the changePort class method.
 */
class SammiAPI {
  static typeMap = new Map([
    ['getVariable', 'GET'],
    ['getDeckStatus', 'GET'],
    ['setVariable', 'POST'],
    ['deleteVariable', 'POST'],
    ['insertArray', 'POST'],
    ['deleteArray', 'POST'],
    ['changeDeckStatus', 'POST'],
    ['triggerButton', 'POST'],
    ['releaseButton', 'POST'],
    ['modifyButton', 'POST'],
    ['alertMessage', 'POST'],
    ['popupMessage', 'POST'],
    ['notificationMessage', 'POST'],
  ]);
  static defaultPort = 9450;
  constructor(port) {
    this.port = SammiAPI.defaultPort;
    if (this.#checkPortValidity(port)) {
      this.port = port;
    }
    this.baseURL = 'http://localhost:' + this.port + '/api';
  }

  // PRIVATE METHODS START HERE

  #checkPortValidity(port) {
    return (typeof (port) === 'number' && port >= 1 && port <= 65535);
  }

  #createNewURL(config) {
    const keys = Object.keys(config);
    let url = this.baseURL + '?';
    for (let i = 0; i < keys.length; i++) {
      url = url + keys[i] + '=' + config[keys[i]];
      if (i != keys.length - 1) {
        url = url + '&';
      }
    }
    return url;
  }

  async #getRequest(config) {
    const url = this.#createNewURL(config);
    let response;
    try {
      response = await fetch(url, { method: 'GET' });
    } catch (error) {
      console.log('FATAL ERROR', error);
    }

    if (response?.ok) {
      let data = await response.json();
      if (data?.data) {
        return data.data;
      }
      return data;
    } else {
      console.log(`HTTP Response Code: ${response?.status}   Response Text: ${response?.statusText}`);
    }
  }

  async #postRequest(config) {
    const url = this.baseURL;
    let response;
    try {
      response = await fetch(url, { method: 'POST', body: JSON.stringify(config) });
    } catch (error) {
      console.log('FATAL ERROR', error);
    }

    if (response?.ok) {
      let data = await response.json();
      if (data?.data) {
        return data.data;
      }
      return data;
    } else {
      console.log(`HTTP Response Code: ${response?.status}   Response Text: ${response?.statusText}`);
    }
  }

  // PRIVATE METHODS END HERE

  /**
   * Enter the port number you wish to switch to.
   * @param {number} port - port number
   */
  changePort(port) {
    this.port = SammiAPI.defaultPort;
    if (this.#checkPortValidity(port)) {
      this.port = port;
    }
    this.baseURL = 'http://localhost:' + this.port + '/api';
  }

  /**
   * @example SammiAPIobject.sendRequest({
   *    request: 'getVariable',
   *    name: 'myVarName',
   *    buttonID: 'myButtonID',
   * });
   * 
   * @param {object} config - See https://sammi.solutions/docs/api/reference
   * for a list of valid API requests.
   */
  async sendRequest(config) {
    const type = SammiAPI.typeMap.get(config.request);
    if (!type) {
      return 'Request type not recognized!';
    } else if (type === 'GET') {
      return await this.#getRequest(config);
    } else if (type === 'POST') {
      return await this.#postRequest(config);
    }
  }
}