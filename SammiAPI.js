/**
 * SammiAPI class to abstract the usage of the SAMMI api
 * @constructor
 * @param {object} config - {port, password} : optional object that
 * takes a port and/or a password for the SammiAPI requests. If nothing
 * is passed as an argument then it uses the default port and no password
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
  constructor(config) {
    this.port = SammiAPI.defaultPort;
    if (this.#checkPortValidity(config?.port)) {
      this.port = config?.port;
    }
    if (config?.password) {
      this.password = config?.password;
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
    const heads = new Headers()
    if (this.password) {
      heads.append('Authorization', this.password);
    }
    try {
      response = await fetch(url, { method: 'GET', headers: heads });
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
    const heads = new Headers()
    if (this.password) {
      heads.append('Authorization', this.password);
    }
    try {
      response = await fetch(url, { method: 'POST', body: JSON.stringify(config), headers: heads });
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
   * Enter the password you wish to switch to.
   * @param {string} password - password
   */
  changePassword(password) {
    this.password = password;
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
    if (!this.#checkPortValidity(this.port)) {
      return 'Invalid port: ' + this.port;
    }
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