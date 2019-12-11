import React, { Component} from 'react';
import { Map, TileLayer, Marker, Popup}  from 'react-leaflet';
import {Navbar, Nav, NavDropdown, Modal, Button, Image, Form, Popover, Overlay}  from 'react-bootstrap';
import L from 'leaflet';
import './App.css';

class App extends Component {

  constructor(props) {
    const userInput = React.createRef(); 
    const passwordInput = React.createRef(); 
    const osmURL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
    const mapBoxURL = "//api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWp3eW55YXJkIiwiYSI6ImNrM3Q5cDB5ZDAwbG0zZW82enhnamFoN3cifQ.6tHRp0DztZanCDTnEuZJlg";
    super(props);
    this.state = {
      location: {
        lat: -41.2728,
        lng: 173.2995,
      },
<<<<<<< HEAD
      zIndex: 900,   //used to toogle between satellite and map
=======
      user: null,
      zIndex: 900,
      //tileServer: "//api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWp3eW55YXJkIiwiYSI6ImNrM3Q5cDB5ZDAwbG0zZW82enhnamFoN3cifQ.6tHRp0DztZanCDTnEuZJlg",
>>>>>>> 0872eceea6d2d234f6e0e33ed574ca015e23d45c
      osmThumbnail: "satellite64.png",
      mode: "map",
      zoom: 8,
      index: 0,
      markersData: [],
      objData: [],
      fault: [],
      priority: [],
      sizes: [],
      photos: [],
      currentPhoto: null,
      currentFault: [],
      layers: [],
      bounds: {},
      icon: this.getCustomIcon(),
      show: false,
      showLogin: false,
      modalPhoto: null,
      popover: false,
      photourl: null,
      amazon: "https:/taranaki.s3.ap-southeast-2.amazonaws.com/Roads/2019_11/",
      user: null,
      passowrd: null
    };
  }

  getCustomIcon(data, zoom) {
    let icon = null;
    const size = this.getSize(zoom);
    if (data === "5") {
      icon = L.icon({
      iconUrl: 'CameraSpringGreen_16px.png',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      });
    } else if (data === "4") {
      icon = L.icon({
      iconUrl: 'CameraOrange_16px.png',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      });      
    } else if (data === "3") {
      icon = L.icon({
      iconUrl: 'CameraLemon_16px.png',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      });
    } else  {
      icon = L.icon({
      iconUrl: 'CameraSpringGreen_16px.png',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      });
    }  
    return icon;
  }

  getSize(zoom) {
    if (zoom < 10) {
      return 4;
    } else if (zoom >= 10 && zoom <= 14) {
      return 10;
    } else if (zoom > 14 && zoom <= 16) {
      return 16;
    } else if  (zoom > 16 && zoom <= 18){
      return 20;
    } else {
      return 32;
    }
  }

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

  /*  Adds db data to various arrays and an object. Then sets state to point to arrays. 
  */
  async addMarkers(data) {
    let markersData = [];
    let objData = [];
    let faults = [];
    let photos = [];
    let priorities = [];
    let size = [];
    for (var i = 0; i < data.length; i++) {
      const photo = data[i].photoid;
      const gid = data[i].gid;
      const roadid = data[i].roadid;
      const carriageway = data[i].carriagewa;
      const location = data[i].location;
      const fault = data[i].fault;
      const size = data[i].size;
      const priority = data[i].priority;
      const datetime = data[i].faulttime;
      let obj = new Object()
      obj = {
        gid: data[i].gid,
        roadid: data[i].roadid,
        carriage: data[i].carriagewa,
        location: data[i].location,
        fault: data[i].fault,
        size: data[i].size,
        priority: data[i].priority,
        photo: data[i].photoid,
        datetime: data[i].faulttime
      };
      faults.push(fault);
      photos.push(photo);
      objData.push(obj);
      priorities.push(priority);
      const position = JSON.parse(data[i].st_asgeojson);
      const lng = position.coordinates[0];
      const lat = position.coordinates[1];
      let latlng = L.latLng(lat, lng);
      markersData.push(latlng);     
    }
    this.setState({markersData: markersData});
    this.setState({fault: faults});
    this.setState({photos: photos});
    this.setState({sizes: size});
    this.setState({priority: priorities});
    this.setState({objData: objData});
  }

  /**
   * 
   * @param {the number to pad} n 
   * @param {the amount of pading} width 
   * @param {digit to pad out number with (default '0'} z 
   */
  pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
    }

  //EVENTS
  /**
   * fires when user scrolls mousewheel
   * param - e the mouse event
   **/
  onZoom(e) {
    this.setState({zoom: e.target.getZoom()});
    this.setState({bounds: e.target.getBounds()});
  }

  /**
   * toogles between satellite and map view by swapping z-index
   * @param {the control} e 
   */
  toogleMap(e) {
    if (this.state.mode === "map") {
      this.setState({zIndex: 1000});
      this.setState({mode: "sat"});
      this.setState({osmThumbnail: "map64.png"});
    } else {
      this.setState({zIndex: 900});
      this.setState({mode: "map"});
      this.setState({osmThumbnail: "satellite64.png"})
    }
  }

  clickImage(e) {    
    this.setState({show: true});
  }

  getPhoto(direction) {
    let photo = this.state.currentPhoto;
    let suffix = photo.slice(photo.length - 5, photo.length);
    let intSuffix = (parseInt(photo.slice(photo.length - 5, photo.length)));
    let n = null;
    if (direction === "prev") {
      n = intSuffix - 1;
    } else {
      n = intSuffix + 1;
    }
    let newSuffix = this.pad(n, 5);
    let prefix = photo.slice(0, photo.length - 5);
    let newPhoto = prefix + newSuffix;
    this.setState({currentPhoto: newPhoto});
    return newPhoto;
  }

  /**
   * 
   * @param {the fault object} obj 
   */
  getFault(obj) {
    let fault = [];
    fault.push(obj.fault)
    fault.push(obj.priority);
    fault.push(obj.location);
    fault.push(obj.size);
    fault.push(obj.datetime);
    return fault;
  }

  clickPrev(e) {
  const newPhoto = this.getPhoto("prev");
  this.setState({currentPhoto: newPhoto});
	const url = this.state.amazon + newPhoto + ".jpg";
  this.setState({photourl: url});
  }
  
  clickNext(e) {
  const newPhoto = this.getPhoto("next");
  this.setState({currentPhoto: newPhoto});
  const url = this.state.amazon + newPhoto + ".jpg";
	this.setState({photourl: url});
  }

  clickMarker(e) {
    var marker = e.target;
    let fault = [];
    const index = marker.options.index;
    let obj = this.state.objData[index];
    this.setState({index: index});
    const data = marker.options.data
    const photo = this.state.photos[index]
    const url = this.state.amazon + photo + ".jpg";
    this.setState({photourl: url});
    fault.push(this.state.fault[index])
    fault.push(obj.priority);
    fault.push(obj.location);
    fault.push(obj.size);
    fault.push(obj.datetime);
    this.setState({currentFault: fault});
    this.setState({popover: true});
    this.setState({currentPhoto: this.state.photos[index]})
  }

  clickLogin(e) {
    this.setState({showLogin: true});
  }

  async login(e) {
    this.setState({showLogin: false});
    const user = this.userInput.value;
    const key = this.passwordInput.value;
    console.log(user + ": " + key);
    const response = await fetch('http://localhost:5000/login', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user: this.userInput.value,
        key: this.passwordInput.value
      })
    })
    if (response.status !== 200) {
      throw Error(body.message) 
    } 
    const body = await response.json();
    console.log(body);
  }

  async loadLayer(e) {
    if (login != null) {
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
    } else {
      
    }
    
  }

  closeModal() {
	this.setState({show: false});
	this.setState({popover: false});
  }

  //RENDER

  render() {
    const position = [this.state.location.lat, this.state.location.lng];
    const { markersData } = this.state.markersData;
    const { fault } = this.state.fault;
    const { photo } = this.state.photos;   
    const { objData } = this.state.objData;     
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
              <NavDropdown.Item href="#action/3.4">Remove layer</NavDropdown.Item>
            </NavDropdown>         
          </Nav>
          <Nav className="ml-auto">
            <Nav.Link  id="AddLayer" href="#login" onClick={(e) => this.clickLogin(e)}>Login </Nav.Link>
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
          icon={this.getCustomIcon(this.state.priority[index], this.state.zoom)}
          draggable={false} 
          onClick={(e) => this.clickMarker(e)}				  
          >
          <Popup className="popup">
          <div>
            <p className="faulttext">
              <b>{"Type: "}</b> {this.state.currentFault[0]} <br></br> <b>{"Priority: "} </b> {this.state.currentFault[1]} <br></br><b>{"Location: "} </b> {this.state.currentFault[2]}
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
      <Modal show={this.state.showLogin} size={'sm'} centered={true}>
        <Modal.Header>
          <Modal.Title>Login</Modal.Title>
        </Modal.Header>
        <Modal.Body >	
        <Form>
          <Form.Group controlId="userName">
            <Form.Label>Username</Form.Label>
            <Form.Control type="text" placeholder="Enter username" ref={user => this.userInput = user} />
          </Form.Group>

          <Form.Group controlId="formBasicPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" placeholder="Password" ref={key=> this.passwordInput = key}/>
          </Form.Group>
          <Button variant="primary" type="submit" onClick={(e) => this.login(e)}>
            Submit
          </Button>
        </Form>	
		    </Modal.Body>
        <Modal.Footer>
        </Modal.Footer>
      </Modal>
      
      <Modal show={this.state.show} size={'xl'} >
        {/* <Modal.Header>
          <Modal.Title className="title"> 
            
            </Modal.Title>
        </Modal.Header> */}
        <Modal.Body className="photoBody">	
        <div className="container">
              <div className="row">
              <div className="col-md-6">
                  <b>{"Type: "}</b> {this.state.currentFault[0]} <br></br> <b>{"Priority: "} </b> {this.state.currentFault[1]} <br></br><b>{"Location: "} </b> {this.state.currentFault[2]}
              </div>
              <div className="col-md-6">
                <b>{"Size: "}</b> {this.state.currentFault[3]} <br></br> <b>{"DateTime: "} </b> {this.state.currentFault[4]}
              </div>
              </div>
            </div>	
		      <Image className="photo" src={this.state.photourl} data={fault} onClick={(e) => this.clickImage(e)} thumbnail></Image >		
		    </Modal.Body >
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
