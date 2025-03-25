import React, { useState, useEffect } from "react";
import { db } from "../firebase-config";
import { collection, query, getDocs, orderBy } from "firebase/firestore";

function RoomList({ setRoom }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newRoomInput, setNewRoomInput] = useState("");
  const [showNewRoomForm, setShowNewRoomForm] = useState(false);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const messagesRef = collection(db, "messages");
        const q = query(messagesRef, orderBy("room", "asc"));
        const querySnapshot = await getDocs(q);
        
        const uniqueRooms = new Set();
        querySnapshot.forEach((doc) => {
          const roomName = doc.data().room;
          if (roomName) {
            uniqueRooms.add(roomName);
          }
        });
        
        setRooms(Array.from(uniqueRooms));
      } catch (err) {
        console.error("Error fetching rooms:", err);
        setError("Failed to load rooms. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const handleJoinRoom = (roomName) => {
    setRoom(roomName);
  };

  const handleCreateRoom = () => {
    if (newRoomInput.trim()) {
      setRoom(newRoomInput.trim());
    }
  };

  return (
    <div className="room-list-container">
      <h2>Available Chat Rooms</h2>
      
      {error && <p className="error-message">{error}</p>}
      
      {loading ? (
        <div className="loading-spinner">Loading rooms...</div>
      ) : (
        <>
          {rooms.length > 0 ? (
            <div className="room-list">
              {rooms.map((roomName) => (
                <div 
                  key={roomName} 
                  className="room-item"
                  onClick={() => handleJoinRoom(roomName)}
                >
                  <div className="room-name">{roomName}</div>
                  <button className="join-btn">Join</button>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-rooms">No active chat rooms found. Create a new one!</p>
          )}
          
          {showNewRoomForm ? (
            <div className="new-room-form">
              <input
                type="text"
                value={newRoomInput}
                onChange={(e) => setNewRoomInput(e.target.value)}
                placeholder="Enter new room name"
              />
              <div className="form-buttons">
                <button 
                  className="create-btn"
                  onClick={handleCreateRoom}
                  disabled={!newRoomInput.trim()}
                >
                  Create & Join
                </button>
                <button 
                  className="cancel-btn"
                  onClick={() => {
                    setShowNewRoomForm(false);
                    setNewRoomInput("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button 
              className="new-room-btn"
              onClick={() => setShowNewRoomForm(true)}
            >
              Create New Room
            </button>
          )}
        </>
      )}
    </div>
  );
}

export default RoomList;