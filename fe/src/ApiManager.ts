import { useCounterStore } from "./store/counter";
class ApiManager {
  counterStore;

  constructor() {
    // Constructor
    this.counterStore = useCounterStore();
  }

  getDoubleCounter() {
    return this.counterStore.doubleCount;
  }
}

export default ApiManager;
