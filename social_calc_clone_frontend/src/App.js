import React from 'react';
import { useSelector } from 'react-redux';
import SessionMenu from './components/SessionMenu';
import Spreadsheet from './components/Spreadsheet';
import { ThemeProvider } from '@mui/material';
import theme from './theme';
const App = () => {
  const sessionId = useSelector((state) => state.session.sessionId);
  const userId = useSelector((state) => state.user.userId);

  return (
    <ThemeProvider theme={theme}>
      {!sessionId ? <SessionMenu /> : <Spreadsheet sessionId={sessionId} userId={userId} />}
    </ThemeProvider>
  );
};

export default App;