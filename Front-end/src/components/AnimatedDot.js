import React, { Component } from 'react';
import "./AnimatedDot.css";
import Messaging from './Messaging';

class AnimatedDot extends Component {
  state = {
    notified: false // Flag to track whether notification has been triggered
  };

  componentDidMount() {
    Messaging.connectWithPromise()
      .then(() => {
        console.log('Connected to Solace Cloud');
      })
      .catch((error) => {
        console.error('Failed to connect to Solace Cloud', error);
      });

    // Adjust animation duration based on car speed
    this.adjustDotSpeed(100); // Adjust car speed as needed in km/hr

    // Check proximity and notify periodically (adjust the interval as needed)
    this.proximityInterval = setInterval(() => {
      this.checkProximityAndNotify(50); // Adjust the threshold distance as needed
    }, 1000); // Check every second

    // Publish dot position every 1 second
    this.publishDotPositionInterval = setInterval(this.publishDotPosition, 1000);
    document.addEventListener('keydown', this.handleKeyDown);
    
  }

  handleKeyDown = (event) => {
    // Check if the pressed key is the desired key to trigger the action (e.g., 'Enter' key)
    if (event.key === 'Enter') {
      // Perform publishing action here
      const dotElement = document.getElementById('dot');
      const position = {
        x: dotElement.offsetLeft,
        y: dotElement.offsetTop,
        car_no:"CAR-01"
      };
 
      const payload = JSON.stringify(position)
      Messaging.publish('emergency', payload)
      // You can publish or perform any other action here when the specified key is pressed
    }
  }

  componentWillUnmount() {
    clearInterval(this.proximityInterval);
    clearInterval(this.publishDotPositionInterval);
  }

  adjustDotSpeed(carSpeedKmPerHour) {
    const dotElement = document.getElementById('dot');
    const containerWidth = document.querySelector('.container').clientWidth;
    const dotWidth = dotElement.offsetWidth;
    const distanceToTravel = containerWidth - dotWidth; // Distance to travel

    // Calculate time taken to travel the distance at given speed (in milliseconds)
    const timeTakenInMillis =
      (distanceToTravel / 1000 / (carSpeedKmPerHour / 3600)) * 1000;

    // Update animation duration
    dotElement.style.animationDuration = timeTakenInMillis + 'ms';
  }

  calculateDistance(element1, element2) {
    const rect1 = element1.getBoundingClientRect();
    const rect2 = element2.getBoundingClientRect();
    const distance = Math.sqrt(
      Math.pow(rect1.x - rect2.x, 2) + Math.pow(rect1.y - rect2.y, 2)
    );
    return distance;
  }

  checkProximityAndNotify(thresholdDistance) {
    const dotElement = document.getElementById('dot');
    const dotStationElement = document.querySelector('.dot-station');
    const dotStationElement2 = document.querySelector('.dot-station2');
    const distance1 = this.calculateDistance(dotElement, dotStationElement);
    const distance2 = this.calculateDistance(dotElement, dotStationElement2);
    if (
      (distance1 < thresholdDistance || distance2 < thresholdDistance) &&
      !this.state.notified
    ) {
      // alert('Dot is near a dot-station!');
      this.setState({ notified: true }); // Set the flag to true to indicate that notification has been triggered
    } else if (distance1 >= thresholdDistance && distance2 >= thresholdDistance) {
      this.setState({ notified: false }); // Reset the flag when the dot moves away from the dot-stations
    }
  }

  publishDotPosition = () => {
    // Get dot position
    const dotElement = document.getElementById('dot');
    const position = {
      x: dotElement.offsetLeft,
      y: dotElement.offsetTop,
      car_no:"CAR-01"
    };

    const payload = JSON.stringify(position)
    // Publish dot position to a topic named 'car'
    Messaging.publish('cars', payload);

    // Pass position to parent component
    this.props.updatePosition(position);
  };

  render() {
    return (
      <div className="container">
        <div className="line"></div>
        <div className="dot" id="dot"></div>
        <div className="dot-station"></div>
        <div className="dot-station2"></div>
      </div>
    );
  }
}

export default AnimatedDot;
