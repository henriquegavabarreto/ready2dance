# Ready2Dance

[Ready2Dance](https://parapara-game.web.app/) is an open-source, web-based rhythm ParaPara dance game that runs entirely in the browser.

Why Ready2Dance? Ready to Dance is one of my favorite eurobeat songs! [Check it out.](https://www.youtube.com/watch?v=t0-nJZ7zj-o)

## Motivation

[ParaPara rhythm games](https://en.wikipedia.org/wiki/Para_Para_Paradise) have existed since 2000 and are responsible for introducing ParaPara dance to many people who remain deeply connected to rhythm games and their music.

However, these games share a common problem: they all require specific hardware. Without a dedicated set of infrared sensors — which can be difficult to find and expensive — playing a ParaPara rhythm game is not possible.

Ready2Dance solves this using any camera connected to your device. Real-time pose estimation via TensorFlow.js MoveNet detects your arm movements through a standard webcam, no special hardware required. The game also includes a full level editor, allowing anyone to create and share charts for their favorite songs using YouTube videos.

## Features

- **Play instantly in your browser** — no downloads, no hardware, just a webcam and an internet connection
- **Guest access** — play and create charts without creating an account
- **Level editor** — create charts for any ParaPara song using YouTube video IDs, with BPM tap tool and metronome for precise timing
- **Camera latency calibration** — measure and compensate for your camera's latency for more accurate detection
- **Export and import charts** — share charts as JSON files or load them locally without a database connection
- **Scoring and grading system** — Perfect and miss ratings with combo tracking
- **Leaderboards** — compete for the best score per song and difficulty
- **Adjustable speed** — make circle animations faster or slower to match your skill level
- **Hidden animation mode** — hide the on-screen cues and dance freely to the choreography
- **Community songs** — play charts created and shared by other players

## Camera Setup

Ready2Dance uses pose estimation to detect your movements, which works best under the following conditions:

- **Lighting** — make sure your environment is well lit, ideally with light facing you rather than behind you
- **Distance** — stand far enough from the camera so your full upper body is visible, including both arms fully extended
- **Background** — a plain, uncluttered background improves detection accuracy
- **Camera latency** — use the built-in latency calibration tool in settings if your movements feel out of sync with the game

## Technology

- Single-page application built with [Vue 2](https://vuejs.org/), [Vuex](https://vuex.vuejs.org/), and [Vuetify](https://vuetifyjs.com/)
- Game and editor rendering built with [PixiJS](https://www.pixijs.com/) — static elements pre-rendered as textures for performance; dynamic elements drawn per frame
- Real-time pose detection using [TensorFlow.js](https://www.tensorflow.org/js) and [MoveNet](https://blog.tensorflow.org/2021/05/next-generation-pose-detection-with-movenet-and-tensorflowjs.html)
- YouTube video streaming via [yt-player](https://www.npmjs.com/package/yt-player) with [YouTube Data API v3](https://developers.google.com/youtube/v3) for video validation in the editor
- Authentication, Realtime Database, and hosting via [Firebase](https://firebase.google.com/)

## Contributing

All ideas and contributions are welcome.

Open an issue, make a pull request, or send an email to `ready2dancegame at gmail.com`.

## Development

Requires **Node.js 16** (recommended). Later versions may cause compatibility issues with some dependencies.

If you use [nvm](https://github.com/nvm-sh/nvm):
```bash
nvm use 16
```

### Environment setup

Create a `.env.local` file in the project root with the following:

```
VUE_APP_YT_API=your_youtube_data_api_v3_key
```

You can obtain a YouTube Data API v3 key from the [Google Cloud Console](https://console.cloud.google.com/). This is required for the editor's video validation feature.

### Project setup
```bash
npm install
```

### Run development server
```bash
npm run serve
```

### Build for production
```bash
npm run build
```

### Lint
```bash
npm run lint
```

### Deploy to Firebase Hosting
```bash
npm run build
firebase deploy
```

Requires the [Firebase CLI](https://firebase.google.com/docs/cli) and appropriate project permissions.

## Log

- **May 2026** — Removed Cloud Functions dependency; scoring and likes now use client-side Realtime Database writes. Editor opened to guest users.
- **March 2022** — Switched pose detection from PoseNet to MoveNet for improved accuracy and performance.