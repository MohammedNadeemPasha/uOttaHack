// App.js
import React, { Component } from 'react';
import WelcomeMessage from './components/welcomeMessage';
import AnimatedDot from './components/AnimatedDot';
import mySound from './sounds/ford-start.mp3';
import './App.css';
import NewsTicker from './components/NewsTicker';
import F2F from './components/F2F';

class App extends Component {
  constructor() {
    super();
    this.state = {
      showWelcome: true,
      showBackground: false,
      showConsentModal: false,
      userConsent: '',
      allCars: [],
      position: { x: 0, y: 0, car_no: '' },
      initialPosition:0,
    };
    this.closeWelcome = this.closeWelcome.bind(this);
    this.audio = new Audio(mySound);
  }

  closeWelcome() {
    this.setState({
      showWelcome: false,
      showConsentModal: true,
      showBackground: true
    });
    this.audio.currentTime = 1;
    this.audio.play().catch((error) => console.error('Audio play failed:', error));

    // After the sound plays for 3 seconds, show a blank screen
    setTimeout(() => {
      this.audio.pause();
      this.audio.currentTime = 0;
    }, 3000);
  }

  componentDidMount() {}

  handleConsent = (consentType) => {
    this.setState({
      showConsentModal: false,
      userConsent: consentType,
      showBackground: true,
    });
  };

  renderConsentModal() {
    if (!this.state.showConsentModal) return null;

    return (
      <div className="modal">
        <div className="modal-content">
          <h2>Which service would you like to choose from</h2>
          <button onClick={() => this.handleConsent('Charging_points')}>Charging points</button>
          <button onClick={() => this.handleConsent('Connect')}>Connect with fellow Ford travelers</button>
          <button onClick={() => this.handleConsent('Exit')}>Exit</button>
        </div>
      </div>
    );
  }

  updatePosition = (newPosition) => {
    this.setState({ position: newPosition });
  }

  updateAllCars = (newCarString) => {
    if (newCarString !== undefined && newCarString.trim() !== '') {
      let newCar;
      try {
        // Attempt to find the first JSON object in the string
        const match = newCarString.match(/{.*?}/);
        if (match) {
          newCar = JSON.parse(match[0]);
        } else {
          throw new Error("No JSON object found");
        }
      } catch (error) {
        console.error("Error parsing newCarString:", error);
        return; // Exit if parsing fails
      }
  
      this.setState(prevState => {
        // Check if the car_no already exists in the allCars array
        const carExists = prevState.allCars.some(car => car.car_no === newCar.car_no);
        if (!carExists) {
          // If not, add the newCar to the array
          return {
            allCars: [...prevState.allCars, newCar]
          };
        } else {
          // If it exists, do not modify the state
          return {};
        }
      }, () => { console.log(this.state.allCars); });
    }
    this.setState({initialPosition:this.state.allCars[0].x})
  }
  

  render() {
    if (this.state.showBlankScreen) {
      return <div className="blank-screen"></div>; // Ensure you have styles set for .blank-screen to make it truly blank or styled as you wish
    }

    return (
      <div>
        {this.state.showWelcome ? (
          <WelcomeMessage onClose={this.closeWelcome} />
        ) : this.state.showConsentModal ? (
          <div>
            {this.renderConsentModal()}
            <div className="background-image">{/* Background image displayed*/}</div>
          </div>
        ) : this.state.userConsent === 'Charging_points' ? (
          <div>
            <AnimatedDot updatePosition={this.updatePosition} />
            <NewsTicker userConsent = {this.state.userConsent} newsType="latestNews" />
          </div>
        ) : this.state.userConsent === 'Connect' ? <div><F2F initialPosition={this.state.initialPosition}/><NewsTicker userConsent = {this.state.userConsent} newsType="allCarsNews" updateAllCars={this.updateAllCars}/></div>: null}
      </div>
    );
  }
}

export default App;
