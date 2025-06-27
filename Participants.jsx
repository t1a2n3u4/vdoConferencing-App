// src/components/Participants.jsx
import React, { useContext } from 'react';
import { SocketContext } from '../context/SocketContext';
import '../styles/Meetpage.css'; // Assuming Meetpage.css has styles for participants list

const Participants = () => {
  // Assuming 'participants' from SocketContext is an array of strings (usernames)
  // or an object/map where values are participant details (including username/userId)
  const { participants, users } = useContext(SocketContext); // Also destructuring 'users' if needed for more detailed participant info

  // It's common for participants data to be an object where keys are UIDs and values are user objects.
  // If `participants` is directly an array of usernames, simplify `Object.values` part.
  const participantList = Array.isArray(participants) ? participants : Object.values(participants);

  return (
    <div className="participants-list">
      {participantList.length === 0 ? (
        <p>No other participants in this meet yet.</p>
      ) : (
        participantList.map((participant, index) => {
          // Determine the key:
          // 1. If participant is an object and has a unique 'userId' or 'id', use that.
          // 2. If participant is an object and has a unique 'username', use that.
          // 3. If participant is just a string (username), use the string itself (assuming uniqueness).
          // 4. As a last resort, use the 'index' (but be cautious if the list order changes).

          let key = index; // Fallback to index
          let displayUsername = '';

          if (typeof participant === 'object' && participant !== null) {
            // Assuming participant is an object like { userId: 'abc', username: 'Alice' }
            key = participant.userId || participant.username || index;
            displayUsername = participant.username || participant.userId || `Participant ${index + 1}`;
          } else {
            // Assuming participant is a string (username)
            key = participant; // Use the username as key if it's a string and unique
            displayUsername = participant;
          }

          return (
            <div className="participant-item" key={key}>
              <p>{displayUsername}</p>
            </div>
          );
        })
      )}
    </div>
  );
};

export default Participants;
