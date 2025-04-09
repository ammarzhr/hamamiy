# Hamami Audio Call App

A WebRTC-based audio calling application that allows users to create rooms and invite friends to join via shareable links.

## Features

- Create audio call rooms with unique IDs
- Join existing rooms via link or room ID
- Enter your name without creating an account
- Mute/unmute functionality
- See connected users in the room with their names
- Simple, responsive UI built with Tailwind CSS

## Project Structure

```
hamami/
├── public/
│   ├── index.html
│   ├── app.js
├── server.js
├── package.json
├── netlify.toml
└── README.md
```

## How to Use

### Local Development

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:3000`

### Deployment to Netlify via GitHub

1. Create a new GitHub repository and push this code to it
2. Log in to your Netlify account
3. Click "New site from Git"
4. Select your GitHub repository
5. Configure the build settings:
   - Build command: `npm install`
   - Publish directory: `public`
6. Click "Deploy site"

### Using Hamami

1. Enter your name (no account needed)
2. Create a room by clicking "Create a New Room"
3. Copy the room link with the "Copy Link" button
4. Share the link with friends
5. When friends open the link, they'll enter their names and join your room

## Technologies Used

- WebRTC
- PeerJS
- Express.js
- Tailwind CSS