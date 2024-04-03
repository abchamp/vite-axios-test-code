// import ApiManager from "./ApiManager";

import ApiManager from "./ApiManager";

class AuthService extends ApiManager {
  // apiManager: ApiManager;

  // constructor() {
  //   console.log("auth service constructor");
  //   this.apiManager = new ApiManager();
  // }

  getDoubleCounterFromStore() {
    console.log("do");
    return this.getDoubleCounter();
  }
}

export default new AuthService();
