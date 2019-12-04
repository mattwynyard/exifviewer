import React, { Component} from 'react';
import { Map, TileLayer, Marker, Popup }  from 'react-leaflet';
import {Navbar, Nav, NavDropdown, Modal, Button }  from 'react-bootstrap';
import L from 'leaflet';
import './App.css';
import ModalImage from "./ModalImage";

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
      fault: [],
      photo: [],
      layers: [],
      bounds: {},
      icon: this.getCustomIcon(),
      show: false,
      modalPhoto: null
    };
    // showModal = e => {
    //   this.setState({
    //     show: true
    //   });
    // };
  }

  getCustomIcon(data, zoom) {
    let icon = null;
    //console.log(zoom);
    const size = this.getSize(zoom);
      if (data === "Scabbing") {
        icon = L.icon({
        iconUrl: 'CameraSpringGreen_16px.png',
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        });
      } else if (data === "Flushing") {
        icon = L.icon({
        iconUrl: 'CameraDodgerBlue_16px.png',
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        });      
      } else {
        icon = L.icon({
        iconUrl: 'CameraRed_16px.png',
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        });
      }  
      return icon
  }

  getSize(zoom) {
    if (zoom < 10) {
      return 4;
    } else if (zoom >= 10 && zoom <= 16) {
      return 8;
    } else {
      return 16;
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
    let faults = [];
    let photos = [];
    for (var i = 0; i < data.length; i++) {
      const gid = data[i].gid
      const fault = data[i].fault
      const photo = data[i].photoid
      //console.log(data[i].photoid);
      faults.push(fault);
      photos.push(photo);
      const position = JSON.parse(data[i].st_asgeojson);
      const lng = position.coordinates[0];
      const lat = position.coordinates[1];
      let latlng = L.latLng(lat, lng);
      markersData.push(latlng);     
    }
    this.setState({markersData: markersData});
    this.setState({fault: faults});
    this.setState({photo: photos});
  }

  /**
   * fires when user scrolls mousewheel
   * param - e the mouse event
   **/
  onZoom(e) {
    this.setState({zoom: e.target.getZoom()});
    this.setState({bounds: e.target.getBounds()});
    //const { markersData } = this.state.markersData;  
    console.log(e.target.getZoom())
  }

  clickMarker(e) {
    var marker = e.target;
    const index = marker.options.index;
    const data = marker.options.data
    console.log(this.state.photo[index]);
    this.setState({show: true});
    //this.render();
    this.renderModal(this.state.photo[index]);
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

  renderModal(photo) {
    this.setState({show: true});
    this.setState({modalPhoto: photo});
    this.render();

  }

  render() {
    const position = [this.state.location.lat, this.state.location.lng];
    const { markersData } = this.state.markersData;
    const { fault } = this.state.fault;
    const { photo } = this.state.photo;
    const handleClose = () => this.setState({show: false});
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
          fault={fault}
          photo={photo}
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
          index={index}
          data={fault}
          photo={photo}
          position={position} 
          icon={this.getCustomIcon(this.state.fault[index], this.state.zoom)}
          draggable={false} 
          onClick={(e) => this.clickMarker(e)}>
             <Popup>
            A pretty CSS3 popup. <br /> Easily customizable.
          </Popup>
        </Marker>
        )}
        
        </Map> 
      </div>
      <Modal show={this.state.show}>
        <Modal.Header>
          <Modal.Title>{this.state.modalPhoto}</Modal.Title>
        </Modal.Header>
        <Modal.Body ></Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      {/* <Modal show={this.state.show}>
          <Modal.Header>
            <Modal.Title>{this.state.modalPhoto}</Modal.Title>
          </Modal.Header>
          <Modal.Body ></Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={handleClose}>
              Close
            </Button>
          </Modal.Footer>
        </Modal> */}
      <div className="footer">
      </div>
      </>
    );
  }
}
export default App;
