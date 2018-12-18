// /client/App.js
// import "./public/css/style.css";
import config from "./config.json";
import React, { Component } from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import Home from "./components/home";
import Navbar from "./components/navBar";
import NotFound from "./components/notFound";

import axios from "axios";

const endpoint = "http://localhost:3000/upload";

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
  logout = () => {
    axios
      .post("http://localhost:3000/logout", { withCredentials: true })
      .then(result => {
        this.setState({ loggedInUser: null });
      })
      .catch(error => {
        console.log(error);
      });
  };
  render() {
    if (this.state.loggedIn) {
      return (
        <div id="wrapper">
          <section />
        </div>
      );
    } else {
      return (
        <div className="App">
          {/* <Navbar userInSession={this.state.isLoggedIn} /> */}
          <a href={`${config.backendUrl}user/auth/spotify`}> Spotify </a>
        </div>
      );
    }
  }
}

export default App;
