# SocialCalc Clone Documentation

## Deployment Link for Frontend

- **Deployment Link:** [Your Deployment Link Here](https://hacktivist-social-calc-clone.vercel.app/login)

## Frontend Setup

### Step-by-Step Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/<your_username>/Hacktivist_SocialCalcClone.git
   ```

2. **Frontend Setup**

   ```
   cd social_calc_clone_frontend
   npm install
   npm run start // to run
   ```

   **Setup Environment Variables**

   Create a .env file in the frontend directory of your project. Add the following example content:

   ```
   REACT_APP_SERVER_URL=http://<domain_name>:<port>
   ```

3. **Backend Setup**

   ```
   cd social_calc_clone_backend
   npm install
   node index.js // to run
   ```

   Create a .env file in the backend directory of your project. Add the following example content:

   ```
    MONGO_DB_URL=mongodb://mongo_db_uri/socialcalc
   ```

## Dependencies

### Frontend Dependencies

- `@emotion/react`, `@emotion/styled`: Emotion for styling.
- `@mui/icons-material`, `@mui/material`: Material-UI components and icons.
- `@reduxjs/toolkit`, `react-redux`: Redux Toolkit and React Redux for state management.
- `axios`: HTTP client for API requests.
- `diff-match-patch`: Library for handling differences and patches.
- `mathjs`: Mathematical expressions library.
- `react-router-dom`: Routing library for React.
- `react-toastify`: Toast notifications.
- `socket.io-client`: Client-side library for WebSocket connections.
- `web-vitals`: Tool for measuring web performance.

### Backend Dependencies

- `async-lock`: Library for managing asynchronous operations.
- `cors`: Middleware for enabling Cross-Origin Resource Sharing.
- `diff-match-patch`: Library for handling differences and patches.
- `dotenv`: Module for environment variable management.
- `express`: Web framework for Node.js.
- `mongoose`: ODM for MongoDB.
- `socket.io`: Library for WebSocket communication.
