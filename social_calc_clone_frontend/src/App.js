import React from 'react';
import { useSelector } from 'react-redux';
import SessionMenu from './components/SessionMenu';
import Spreadsheet from './components/Spreadsheet';

const App = () => {
  const sessionId = useSelector((state) => state.session.sessionId);

  return (
    <div>
      {!sessionId ? <SessionMenu /> : <Spreadsheet />}
    </div>
  );
};

export default App;