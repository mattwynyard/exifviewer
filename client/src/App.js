import React from 'react';
import { Map, TileLayer, Marker, Polyline, Popup, ScaleControl, ScaleControlProps}  from 'react-leaflet';
import {LeafletPolyline} from 'react-leaflet-polyline'
import {Navbar, Nav, NavDropdown, Modal, Button, Image, Form}  from 'react-bootstrap';
import L from 'leaflet';
import './App.css';
import './canvasoverlay.js';
import Cookies from 'js-cookie';
import './WebGL.js';
import CanvasLayer from './canvaslayer.js';

class App extends React.Component {

  constructor(props) {
    
    //const osmURL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
    //const mapBoxURL = "//api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWp3eW55YXJkIiwiYSI6ImNrM3Q5cDB5ZDAwbG0zZW82enhnamFoN3cifQ.6tHRp0DztZanCDTnEuZJlg";
    super(props);
    const user = this.getUser();
    const loginModal = this.getLoginModal(user);
    const projects =  this.getProjects();
    const gl = null;
    const canvas = null;
    const map = null;
    const glLayer = null;
    let mapMatrix = null;

    this.state = {
      location: {
        lat: -41.2728,
        lng: 173.2995,
      },
      token: Cookies.get('token'),
      login: user,
      loginModal: loginModal,
      zIndex: 900,
      //tileServer: "//api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWp3eW55YXJkIiwiYSI6ImNrM3Q5cDB5ZDAwbG0zZW82enhnamFoN3cifQ.6tHRp0DztZanCDTnEuZJlg",
      osmThumbnail: "satellite64.png",
      mode: "map",
      zoom: 8,
      index: 0,
      markersData: [],
      centreData: [],
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
      showContact: false,
      showTerms: false,
      showAbout: false,
      modalPhoto: null,
      popover: false,
      photourl: null,
      amazon: "https:/taranaki.s3.ap-southeast-2.amazonaws.com/Roads/2019_11/",
      user: null,
      passowrd: null,
      projectArr: projects
    };
    
  }

  getProjects() {
    let cookie = Cookies.get('projects');
    if (cookie === undefined) {
      return [];
    } else {
      return JSON.parse(cookie);
    }    
  }
  /**
   * Checks if user has cookie. If not not logged in.
   * Returns username in cookie if found else 'Login'
   */
  getUser() {
    const cookie = Cookies.get('user');
    if (cookie === undefined) {
      return "Login";
    } else {
      return cookie;
    }    
  }

  getLoginModal(user) {
    if (user === "Login") {
      return (e) => this.clickLogin(e);
    } else {
      return (e) => this.logout(e);
    }
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
    this.map = this.map.leafletElement;
    L.canvasLayer = function() {
      return new CanvasLayer();
    };
    console.log(this.map.getSize());
    let cl = L.canvasLayer();
    this.glLayer = cl.delegate(this).addTo(this.map);
    this.canvas = this.glLayer._canvas
    // this.glLayer = L.canvasOverlay()
    //      .drawing(this.drawingOnCanvas)   // set drawing function
    //      .addTo(this.map);         // add this layer to leaflet map

    // this.canvas = this.glLayer.canvas();
    // console.log(this.glLayer.canvas.width = this.canvas.clientWidth);
    // console.log(this.glLayer.canvas.height = this.canvas.clientHeight);

    this.gl = this.canvas.getContext('experimental-webgl', { antialias: true });
    

    var pixelsToWebGLMatrix = new Float32Array(16);
    this.mapMatrix = new Float32Array(16);
    var program = this.gl.createProgram();
    this.gl.linkProgram(program);
    this.gl.useProgram(program);

    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
    this.gl.enable(this.gl.BLEND);
    var u_matLoc = this.gl.getUniformLocation(program, "u_matrix");
    var colorLoc = this.gl.getAttribLocation(program, "a_color");
    var vertLoc = this.gl.getAttribLocation(program, "a_vertex");
    this.gl.aPointSize = this.gl.getAttribLocation(program, "a_pointSize");
    this.gl.aPointSize = 100;
    pixelsToWebGLMatrix.set([2 / this.canvas.width, 0, 0, 0, 0, -2 / this.canvas.height, 0, 0, 0, 0, 0, 0, -1, 1, 0, 1]);
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);

    this.gl.uniformMatrix4fv(u_matLoc, false, pixelsToWebGLMatrix);

    var verts = [];
    const data = [[-37,175]];
    var d = data;
    for (var i = 0; i < data.length; i += 1) {
        let pixel = this.LatLongToPixelXY(data[i][0], data[i][1]);
        console.log(pixel);
      //-- 2 coord, 3 rgb colors interleaved buffer
      verts.push(pixel.x, pixel.y, 0, 0, 0);
    }

        // //numPoints = data.length ;

    var vertBuffer = this.gl.createBuffer();
    var vertArray = new Float32Array(verts);
    var fsize = vertArray.BYTES_PER_ELEMENT;

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, vertArray, this.gl.STATIC_DRAW);
    this.gl.vertexAttribPointer(vertLoc, 2, this.gl.FLOAT, false,fsize*5,0);
    this.gl.enableVertexAttribArray(vertLoc);
        // // -- offset for color buffer
    this.gl.vertexAttribPointer(colorLoc, 3, this.gl.FLOAT, false, fsize*5, fsize*2);
    this.gl.enableVertexAttribArray(colorLoc);

    //this.glLayer.redraw();
    if (this.gl == null) return;

    this.gl.clear(this.gl.COLOR_BUFFER_BIT);


    pixelsToWebGLMatrix.set([2 / this.canvas.width, 0, 0, 0, 0, -2 / this.canvas.height, 0, 0, 0, 0, 0, 0, -1, 1, 0, 1]);
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);



    var pointSize = Math.max(this.map.getZoom() - 4.0, 1.0);
    console.log("pointsize " + pointSize);
    this.gl.vertexAttrib1f(this.gl.aPointSize, pointSize);

    // // -- set base matrix to translate canvas pixel coordinates -> webgl coordinates
    this.mapMatrix.set(pixelsToWebGLMatrix);

    var bounds = this.map.getBounds();
    var topLeft = new L.LatLng(bounds.getNorth(), bounds.getWest());
    var offset = this.LatLongToPixelXY(topLeft.lat, topLeft.lng);

    // // -- Scale to current zoom
    var scale = Math.pow(2, this.map.getZoom());
    this.scaleMatrix(this.mapMatrix, scale, scale);

    this.translateMatrix(this.mapMatrix, -offset.x, -offset.y);

    // // -- attach matrix value to 'mapMatrix' uniform in shader
    this.gl.uniformMatrix4fv(this.u_matLoc, false, this.mapMatrix);
    this.gl.drawArrays(this.gl.POINTS, 0, data.length);
    //this.glLayer.redraw();
  }

    // Returns a random integer from 0 to range - 1.
    randomInt(range) {
    return Math.floor(Math.random() * range);
    }

      // -- converts latlon to pixels at zoom level 0 (for 256x256 tile size) , inverts y coord )
      // -- source : http://build-failed.blogspot.cz/2013/02/displaying-webgl-data-on-google-maps.html

  LatLongToPixelXY(latitude, longitude) {
      var pi_180 = Math.PI / 180.0;
      var pi_4 = Math.PI * 4;
      var sinLatitude = Math.sin(latitude * pi_180);
      var pixelY = (0.5 - Math.log((1 + sinLatitude) / (1 - sinLatitude)) / (pi_4)) * 256;
      var pixelX = ((longitude + 180) / 360) * 256;

      var pixel = { x: pixelX, y: pixelY };

      return pixel;
  }

  translateMatrix(matrix, tx, ty) {
      // translation is in last column of matrix
      matrix[12] += matrix[0] * tx + matrix[4] * ty;
      matrix[13] += matrix[1] * tx + matrix[5] * ty;
      matrix[14] += matrix[2] * tx + matrix[6] * ty;
      matrix[15] += matrix[3] * tx + matrix[7] * ty;
  }

  scaleMatrix(matrix, scaleX, scaleY) {
      // scaling x and y, which is just scaling first two columns of matrix
      matrix[0] *= scaleX;
      matrix[1] *= scaleX;
      matrix[2] *= scaleX;
      matrix[3] *= scaleX;

      matrix[4] *= scaleY;
      matrix[5] *= scaleY;
      matrix[6] *= scaleY;
      matrix[7] *= scaleY;
  }
         
  drawingOnCanvas(canvasOverlay, params) {
    console.log("drawing");
    if (this.gl == null) return;

    this.gl.clear(this.gl.COLOR_BUFFER_BIT);


    this.pixelsToWebGLMatrix.set([2 / this.canvas.width, 0, 0, 0, 0, -2 / this.canvas.height, 0, 0, 0, 0, 0, 0, -1, 1, 0, 1]);
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);



    var pointSize = Math.max(this.map.getZoom() - 4.0, 1.0);
    console.log("pointsize " + pointSize);
    this.gl.vertexAttrib1f(this.gl.aPointSize, pointSize);

    // -- set base matrix to translate canvas pixel coordinates -> webgl coordinates
    this.mapMatrix.set(this.pixelsToWebGLMatrix);

    var bounds = this.map.getBounds();
    var topLeft = new L.LatLng(bounds.getNorth(), bounds.getWest());
    var offset = this.LatLongToPixelXY(topLeft.lat, topLeft.lng);

    // -- Scale to current zoom
    var scale = Math.pow(2, this.map.getZoom());
    this.scaleMatrix(this.mapMatrix, scale, scale);

    this.translateMatrix(this.mapMatrix, -offset.x, -offset.y);

    // -- attach matrix value to 'mapMatrix' uniform in shader
    this.gl.uniformMatrix4fv(this.u_matLoc, false, this.mapMatrix);
    this.gl.drawArrays(this.gl.POINTS, 0, this.data.length);

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
      let obj = {};
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
      faults.push(data[i].fault);
      photos.push(data[i].photoid);
      objData.push(obj);
      priorities.push(data[i].priority);
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

  addCentrelines(data) {
    let lineData = [];
    console.log(data.length);
    for (var i = 0; i < data.length; i++) {
      const linestring = JSON.parse(data[i].st_asgeojson);    
      if(linestring !== null) {
        var points = [];
        //console.log("new segment");
        var segment = linestring.coordinates[0];
        for (var j = 0; j < segment.length; j++) {
          var point = segment[j];
          let latlng = L.latLng(point[1], point[0]);
          points.push(latlng);
        }     
      }
      lineData.push(points);
    }
    let polylines  = [];
    console.log(lineData);
    this.setState({centreData: lineData});
  }

  /**
   * 
   * @param {the number to pad} n 
   * @param {the amount of pading} width 
   * @param {digit to pad out number with (default '0'} z 
   * @return {the padded number (string)}
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
    //let suffix = photo.slice(photo.length - 5, photo.length);
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
    //const data = marker.options.data
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

  async logout(e) {
    //console.log("logout");
    console.log(this.state.login);
    const response = await fetch('http://localhost:5000/logout', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        "authorization": this.state.token,
        'Accept': 'application/json',
        'Content-Type': 'application/json',        
      },
      body: JSON.stringify({
        user: this.state.login,
      })
    });
    const body = await response.json();
    if (response.status !== 200) {
      throw Error(body.message) 
    } 
    
    console.log(body.success);
    this.setState({login: "Login"});
    this.setState({loginModal: (e) => this.clickLogin(e)});
    Cookies.remove('token');
    Cookies.remove('user');
    Cookies.remove('projects');
    this.setState({projectArr: []});
    console.log("ProjectArr: " + this.state.projectArr);
    this.render();
  }

  async login(e) {
    this.setState({showLogin: false});
    const response = await fetch('http://localhost:5000/login', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        "authorization": this.state.token,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        
      },
      body: JSON.stringify({
        user: this.userInput.value,
        key: this.passwordInput.value
      })
    });
    const body = await response.json();
    if (response.status !== 200) {
      throw Error(body.message) 
    } 
    
    if (body.result) {
      Cookies.set('token', body.token, { expires: 7 })
      Cookies.set('user', body.user, { expires: 7 })
      this.setState({login: body.user});
      this.setState({token: body.token});
      this.setState({loginModal: (e) => this.logout(e)});
      
      this.buildProjects(body.projects);
      
    } else {
      console.log("Login failed");
    }  
  }

  buildProjects(projects) {
    let prj = []
    for(var i = 0; i < projects.length; i += 1) {
      prj.push(projects[i].description + " " + projects[i].date);
    }
    Cookies.set('projects', JSON.stringify(prj), { expires: 7 })
    this.setState({projectArr: prj});
  }

  async loadLayer(e) {
    console.log(e.target.title);
    if (this.state.login !== "Login") {
        const response = await fetch('http://localhost:5000/layer', {
        method: 'POST',
        headers: {
          "authorization": this.state.token,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude: this.state.location.lat,
          longitude: this.state.location.lng,
          menu: e.target.id,
          user: this.state.login
        })
      })
      if (response.status !== 200) {
        console.log(response.status);
      } 
      const body = await response.json();
      await this.addMarkers(body);
    } else {
      
    }    
  }

  async loadCentreline(e) {
    console.log(e.target.title);
    if (this.state.login !== "Login") {
        const response = await fetch('http://localhost:5000/roads', {
        method: 'POST',
        headers: {
          "authorization": this.state.token,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: 900,
          menu: e.target.id,
          user: this.state.login
        })
      })
      if (response.status !== 200) {
        console.log(response.status);
      } 
      const body = await response.json();
      //console.log(body);
      await this.addCentrelines(body);
    } else {
      
    }    
  }

  clickLogin(e) {
    this.setState({showLogin: true});   
  }

  clickAbout(e) {
    this.setState({showAbout: true});  
  }

  clickTerms(e) {
    this.setState({showTerms: true});  
  }

  clickContact(e) {
    this.setState({showContact: true});  
  }

  clickClose(e) {
    this.setState({showContact: false});
    this.setState({showAbout: false});    
    this.setState({showTerms: false});    
  }
  /**
   * called when photoviewer closed
   */
  closeModal() {
    this.setState({show: false});
    this.setState({popover: false});
  }

  //RENDER

  render() {
    console.log("render");
    const position = [this.state.location.lat, this.state.location.lng];
    const latlngs = this.state.centreData;
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
    const CustomNav = function customNav(props) {
      
      if (props.title === 'Login') {
        return (<Nav className="ml-auto">
        <Nav.Link  id="Login" href="#login" onClick={props.onClick}>{props.title} </Nav.Link>
      </Nav>);
      } else {
        return(<Nav className="ml-auto"><NavDropdown className="navdropdown" title={props.title} id="basic-nav-dropdown">
        <NavDropdown.Item className="navdropdownitem" href="#contact"  onClick={props.onClick}>Logout</NavDropdown.Item>
      </NavDropdown></Nav>);
      }
    }

    const CustomMenu = function(props) {
      const p = props.projects;
      const loadLayer = props.onClick;
      if (p === undefined) {
        console.log("Projects" + p);
        return ( 
 
          <NavDropdown.Item title=" Add Layers" className="dropdownitem">Add Layers
          </NavDropdown.Item>
          );
        } else if(p.length === 0) {
          return ( 
 
            <NavDropdown.Item title=" Add Layers" className="dropdownitem">Add Layers
            </NavDropdown.Item>
            );
    
      } else {  
      return (        
        <NavDropdown title=" Add Layers" className="navdropdownitem" drop="right">
        {props.projects.map((value, index) =>      
        <NavDropdown.Item className="navdropdownitem"
        key={`${index}`}
        index={index}
        title={value} onClick={(e) => loadLayer(e)}>
          {value}
        </NavDropdown.Item>)}
        <NavDropdown.Divider />
        </NavDropdown>
        );
      }
    }

    return (
      <>
      
        <div>
          <Navbar bg="light" expand="lg"> 
            <Navbar.Brand href="#home">
            <img
                src="logo.png"
                width="122"
                height="58"
                className="d-inline-block align-top"
              />
              </Navbar.Brand>
            <Nav>          
              <NavDropdown className="navdropdown" title="Layers" id="basic-nav-dropdown">
              <CustomMenu projects={this.state.projectArr} onClick={(e) => this.loadLayer(e)}/>
                <NavDropdown.Divider />
                <NavDropdown.Item className="navdropdownitem" href="#action/3.4" onClick={(e) => this.loadCentreline(e)}>Add centreline </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item className="navdropdownitem" href="#action/3.4">Remove layer</NavDropdown.Item>
              </NavDropdown>
            </Nav>
            <Nav>
              <NavDropdown className="navdropdown" title="Help" id="basic-nav-dropdown">
                <NavDropdown.Item className="navdropdownitem" href="#terms" onClick={(e) => this.clickTerms(e)} >Terms of Use</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item className="navdropdownitem" href="#contact" onClick={(e) => this.clickContact(e)} >Contact</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item className="navdropdownitem" id="Documentation" href="#documentation" onClick={(e) => this.documentation(e)}>Documentation</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item className="navdropdownitem" href="#about" onClick={(e) => this.clickAbout(e)} >About</NavDropdown.Item>
               
                
              </NavDropdown>         
            </Nav>
            <CustomNav className="navdropdown" title={this.state.login} onClick={this.state.loginModal} />
          </Navbar>         
        </div>      
        <div className="map">
        <Map       
          ref={(ref) => { this.map = ref; }}
          className="map"
          fault={fault}
          photo={photo}
          worldCopyJump={true}
          boxZoom={true}
          center={position}
          zoom={this.state.zoom}
          onZoom={(e) => this.onZoom(e)}>
          <TileLayer className="mapLayer"
            attribution="&amp;copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors and Chat location by Iconika from the Noun Project"
            url={"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}
            zIndex={999}
          />
          <ScaleControl/>
          <Image className="satellite" src={this.state.osmThumbnail} onClick={(e) => this.toogleMap(e)} thumbnail={true}/>
          {this.state.centreData.map((latlngs, index) => 
          <Polyline 
            key={`${index}`}
            weight={1}
            color={'blue'} 
            smoothFactor={3}
            positions={latlngs}>
          </Polyline>
          )}
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
      <Modal className="termsModal" show={this.state.showTerms} size={'md'} centered={true}>
        <Modal.Header>
          <Modal.Title><h2>Road Inspection Viewer</h2></Modal.Title>
        </Modal.Header>
        <Modal.Body >	
          By using this software you confirm you have read and agreed to the Onsite Developments Ltd. <a href={"https://osmium.nz/?#terms"}> Click for terms of use.</a><br></br>
          All data on this site from Land Information New Zealand is made available under a Creative Commons Attribution Licence.<br></br>
          <span >&copy; 2019 Onsite Developments Ltd. All rights reserved.</span><br></br>
		    </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" type="submit" onClick={(e) => this.clickClose(e)}>
              Close
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal className="aboutModal" show={this.state.showAbout} size={'md'} centered={true}>
        <Modal.Header>
          <Modal.Title><h2>About</h2> </Modal.Title>
        </Modal.Header>
        <Modal.Body >	
          <b>Road Inspection Version 1.0</b><br></br>
          Relased: 12/01/2020<br></br>
          Company: Onsite Developments Ltd.<br></br>
          Software Developer: Matt Wynyard <br></br>
          <img src="logo192.png" width="24" height="24"/> React: 16.12.0<br></br>
          <img src="bootstrap.png" width="24" height="24"/> Bootstrap: 4.4.0<br></br>
          <img src="leafletlogo.png" width="60" height="16"/>Leaflet: 1.6.0<br></br>
          <img src="reactbootstrap.png" width="24" height="24"/>React-bootstrap: 1.0.0-beta.16<br></br>
          React-leaflet: 2.6.0<br></br>
		    </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" size='sm' type="submit" onClick={(e) => this.clickClose(e)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={this.state.showLogin} size={'sm'} centered={true}>
        <Modal.Header>
          <Modal.Title><img src="padlock.png" width="42" height="42"/> Login </Modal.Title>
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

