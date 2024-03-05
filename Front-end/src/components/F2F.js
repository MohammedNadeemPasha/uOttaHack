import React, { Component } from 'react';
import "./F2F.css";
import Messaging from './Messaging';

class F2F extends Component {
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


    // Publish dot position every 1 second
    this.publishDotPositionInterval = setInterval(this.publishDotPosition, 1000);
  }

  componentWillUnmount() {
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
  };

  render() {
    const {initialPosition } = this.props;
    const dotStyle = initialPosition 
      ? { backgroundColor: 'blue', // Change color based on condition
      animation: 'moveDot 53s linear forwards',left: initialPosition, top: initialPosition.y }
      : {backgroundColor: 'white',
      opacity:0, // Default state color
      left: '0', // Default starting position
      top: 'calc(50% - 4px)',};
    return (
      <div className="container">
        <div className="line"></div>
        <div className="dot" id="dot" ></div>
        <div className="dot2" id="dot" style = {dotStyle} ></div>
      </div>
    );
  }
}

export default F2F;