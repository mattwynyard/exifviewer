import React, { Component } from 'react';
import { Map, TileLayer, Marker, Popup }  from 'react-leaflet';
import axios from 'axios';
import {Navbar, Nav, NavDropdown}  from 'react-bootstrap';

import './App.css';

class App extends Component {

  state = {
    location: {
      lat: -41.2728,
      lng: 173.2995,
    },
    zoom: 8
  }

  // constructor(props) {
  //   super(props);
  //   this.state = {isToggleOn: true};

  //   // This binding is necessary to make `this` work in the callback
  //   this.loadLayer = this.loadLayer.bind(this);
  // }

  componentDidMount() {
    // Call our fetch function below once the component mounts
    this.callBackendAPI()
    .catch(err => console.log(err));
}

  callBackendAPI = async () => {
    const response = await fetch('http://localhost:5000/api') 
    const body = await response.json();
    console.log(body.express)
    if (response.status !== 200) {
      throw Error(body.message) 
    }
    return body;
  };

  plotLines(data) {
    //console.log(data.length);
    for (var i = 0; i < data.length; i++) {
      var lines = JSON.parse(data[i].st_asgeojson);
      if (lines != null) {
        //console.log(lines.coordinates);
        var coordinates = lines.coordinates;
        //console.log(coordinates[0]);
        for (var i = 0; i < coordinates[0].length; i++) {
        console.log(coordinates[0][i]);
        }
      }      
    }
  }

  
  async loadLayer(e) {
    const response = await fetch('http://localhost:5000/layer', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        latitude: this.state.location.lat,
        longitude: this.state.location.lng,
        menu: e.target.id
      })
    })
    const body = await response.json();

    this.plotLines(body);
    if (response.status !== 200) {
      throw Error(body.message) 
    } 
  };

  render() {
    const position = [this.state.location.lat, this.state.location.lng];
    return (
      <>
        <div>
          <Navbar bg="light" expand="lg"> 
          <Navbar.Brand href="#home">
            </Navbar.Brand>
          <Nav>
            <NavDropdown title="Layers" id="basic-nav-dropdown">
              <NavDropdown.Item id="AddLayer" href="#addlayer" onClick={(e) => this.loadLayer(e)}
              >Add Layer
              
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="#action/3.4">Separated link</NavDropdown.Item>
            </NavDropdown>         
          </Nav>
          <Nav className="ml-auto">
            <Nav.Link href="#login">Login</Nav.Link>
          </Nav>
          </Navbar>
        </div>
        <div className="map">
        <Map
          className="map"
          worldCopyJump={true}
          center={position}
          zoom={this.state.zoom}>
          <TileLayer
            attribution="&amp;copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors and Chat location by Iconika from the Noun Project"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        </Map> 
      </div>
      <div className="footer">
      </div>
      </>
    );
  }
}
export default App;
