import {
  NativeModules,
  DeviceEventEmitter,
} from 'react-native';

const { ThreadManager } = NativeModules;
export default class Thread {
  eventSubscription = null
  constructor(jsPath) {
    if (!jsPath || !jsPath.endsWith('.js')) {
      throw new Error('Invalid path for thread. Only js files are supported');
    }

    this.id = ThreadManager.startThread(jsPath.replace(".js", ""))
      .then(id => {
        this.eventSubscription = DeviceEventEmitter.addListener(`Thread${id}`, (message) => {
          !!message && this.onmessage && this.onmessage(message);
        });
        return id;
      })
      .catch(err => { throw new Error(err) });
  }

  postMessage(message) {
    this.id.then(id => ThreadManager.postThreadMessage(id, message));
  }

  terminate() {
    this.eventSubscription && this.eventSubscription.remove()
    this.eventSubscription = null
    this.onmessage = null
    this.id.then(ThreadManager.stopThread);
  }
}
