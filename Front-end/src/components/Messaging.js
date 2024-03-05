import options from "./messaging-options";
import Paho from "paho-mqtt";

class Messaging extends Paho.Client {
  constructor() {
    super(
      options.invocationContext.host,
      Number(options.invocationContext.port),
      options.invocationContext.clientId
    );
    this.onMessageArrived = this.handleMessage.bind(this);
    this.callbacks = [];
  }

  connectWithPromise() {
    return new Promise((resolve, reject) => {
      options.onSuccess = () => {
        // Subscribe to the 'admin_news' topic upon successful connection
        this.subscribe('news/CAR-01');
        // this.subscribe('all_cars')
        this.subscribe('nearby/CAR-01');
        this.subscribe('alert');
        this.subscribe('charging/CAR-01');

        resolve();
      };
      options.onFailure = reject;
      this.connect(options);
    });
  }

  // called when the client loses its connection
  onConnectionLost(responseObject) {
    if (responseObject.errorCode !== 0) {
      console.log("Connection lost with Solace Cloud");
    }
    // Add auto connect logic with backoff here if you want to automatically reconnect
  }

  register(callback) {
    this.callbacks.push(callback);
  }

  unregister(callback) {
    this.callbacks = this.callbacks.filter(cb => cb !== callback);
  }

  // called when a message arrives
  handleMessage(message) {
    // console.log("Received message", message.payloadString);
    this.callbacks.forEach((callback) => callback(message));
  }
}

const messaging = new Messaging();
export default messaging;
