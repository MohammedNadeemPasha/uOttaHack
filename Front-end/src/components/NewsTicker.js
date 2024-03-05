import React, { Component } from 'react';
import './NewsTicker.css'; // You'll need to create this CSS file for styling
import Messaging from './Messaging'; // Import your Messaging module

class NewsTicker extends Component {
  state = {
    latestNews: '',
    allCarsNew:'' // Initialize with an empty string for the latest news
  };

  componentDidMount() {
    // Register the component as a callback with the Messaging module
    Messaging.register(this.handleMessage);
  }

  componentWillUnmount() {
    // Unregister the component from Messaging module
    Messaging.unregister(this.handleMessage);
  }

  handleMessage = (message) => {
    // Handle incoming message from MQTT
    const newValue = message.payloadString;
    // Check the topic of the message
    if (message.destinationName === 'news/CAR-01' && this.props.userConsent === 'Charging_points') {
      // Update latest news
      this.setState((prevState) => ({
        latestNews: `${prevState.latestNews}\n${newValue}`,
      }));
    } else if (message.destinationName === 'nearby/CAR-01' && this.props.userConsent === 'Connect') {
      // Update all cars news
      this.setState((prevState) => ({
        allCarsNews: `${prevState.allCarsNews}\n${newValue}`,
      }));
      this.props.updateAllCars(this.state.allCarsNews);
    }
  };

  render() {
    const { latestNews, allCarsNews } = this.state;
    const {newsType} = this.props;

    if(newsType === 'latestNews'){
      return (
        <div className="news-ticker-container">
          <div className="news-ticker">
            <div className="news-item active">
              <h3>Latest News:</h3>
              <p>{latestNews}</p>
            </div>
          </div>
        </div>
      );
    }
    else{
      return (
        <div className="news-ticker-container">
          <div className="news-ticker">
            <div className="news-item active">
              <h3>All Cars News:</h3>
              <p>{allCarsNews}</p>
            </div>
          </div>
        </div>
      );
    }
  }
}

export default NewsTicker;
