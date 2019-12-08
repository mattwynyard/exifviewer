import React, { Component} from 'react';
import { Map, TileLayer, Marker, Popup}  from 'react-leaflet';
import {Navbar, Nav, NavDropdown, Modal, Button, Image, Popover, Overlay}  from 'react-bootstrap';
import L from 'leaflet';
import './App.css';
import ModalImage from "./ModalImage";

class App extends Component {

  

  constructor(props) {
    const osmURL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
    const mapBoxURL = "//api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWp3eW55YXJkIiwiYSI6ImNrM3Q5cDB5ZDAwbG0zZW82enhnamFoN3cifQ.6tHRp0DztZanCDTnEuZJlg";
    super(props);
    this.state = {
      location: {
        lat: -41.2728,
        lng: 173.2995,
      },
      zIndex: 900,
      //tileServer: "//api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWp3eW55YXJkIiwiYSI6ImNrM3Q5cDB5ZDAwbG0zZW82enhnamFoN3cifQ.6tHRp0DztZanCDTnEuZJlg",
      osmThumbnail: "satellite64.png",
      mode: "map",
      zoom: 8,
      index: null,
      markersData: [],
      fault: [],
      photos: [],
      currentPhoto: null,
      currentFault: null,
      layers: [],
      bounds: {},
      icon: this.getCustomIcon(),
      show: false,
      modalPhoto: null,
	  popover: false,
	  photourl: null,
    amazon: "https:/taranaki.s3.ap-southeast-2.amazonaws.com/Roads/2019_11/",
    //tileServer: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    };
    // showModal = e => {
    //   this.setState({
    //     show: true
    //   });
    // };
  }

  getCustomIcon(data, zoom) {
    let icon = null;
    console.log(zoom);
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
      return icon;
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
    const response = await fetch('https://localhost:443/api') 
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
    this.setState({photos: photos});
  }

  //EVENTS
  /**
   * fires when user scrolls mousewheel
   * param - e the mouse event
   **/
  onZoom(e) {
    this.setState({zoom: e.target.getZoom()});
    this.setState({bounds: e.target.getBounds()});
    //const { markersData } = this.state.markersData;  
    //console.log(e.target.getZoom())
  }

  toogleMap(e) {
    console.log("click");
    if (this.state.mode == "map") {
      this.setState({zIndex: 1000});
      this.setState({mode: "sat"});
      this.setState({osmThumbnail: "map64.png"});
      console.log("map");
    } else {
      console.log("sat");
      this.setState({zIndex: 900});
      this.setState({mode: "map"});
      this.setState({osmThumbnail: "satellite64.png"})
    }
  }

  clickImage(e) {
    
    this.setState({show: true});
  }

  pad(n, width, z) {
	z = z || '0';
	n = n + '';
	return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
  }

  clickPrev(e) {
	let photo = this.state.currentPhoto;
	let suffix = photo.slice(photo.length - 5, photo.length);
	let intSuffix = (parseInt(photo.slice(photo.length - 5, photo.length)));
	let n = intSuffix - 1;
	let newSuffix = this.pad(n, 5);
	let prefix = photo.slice(0, photo.length - 5);
	let newPhoto = prefix + newSuffix;
	this.setState({currentPhoto: newPhoto});
	const url = this.state.amazon + newPhoto + ".jpg";
	this.setState({photourl: url});
	
	}

  clickNext(e) {
	let photo = this.state.currentPhoto;
	let suffix = photo.slice(photo.length - 5, photo.length);
	let intSuffix = (parseInt(photo.slice(photo.length - 5, photo.length)));
	let n = intSuffix + 1;
	let newSuffix = this.pad(n, 5);
	let prefix = photo.slice(0, photo.length - 5);
	let newPhoto = prefix + newSuffix;
	this.setState({currentPhoto: newPhoto});
	const url = this.state.amazon + newPhoto + ".jpg";
	this.setState({photourl: url});
  }

  clickMarker(e) {
    var marker = e.target;
	const index = marker.options.index;
	this.setState({index: index});
	const data = marker.options.data
	const photo = this.state.photos[index]
	const url = this.state.amazon + photo + ".jpg";
	//console.log(url);
	this.setState({photourl: url});
    this.setState({currentFault: this.state.fault[index]});
    //console.log(index);
    this.setState({popover: true});
    this.setState({currentPhoto: this.state.photos[index]})
    this.renderModal(this.state.photos[index]);
  }

  async loadLayer(e) {
    const response = await fetch('https://localhost:443/layer', {
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

  closeModal() {
	this.setState({show: false});
	this.setState({popover: false});
  }

  //RENDER

  renderModal(photo) {
    //this.setState({show: true});
    //this.setState({modalPhoto: photo});
    //this.render();

  }

  render() {
    const position = [this.state.location.lat, this.state.location.lng];
    const { markersData } = this.state.markersData;
    const { fault } = this.state.fault;
    const { photo } = this.state.photos;    
    const handleClose = () => this.setState({show: false});
    const CustomTile = function CustomTile (props) {
        return (
            <TileLayer className="mapLayer"
            attribution="&amp;copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors and Chat location by Iconika from the Noun Project"
            url={"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}
          />
      );
    }
   
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
          onZoom={(e) => this.onZoom(e)}        
          >
          {/* <TileLayer className="mapLayer"
            attribution="&amp;copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors and Chat location by Iconika from the Noun Project"
            url={"//api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWp3eW55YXJkIiwiYSI6ImNrM3Q5cDB5ZDAwbG0zZW82enhnamFoN3cifQ.6tHRp0DztZanCDTnEuZJlg"}
            zIndex={this.state.zIndex}
          /> */}
          <TileLayer className="mapLayer"
            attribution="&amp;copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors and Chat location by Iconika from the Noun Project"
            url={"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}
            zIndex={999}
          />
      <Image className="satellite" src={this.state.osmThumbnail} onClick={(e) => this.toogleMap(e)} thumbnail={true}/>
      {this.state.markersData.map((position, index) => 
        <Marker 
          key={`${index}`}
          index={index}
          data={fault}
          photo={photo}
          position={position} 
          icon={this.getCustomIcon(this.state.fault[index], this.state.zoom)}
          draggable={false} 
          onClick={(e) => this.clickMarker(e)}				  
          >
          <Popup className="popup">
          <div>
            <p>
              {this.state.currentFault}
            </p>
            <div>
            <Image className="thumbnail" src={this.state.photourl} photo={photo} onClick={(e) => this.clickImage(e)} thumbnail={true}></Image >
            </div>          
          </div>
          </Popup>  
        </Marker>
      )}      
      </Map>   
      </div>
      
      <Modal show={this.state.show} size={'xl'}>
        <Modal.Header>
          <Modal.Title>{this.state.currentFault}</Modal.Title>
        </Modal.Header>
        <Modal.Body >		
		<Image className="photo" src={this.state.photourl} data={fault} onClick={(e) => this.clickImage(e)} thumbnail></Image >		
		</Modal.Body>
        <Modal.Footer>
		<Button className="prev" onClick={(e) => this.clickPrev(e)}> 
            Previous
          </Button>
          <Button variant="primary" onClick={handleClose}>
            Close
          </Button>
		  <Button className="next" variant="primary" onClick={(e) => this.clickNext(e)}>
            Next
          </Button>
        </Modal.Footer>
      </Modal>
      <div className="footer">
      </div>
      </>
    );
  }
}
export default App;
