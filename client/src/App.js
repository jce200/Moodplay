import config from "./config.json";
import React, { Component } from "react";
import ReactAudioPlayer from "react-audio-player";
import axios from "axios";

const endpoint = "/upload";
const endpoint2 = "/logout";
const endpoint3 = "/playmood";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedFile: null,
      loaded: 0,
      loading: false,
      isLoggedIn: false,
      username: "",
      hasTracks: false,
      joy: false,
      sorrow: false,
      anger: false,
      preview: ""
    };
  }

  change = e => {
    this.setState({
      [e.target.name]: e.target.value
    });
  };

  componentDidMount = () => {
    this.isLoggedIn();
  };

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
            loaded: (ProgressEvent.loaded / ProgressEvent.total) * 100,
            loading: true
          });
        }
      })
      .then(res => {
        this.setState({ joy: false });
        this.setState({ sorrow: false });
        this.setState({ sorrow: false });

        const joy = res.data[0].faceAnnotations[0].joyLikelihood;
        const anger = res.data[0].faceAnnotations[0].angerLikelihood;
        const sorrow = res.data[0].faceAnnotations[0].sorrowLikelihood;

        var min_valence = "0.0";
        var max_valence = "1.0";
        var min_danceability = "0.0";
        var max_danceability = "1.0";

        // The overall loudness of a track in decibels (dB).
        // Loudness values are averaged across the entire track and are useful for comparing relative loudness of tracks.
        // Loudness is the quality of a sound that is the primary psychological correlate of physical strength (amplitude).
        // Values typical range between -60 and 0 db.
        // let min_loudness = "-60";
        // let max_loudness = "0";

        let min_tempo = "0";
        let max_tempo = "100";

        if (joy === "VERY_LIKELY" || joy === "LIKELY" || joy === "POSSIBLE") {
          this.setState({ joy: true, hasTracks: true });
          min_valence = "0.5";
          max_valence = "1.0";
          min_danceability = "0.7";
        }
        if (
          sorrow === "VERY_LIKELY" ||
          sorrow === "LIKELY" ||
          joy === "VERY_UNLIKELY"
        ) {
          this.setState({ sorrow: true, hasTracks: true });
          min_valence = "0.0";
          max_valence = "0.3";
          max_danceability = "0.6";
        }
        if (anger === "VERY_LIKELY" || anger === "LIKELY") {
          this.setState({ anger: true, joy: false, hasTracks: true });
          // min_valence = "0.0";
          max_valence = "0.6";
          // max_danceability = "0.6";
          // min_loudness = "0.7";
          // min_tempo = "60";
        }
        console.log(min_danceability);
        console.log(min_valence);
        axios
          .post(endpoint3, {
            withCredentials: true,
            min_valence: min_valence,
            max_valence: max_valence,
            min_danceability: min_danceability,
            max_danceability: max_danceability,
            // min_loudness: min_loudness,
            // max_loudness: max_loudness,
            min_tempo: min_tempo,
            max_tempo: max_tempo
          })
          .then(result => {
            this.setState({ preview: result.data });
          })
          .catch(error => {
            console.log(error);
          });
      })
      .catch(error => {});
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

  renderMood() {
    if (this.state.joy)
      return (
        <React.Fragment>
          <h1 className="monospace">You look quite happy...</h1>
          <h3 className="monospace mb-5">Let's play something ecstatic.</h3>
        </React.Fragment>
      );
    if (this.state.sorrow)
      return (
        <React.Fragment>
          <h1 className="monospace">Mmm, you seem down...</h1>
          <h3 className="monospace mb-5">I think this song fits your mood.</h3>
        </React.Fragment>
      );
    if (this.state.anger)
      return (
        <React.Fragment>
          <h1 className="monospace">Angry?!?!?!</h1>
          <h3 className="monospace mb-5">Listen to this!!</h3>
        </React.Fragment>
      );
  }

  renderLoading() {
    if (this.state.loading)
      return (
        <React.Fragment>
          <h3 className="monospace">Analyzing...</h3>
        </React.Fragment>
      );
  }

  renderAudio() {
    if (!this.state.hasTracks)
      return (
        <React.Fragment>
          <h1 className="monospace">Upload a selfie...</h1>
          <div className="monospace fs30">
            {Math.round(this.state.loaded, 2)} %
            <div>{this.renderLoading()}</div>
          </div>
          <div className="input-group">
            <div className="file-input-wrapper">
              <button className="btn-file-input green">Choose image</button>
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
                Upload
              </button>
            </span>
            <h2 className="mb-5 monospace mt-2">
              ...and moodplay will play you mood.
            </h2>
          </div>
        </React.Fragment>
      );
    if (this.state.hasTracks)
      return (
        <React.Fragment>
          <ReactAudioPlayer src={this.state.preview} controls />
        </React.Fragment>
      );
  }

  render() {
    if (this.state.isLoggedIn) {
      return (
        <header className="masthead">
          <div className="container h-100">
            <div className="row h-100">
              <div className="col-lg-6 my-auto">
                <div className="header-content mx-auto">
                  <div className="App">
                    <button
                      onClick={this.handleLogout}
                      className="btn btn-outline btn-sm js-scroll-trigger green"
                    >
                      Logout
                    </button>
                    <h3 className="mb-5 mt-3 monospace">
                      Hi {this.state.username},
                    </h3>
                    {this.renderMood()}
                    {this.renderAudio()}
                  </div>
                  <br />
                  {/* <FileUploader /> NICER UPLOADER TEST */}
                </div>
              </div>

              <div className="col-lg-6 my-auto">
                <div className="device">
                  <div className="screen">
                    <img
                      src={require("./public/images/paint.png")}
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
          <div className="container h-100">
            <div className="row h-100">
              <div className="col-lg-6 my-auto">
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
              <div className="col-lg-6 my-auto">
                <div className="device-mockup iphone6_plus portrait white">
                  <div className="device">
                    <div className="screen">
                      <img
                        src={require("./public/images/paint.png")}
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
        </header>
      );
    }
  }
}

export default App;
