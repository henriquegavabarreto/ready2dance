# Ready2Dance

[Ready2Dance](https://parapara-game.web.app/) is an open-source, online, web-based rhythm ParaPara dance game.

Why Ready2Dance? [Here's why.](https://www.youtube.com/watch?v=t0-nJZ7zj-o)

## Motivation

[ParaPara rhythm games](https://en.wikipedia.org/wiki/Para_Para_Paradise) are out there since 2000. They are responsible for the introduction of the ParaPara dance to many people, which are still deeply connected to rhythm games or their music.

However, these games come with a problem: they all require specific hardware. Without a especific set of sensors, that can be hard to find or expensive, you won't be able to play a ParaPara rhythm game.

Ready2Dance tries to solve this issue using any camera connected to your device, making you able to play by using a simple webcam. The game includes an editor that gives you the possibility of creating your own charts for your favorite songs using YouTube videos or just play charts created by other members of the community.

## Features

- You can play instantly in your browser with nothing more than an internet connection and a webcam.
- Log in and create your own shared levels with the level editor.
- Scoring and Grading System. The better you go, the higher your grade.
- Compete for the best score in the ranking.
- Adjustable speed. Make the circle animation faster or slower.
- Hidden Animation Mode. You can hide the animations completely and just dance to the choreography.
- Configurable Pose Detection Sensibility. You can adjust how well the pose detection can be depending on your machine's capabilities.
- Camera Latency Calibration. Detect your camera latency using the game.

## Contributing

All ideas and contributions are welcome and help very much appreciated!

Open an issue, make a PR or even send an e-mail to `ready2dancegame at gmail.com` .

## Technology

- Web Application designed using [Vue](https://vuejs.org/), [Vuex](https://vuex.vuejs.org/) and [Vuetify](https://vuetifyjs.com/)
- Game and editor engines built using [PixiJS](https://www.pixijs.com/)
- Real-Time Pose Detection using [TensorFlow.js](https://www.tensorflow.org/js) and [PoseNet](https://www.npmjs.com/package/@tensorflow-models/posenet/v/1.0.3)
- Videos streamed using an [YouTube Player API](https://developers.google.com/youtube/iframe_api_reference) abstraction ([yt-player](https://www.npmjs.com/package/yt-player))
- Data stored at [Firebase](https://firebase.google.com/)

## Development

Install [Node.js](https://nodejs.org/en/).

### Project setup
```
npm install
```

#### Compiles and hot-reloads for development
```
npm run serve
```

#### Compiles and minifies for production
```
npm run build
```

#### Run your tests
```
npm run test
```

#### Lints and fixes files
```
npm run lint
```

#### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
