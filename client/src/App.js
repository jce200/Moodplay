// /client/App.js
// import "./public/css/style.css";
import config from "./config.json";
import React, { Component } from "react";
import { Link, Route, Switch, Redirect } from "react-router-dom";
import Home from "./components/home";
import Navbar from "./components/navBar";
import NotFound from "./components/notFound";

import axios from "axios";

const endpoint = "http://localhost:3000/upload";
const endpoint2 = "http://localhost:3000/logout";

class App extends Component {
  constructor() {
    super();
    this.state = {
      selectedFile: null,
      loaded: 0,
      isLoggedIn: false
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
        this.setState({ isLoggedIn: true });
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
        console.log(res.statusText);
      });
  };
  handleLogout = () => {
    axios
      .get(endpoint2, { withCredentials: true })
      .then(result => {
        console.log(result);
        this.setState({ isLoggedIn: null });
      })
      .catch(error => {
        console.log(error);
      });
  };
  render() {
    if (this.state.isLoggedIn) {
      return (
        <header className="masthead">
          <div className="container h-100">
            <div className="row h-100">
              <div className="col-lg-7 my-auto">
                <div className="header-content mx-auto">
                  <div className="App">
                    {/* <Navbar userInSession={this.state.isLoggedIn} /> */}
                    <input
                      type="file"
                      name=""
                      id=""
                      onChange={this.handleselectedFile}
                    />
                    <button onClick={this.handleUpload}>Upload</button>
                    <div> {Math.round(this.state.loaded, 2)} %</div>
                    <Link to="/">
                      <button onClick={this.handleLogout}>Logout</button>
                    </Link>
                  </div>

                  <form role="form" class="form">
                    <div className="form-group">
                      <label for="file">File</label>
                      <input
                        id="file"
                        type="file"
                        name=""
                        className="form-control"
                        accept=".jpg,.jpeg,.gif,.png"
                      />
                    </div>
                    <button
                      onClick={this.handleUpload}
                      id="color_detect"
                      type="button"
                      className="btn btn-primary"
                    >
                      Get Colours
                    </button>
                  </form>

                  <button
                    onClick={this.handleLogout}
                    className="btn btn-outline btn-xl js-scroll-trigger"
                  >
                    Logout
                  </button>
                </div>
              </div>
              <div className="col-lg-5 my-auto">
                <div className="device-container">
                  <div className="device-mockup iphone6_plus portrait white">
                    <div className="device">
                      <div className="screen">
                        <img
                          src="img/demo-screen-1.jpg"
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
    } else {
      return (
        <header className="masthead">
          <div className="container h-100">
            <div className="row h-100">
              <div className="col-lg-7 my-auto">
                <div className="header-content mx-auto">
                  <h1 className="mb-5">
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
                          src="img/demo-screen-1.jpg"
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
