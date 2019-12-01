import React, { Component } from 'react';
import { Map, TileLayer, Marker, Popup }  from 'react-leaflet';
import {Navbar, Nav, NavDropdown, Modal, Button}  from 'react-bootstrap';

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
      error: null,
      isLoaded: false,
      item: []
    };
  }

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

  
  async loadLayer(e) {
    await fetch('http://localhost:5000/layer', {
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
    .then(res => res.json())
      .then(
        (result) => {

          this.setState({
            isLoaded: true,
            items: result.items
          });
          console.log(result);
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          this.setState({
            isLoaded: true,
            error
          });
        }
      )
     
  }

  // MyVerticallyCenteredModal(props) {
  //   return (
  //     <Modal
  //       {...props}
  //       size="lg"
  //       aria-labelledby="contained-modal-title-vcenter"
  //       centered
  //     >
  //       <Modal.Header closeButton>
  //         <Modal.Title id="contained-modal-title-vcenter">
  //           Modal heading
  //         </Modal.Title>
  //       </Modal.Header>
  //       <Modal.Body>
  //         <h4>Centered Modal</h4>
  //         <p>
  //           Cras mattis consectetur purus sit amet fermentum. Cras justo odio,
  //           dapibus ac facilisis in, egestas eget quam. Morbi leo risus, porta ac
  //           consectetur ac, vestibulum at eros.
  //         </p>
  //       </Modal.Body>
  //       <Modal.Footer>
  //         <Button onClick={props.onHide}>Close</Button>
  //       </Modal.Footer>
  //     </Modal>
  //   );
  // }

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
