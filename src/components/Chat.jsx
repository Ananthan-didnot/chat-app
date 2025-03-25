import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase-config";
import { collection, addDoc, serverTimestamp, query, where, orderBy, onSnapshot, getDocs } from "firebase/firestore";
import SingleChat from "./SingleChat";

function Chat(props) {
  const [msgs, setMgs] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [error, setError] = useState(null);

  const getMessageRef = () => collection(db, "messages");

  useEffect(() => {
    console.log("Messages updated:", msgs);
    const element = document.getElementById("chat-window");
    if (element) {
      element.scrollTo({
        top: element.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [msgs]);

  useEffect(() => {
    console.log("Setting up message listener for room:", props.room);
    
    // First, try to get existing messages
    const fetchExistingMessages = async () => {
      try {
        console.log("Attempting to fetch existing messages for room:", props.room);
        const queryMessage = query(
          getMessageRef(),
          where("room", "==", props.room),
          orderBy("createdAt", "asc")
        );
        const querySnapshot = await getDocs(queryMessage);
        console.log("Fetched existing messages:", querySnapshot.docs.length);
        const messages = querySnapshot.docs.map(doc => {
          const data = doc.data();
          console.log("Existing message data:", data);
          return {
            id: doc.id,
            ...data
          };
        });
        setMgs(messages);
      } catch (error) {
        console.error("Error fetching existing messages:", error);
        setError(`Failed to load messages: ${error.message}`);
      }
    };

    // Then set up real-time listener
    console.log("Setting up real-time listener for room:", props.room);
    const queryMessage = query(
      getMessageRef(),
      where("room", "==", props.room),
      orderBy("createdAt", "asc")
    );
    
    const unsubscribe = onSnapshot(queryMessage, 
      (snapshot) => {
        console.log("Received message snapshot:", snapshot.docs.length, "messages");
        const messages = snapshot.docs.map(doc => {
          const data = doc.data();
          console.log("Real-time message data:", data);
          return {
            id: doc.id,
            ...data
          };
        });
        console.log("Setting messages state:", messages);
        setMgs(messages);
      }, 
      (error) => {
        console.error("Error in message listener:", error);
        setError(`Error receiving messages: ${error.message}`);
        setMgs([]);
      }
    );
    
    // Fetch existing messages when component mounts
    fetchExistingMessages();
    
    return () => {
      console.log("Cleaning up message listener");
      unsubscribe();
    };
  }, [props.room]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMsg.trim()) return;

    try {
      const messageData = {
        text: newMsg.trim(),
        user: auth.currentUser.displayName || "Anonymous User",
        createdAt: serverTimestamp(),
        room: props.room
      };
      console.log("Sending message:", messageData);
      await addDoc(getMessageRef(), messageData);
      console.log("Message sent successfully");
      setNewMsg("");
    } catch (error) {
      console.error("Error sending message:", error);
      setError(`Failed to send message: ${error.message}`);
    }
  };
  
  return (
    <div className="chat">
      <div className="chat-header">
        <button 
          className="back-btn" 
          onClick={() => props.setRoom("")}
        >
          ← Back
        </button>
        <h1>{props.room} Chatroom</h1>
      </div>
      {error && (
        <div style={{ 
          color: 'red', 
          padding: '10px', 
          margin: '10px 0', 
          backgroundColor: '#ffebee',
          borderRadius: '4px'
        }}>
          {error}
        </div>
      )}
      <div id="chat-window">
        {msgs && msgs.length > 0 ? (
          msgs.map((message) => (
            <div 
              key={message.id} 
              className="message-container"
              style={{
                display: "flex", 
                justifyContent: message.user === auth.currentUser.displayName ? "flex-end" : "flex-start",
              }}
            >
              <SingleChat message={message} />
            </div>
          ))
        ) : (
          <div className="no-messages">
            No messages yet. Start the conversation!
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          placeholder="Type your message..."
        />
        <button type="submit">
          <span>➤</span>
        </button>
      </form>
    </div>
  );
}

export default Chat;