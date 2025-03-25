import { useState } from "react";
import "./App.css";
import Auth from "./components/Auth";
import Cookies from "universal-cookie";
import Chat from "./components/Chat";
import RoomList from "./components/RoomList";
import { signOut } from "firebase/auth";
import { auth } from "./firebase-config";

const backgroundStyle = {
  background: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), 
               url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop')`,
  backgroundSize: 'cover',
  backgroundPosition: 'center center',
  backgroundAttachment: 'fixed',
  minHeight: '100vh'
};

function App() {
  const cookies = new Cookies();
  const [isAuth, setIsAuth] = useState(cookies.get("authtoken"));
  const [room, setRoom] = useState("");

  const handleSignOut = async () => {
    signOut(auth);
    cookies.remove("authtoken");
    setIsAuth(false);
    setRoom(null);
  };
  
  if (!isAuth)
    return (
      <div className="login-container" style={backgroundStyle}>
        <h1>Welcome to Chatroom</h1>
        <Auth setIsAuth={setIsAuth} />
      </div>
    );
  else {
    return (
      <div className="container" style={backgroundStyle}>
        <button onClick={handleSignOut} className="signout">
          SignOut
        </button>
        {room ? <Chat room={room} setRoom={setRoom} /> : <RoomList setRoom={setRoom} />}
      </div>
    );
  }
}

export default App;
