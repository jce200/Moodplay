# Moodplay
Moodplay plays music based on your mood.

![alt tag](https://www.monastic.nl/screenshot.png "Homepage")

## Webapp
A webapp using Google Vision API to analyze an uploaded image of your face. It detects your emotions and plays a Spotify song that fits your mood.

## Demo
Here is a working live demo :  https://moodplay.nl/

## Installation

1. Get a free API Key at [https://developer.spotify.com/](https://developer.spotify.com/)

2. Create a free MongoDB database at [https://mlab.com](https://mlab.com)

3. Clone the repo
```sh
git clone https://github.com/jce200/Moodplay.git
```
4. Install NPM packages
```sh
npm install
```
5. Enter your API Key and Secret in `server.js`
```JS
const appKey = "ENTER YOUR CLIENT ID";
const appSecret = "ENTER YOUR CLIENT SECRET";
```
6. Enter your MongoDB URI `server.js`
```JS
const dbRoute = "ENTER YOUR MONGODB URI";
```



## Technical information
* [Twitter Bootstrap](https://getbootstrap.com/)
* [Node.js](https://nodejs.org/en/docs/)
* [Express.js](https://expressjs.com/)
* [React.js](https://reactjs.org/)
* [MongoDB](https://www.mongodb.com/)

## API Reference
* [Google Cloud Vision API](https://cloud.google.com/vision/docs/apis)
* [Spotify API](https://developer.spotify.com/documentation/web-api/)
