import React, { useState } from "react";
import { auth, provider } from "../firebase-config";
import { 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile 
} from "firebase/auth";
import Cookies from "universal-cookie";
const cookies = new Cookies();

function Auth(props) {
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signInError, setSignInError] = useState("");
  const [signInLoading, setSignInLoading] = useState(false);
  
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [signUpError, setSignUpError] = useState("");
  const [signUpLoading, setSignUpLoading] = useState(false);
  
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState("");

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      setGoogleError("");
      
      setTimeout(async () => {
        try {
          const result = await signInWithPopup(auth, provider);
          cookies.set("authtoken", result.user.refreshToken, {
            path: '/',
            secure: true,
            sameSite: 'none'
          });
          props.setIsAuth(true);
        } catch (err) {
          console.error("Authentication error:", err);
          if (err.code === 'auth/popup-closed-by-user') {
            setGoogleError('Authentication popup was closed. Please try again.');
          } else if (err.code === 'auth/popup-blocked') {
            setGoogleError('Popup was blocked by your browser. Please allow popups for this site.');
          } else {
            setGoogleError(`Authentication failed: ${err.message}`);
          }
          setGoogleLoading(false);
        }
      }, 100);
    } catch (err) {
      console.error("Pre-authentication error:", err);
      setGoogleError(`Error preparing authentication: ${err.message}`);
      setGoogleLoading(false);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setSignInError("");
    
    if (!signInEmail || !signInPassword) {
      setSignInError("Please enter both email and password");
      return;
    }
    
    try {
      setSignInLoading(true);
      const result = await signInWithEmailAndPassword(auth, signInEmail, signInPassword);
      
      cookies.set("authtoken", result.user.refreshToken, {
        path: '/',
        secure: true,
        sameSite: 'none'
      });
      props.setIsAuth(true);
    } catch (err) {
      console.error("Sign in error:", err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setSignInError('Invalid email or password. Please try again.');
      } else {
        setSignInError(err.message);
      }
    } finally {
      setSignInLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setSignUpError("");
    
    if (!signUpEmail || !signUpPassword) {
      setSignUpError("Please enter both email and password");
      return;
    }
    
    if (!displayName.trim()) {
      setSignUpError("Please enter your name");
      return;
    }
    
    try {
      setSignUpLoading(true);
      const result = await createUserWithEmailAndPassword(auth, signUpEmail, signUpPassword);
      
      await updateProfile(result.user, {
        displayName: displayName.trim()
      });
      
      cookies.set("authtoken", result.user.refreshToken, {
        path: '/',
        secure: true,
        sameSite: 'none'
      });
      props.setIsAuth(true);
    } catch (err) {
      console.error("Sign up error:", err);
      if (err.code === 'auth/email-already-in-use') {
        setSignUpError('This email is already registered. Please sign in instead.');
      } else if (err.code === 'auth/invalid-email') {
        setSignUpError('Please enter a valid email address.');
      } else if (err.code === 'auth/weak-password') {
        setSignUpError('Password should be at least 6 characters.');
      } else {
        setSignUpError(err.message);
      }
    } finally {
      setSignUpLoading(false);
    }
  };

  return (
    <div className="login">
      <div className="auth-forms">
        {/* Sign In Form */}
        <div className="email-auth">
          <h2>Sign In</h2>
          {signInError && <p className="auth-error">{signInError}</p>}
          <form onSubmit={handleSignIn}>
            <input 
              type="email" 
              placeholder="Email" 
              value={signInEmail}
              onChange={(e) => setSignInEmail(e.target.value)}
              disabled={signInLoading}
            />
            <input 
              type="password" 
              placeholder="Password" 
              value={signInPassword}
              onChange={(e) => setSignInPassword(e.target.value)}
              disabled={signInLoading}
            />
            <button type="submit" disabled={signInLoading}>
              {signInLoading ? "Processing..." : "Sign In"}
            </button>
          </form>
        </div>
        
        {/* Divider */}
        <div className="auth-forms-divider"></div>
        
        {/* Sign Up Form */}
        <div className="email-auth">
          <h2>Create Account</h2>
          {signUpError && <p className="auth-error">{signUpError}</p>}
          <form onSubmit={handleSignUp}>
            <input 
              type="text" 
              placeholder="Your Name" 
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              disabled={signUpLoading}
            />
            <input 
              type="email" 
              placeholder="Email" 
              value={signUpEmail}
              onChange={(e) => setSignUpEmail(e.target.value)}
              disabled={signUpLoading}
            />
            <input 
              type="password" 
              placeholder="Password" 
              value={signUpPassword}
              onChange={(e) => setSignUpPassword(e.target.value)}
              disabled={signUpLoading}
            />
            <button type="submit" disabled={signUpLoading}>
              {signUpLoading ? "Processing..." : "Sign Up"}
            </button>
          </form>
        </div>
      </div>
      
      <div className="auth-divider">
        <span>OR</span>
      </div>
      
      {googleError && <p className="auth-error">{googleError}</p>}
      <button className="google-btn" onClick={handleGoogleSignIn} disabled={googleLoading}>
        {googleLoading ? (
          "Processing..."
        ) : (
          <>
            <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            <span>Sign in with Google</span>
          </>
        )}
      </button>
    </div>
  );
}

export default Auth;
