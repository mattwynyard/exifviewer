import React, { Component } from 'react';
import { Map, TileLayer, Marker }  from 'react-leaflet';
import {Navbar, Nav, NavDropdown}  from 'react-bootstrap';
import L from 'leaflet';
import './App.css';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      location: {
        lat: -41.2728,
        lng: 173.2995,
      },
      zoom: 8,
      markersData: [],
      fault: {},
      layers: [],
      bounds: {},
      icon: null
    }
  }

  // const CustomMarker = (RL as any).withLeaflet(class extends MapLayer<any> {
  // });

  componentDidMount() {
    // Call our fetch function below once the component mounts
    this.callBackendAPI()
    .catch(err => console.log(err));
  }

  componentDidUpdate() {   
    //let marker = CustomMarker();
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

  async addMarkers(data) {
    let markersData = [];
    let table = [];
    for (var i = 0; i < data.length; i++) {
      const id = data[i].gid
      const fault = data[i].fault
      let record = {id: id, fault: fault};
      table.push(record);
      const position = JSON.parse(data[i].st_asgeojson);
      const lng = position.coordinates[0];
      const lat = position.coordinates[1];
      let latlng = L.latLng(lat, lng);
      markersData.push(latlng);     
    }
    this.setState({markersData: markersData});
    this.setState({fault: table});
    //console.log(this.state.markersData[0])
    //console.log(this.state.fault)
  }

  /**
   * fires when user scrolls mousewheel
   * param - e the mouse event
   **/
  onZoom(e) {
    this.setState({zoom: e.target.getZoom()});
    this.setState({bounds: e.target.getBounds()});    
  }

  clickMarker(e) {
    var marker = e.target;
    //let icon = marker.getIcon();
    console.log(marker.key)
  }

  getIcon(zoom) {
    let icon = null;
    if (zoom <= 10) {
      icon = L.icon({
      iconUrl: 'CameraRed_4px.png',
      iconSize: [4, 4],
      iconAnchor: [2, 2],
      });
    } else {
      icon = L.icon({
        iconUrl: 'CameraRed_8px.png',
        iconSize: [8, 8],
        iconAnchor: [4, 4],
        });
    }
    return icon
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
    if (response.status !== 200) {
      throw Error(body.message) 
    } 
    const body = await response.json();
    await this.addMarkers(body);
    
  };

  customMarker = L.Marker.extend({
    options: {
    id: null,
    type: ''
    }
    });

  render() {
    //console.log("render");
    const position = [this.state.location.lat, this.state.location.lng];
    const { markersData } = this.state.markersData;
    console.log(this.state.zoom);
    let icon = this.getIcon(this.state.zoom);
    this.state.icon = icon;
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
          ref={(ref) => { this.map = ref; }}
          className="map"
          markersData={markersData}
          worldCopyJump={true}
          center={position}
          zoom={this.state.zoom}
          onZoom={(e) => this.onZoom(e)}>
          <TileLayer
            attribution="&amp;copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors and Chat location by Iconika from the Noun Project"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {this.state.markersData.map((position, index) => 

          <Marker 
          key={`${index}`} 
          position={position} 
          icon={this.state.icon} 
          draggable={false} 
          onClick={(e) => this.clickMarker(e)}>
        </Marker>
        )}
        </Map> 
      </div>
      <div className="footer">
      </div>
      </>
    );
  }
}
export default App;
