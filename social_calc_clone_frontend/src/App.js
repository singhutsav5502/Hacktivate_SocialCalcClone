import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login'; // Adjust the import paths as necessary
import SessionMenu from './components/SessionMenu';
import Spreadsheet from './components/Spreadsheet';
import { ThemeProvider } from '@mui/material';
import theme from './theme'
const App = () => {
  return (

    <Router>
      <Routes>
        {/* Redirect from / to /login */}
        <Route path="/" element={<Navigate to="/login" />} />
        {/* Route for Login */}
        <Route path="/login" element={<ThemeProvider theme={theme}><Login /></ThemeProvider>} />

        {/* Route for Session Menu */}
        <Route path="/session/options" element={<ThemeProvider theme={theme}><SessionMenu /></ThemeProvider>} />

        {/* Route for Joining a Session */}
        <Route
          path="/session/:userId/:sessionId"
          element={<ThemeProvider theme={theme}><Spreadsheet sessionId="someSessionId" userId="someUserId" /></ThemeProvider>}
        />
      </Routes>
    </Router>

  );
};

export default App;
