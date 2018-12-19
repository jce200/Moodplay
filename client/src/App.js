// /client/App.js
// import "./public/css/style.css";
import config from "./config.json";
import React, { Component } from "react";
// import { Link, Route, Switch, Redirect } from "react-router-dom";
// import Home from "./components/homepage";
// import Navbar from "./components/navBar";
// import NotFound from "./components/notFound";
// import FileUploader from "./components/fileUpload";
// import audio from "https://p.scdn.co/mp3-preview/6247205863448da37f377a649a330458f3ec7487?cid=4184cfefa27d4bfaa7b5affd6d1e0b91";
import axios from "axios";

const endpoint = "http://localhost:3000/upload";
const endpoint2 = "http://localhost:3000/logout";

class App extends Component {
  constructor() {
    super();
    this.state = {
      selectedFile: null,
      loaded: 0,
      isLoggedIn: false,
      username: "",
      hasTracks: false
    };
  }

  // state = {
  //   isLoggedIn: false
  // };

  change = e => {
    this.setState({
      [e.target.name]: e.target.value
    });
  };

  componentDidMount = () => {
    this.isLoggedIn();
  };
  // componentDidMount() {
  //   axios("http://localhost:3001/auth/spotify", { withCredentials: true })
  //     .then(result => {
  //       debugger;
  //       console.log(result);
  //     })
  //     .catch(err => {
  //       debugger;
  //       console.log(err);
  //     });
  // }

  isLoggedIn = () => {
    axios
      .get(`${config.backendUrl}user/auth/isloggedin`, {
        withCredentials: true
      })
      .then(result => {
        this.setState({ isLoggedIn: true, username: result.data.username });
      })
      .catch(error => {
        this.setState({ isLoggedIn: false });
      });
  };

  handleselectedFile = event => {
    this.setState({
      selectedFile: event.target.files[0],
      loaded: 0
    });
  };
  handleUpload = () => {
    const data = new FormData();
    data.append("file", this.state.selectedFile, this.state.selectedFile.name);

    axios
      .post(endpoint, data, {
        onUploadProgress: ProgressEvent => {
          this.setState({
            loaded: (ProgressEvent.loaded / ProgressEvent.total) * 100
          });
        }
      })
      .then(res => {
        debugger;
        this.setState({ hasTracks: true });
        console.log(res); // Spotify object?

        // const joyLikelihood = res.data[0].faceAnnotations[0].joyLikelihood;
        // const angerLikelihood = res.data[0].faceAnnotations[0].angerLikelihood;
        // const sorrowLikelihood =
        //   res.data[0].faceAnnotations[0].sorrowLikelihood;

        // console.log(angerLikelihood);
        // console.log(joyLikelihood);
        // console.log(sorrowLikelihood);
      })
      .catch(error => {
        debugger;
      });
  };
  handleLogout = () => {
    axios
      .get(endpoint2, { withCredentials: true })
      .then(result => {
        this.setState({ isLoggedIn: null });
      })
      .catch(error => {
        console.log(error);
      });
  };

  render() {
    const hasTracks = this.state.hasTracks;

    if (this.state.isLoggedIn) {
      return (
        <header className="masthead">
          <div className="container h-100">
            <div className="row h-100">
              <div className="col-lg-7 my-auto">
                <div className="header-content mx-auto">
                  <div className="App">
                    <video controls="" autoplay="" name="media">
                      <source
                        src="https://p.scdn.co/mp3-preview/6247205863448da37f377a649a330458f3ec7487?cid=4184cfefa27d4bfaa7b5affd6d1e0b91"
                        type="audio/mpeg"
                      />
                    </video>

                    <button
                      onClick={this.handleLogout}
                      className="btn btn-outline btn-sm js-scroll-trigger green"
                    >
                      Logout
                    </button>
                    <h3 className="mb-5 mt-5 monospace">
                      Hi {this.state.username},
                    </h3>
                    <h1 className="monospace">Upload a selfie...</h1>
                    <div className="monospace fs30">
                      {Math.round(this.state.loaded, 2)} %
                    </div>
                    <div className="input-group">
                      <div className="file-input-wrapper">
                        <button className="btn-file-input green">
                          Upload File
                        </button>
                        <input
                          type="file"
                          name="blabla"
                          onChange={this.handleselectedFile}
                        />
                      </div>
                      <span className="input-group-btn">
                        <button
                          className="btn btn-default ml-3 white_bg"
                          type="button"
                          onClick={this.handleUpload}
                        >
                          Go!
                        </button>
                      </span>
                      <h2 className="mb-5 monospace mt-2">
                        ...and let me play you your MoodPlay.
                      </h2>
                    </div>
                  </div>
                  <br />
                  {/* <FileUploader /> NICER UPLOADER TEST */}
                </div>
              </div>

              <div className="col-lg-5 my-auto">
                <div className="device">
                  <div className="screen">
                    <img
                      src={require("./public/images/paint8.png")}
                      className="img-fluid"
                      alt=""
                    />
                  </div>
                  <div className="button" />
                </div>
              </div>
            </div>
          </div>
        </header>
      );
    } else {
      return (
        <header className="masthead">
          <video controls="" autoplay="" name="media">
            <source
              src="https://p.scdn.co/mp3-preview/6247205863448da37f377a649a330458f3ec7487?cid=4184cfefa27d4bfaa7b5affd6d1e0b91"
              type="audio/mpeg"
            />
          </video>
          <div className="container h-100">
            <div className="row h-100">
              <div className="col-lg-7 my-auto">
                <div className="header-content mx-auto">
                  <h1 className="mb-5 monospace">
                    MoodPlay plays music based on your mood...{" "}
                  </h1>
                  <a
                    href={`${config.backendUrl}user/auth/spotify`}
                    className="btn btn-outline btn-xl js-scroll-trigger"
                  >
                    Login with Spotify
                  </a>
                </div>
              </div>
              <div className="col-lg-5 my-auto">
                <div className="device-container">
                  <div className="device-mockup iphone6_plus portrait white">
                    <div className="device">
                      <div className="screen">
                        <img
                          src={require("./public/images/paint8.png")}
                          className="img-fluid"
                          alt=""
                        />
                      </div>
                      <div className="button" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>
      );
    }
  }
}

export default App;
