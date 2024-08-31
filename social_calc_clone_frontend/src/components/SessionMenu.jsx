import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setSessionId, setSessionData } from '../store/sessionSlice';
import axios from 'axios';

const SessionMenu = () => {
  const [sessionInput, setSessionInput] = useState('');
  const dispatch = useDispatch();

  const handleCreateSession = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/session/create');
      const { sessionId } = response.data;
      dispatch(setSessionId(sessionId));
      alert(`New session created with ID: ${sessionId}`);
    } catch (error) {
      console.error('Error creating session:', error);
      alert('Failed to create a new session. Please try again.');
    }
  };

  const handleJoinSession = async () => {
    if (!sessionInput) {
      alert('Please enter a session ID to join.');
      return;
    }

    try {
      const response = await axios.get(`http://localhost:5000/api/session/join/${sessionInput}`);
      const { sessionId, sessionData } = response.data;
      dispatch(setSessionId(sessionId));
      dispatch(setSessionData(sessionData));
      alert(`Joined session with ID: ${sessionId}`);
    } catch (error) {
      console.error('Error joining session:', error);
      alert('Failed to join session. Please check the session ID and try again.');
    }
  };

  return (
    <div>
      <h2>Join or Create a Session</h2>
      <button onClick={handleCreateSession}>Create New Session</button>
      <div>
        <input
          type="text"
          placeholder="Enter Session ID"
          value={sessionInput}
          onChange={(e) => setSessionInput(e.target.value)}
        />
        <button onClick={handleJoinSession}>Join Session</button>
      </div>
    </div>
  );
};

export default SessionMenu;
