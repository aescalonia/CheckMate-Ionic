import React, { useState } from 'react';
import {
  IonButton,
  IonContent,
  IonInput,
  IonPage,
  IonTitle,
  IonCard,
  IonCardContent,
  IonIcon,
  IonLoading,
  IonToast,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { eye, eyeOff, logoGoogle } from 'ionicons/icons';
import {
  getAuth,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { collection, getDocs, query, where as firestoreWhere } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import '../firebaseConfig';

import './Home.css';

const Home: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showNotRegisteredToast, setShowNotRegisteredToast] = useState(false);
  const [showIncorrectPasswordToast, setShowIncorrectPasswordToast] = useState(false);
  const [showEmptyFieldsToast, setShowEmptyFieldsToast] = useState(false);
  const history = useHistory();
  const auth = getAuth();
  const db = getFirestore();

  const handleLogin = async () => {
    try {
      // Check if email and password are empty
      if (email.trim() === '' || password.trim() === '') {
        console.error('Email and password cannot be empty');
        setShowEmptyFieldsToast(true);
        return;
      }

      // Check if email is registered
      const q = query(collection(db, 'login'), firestoreWhere('email', '==', email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.error('Email is not registered');
        setShowNotRegisteredToast(true);
        return;
      }

      setLoading(true);

      await signInWithEmailAndPassword(auth, email, password);

      history.push('/todo');
    } catch (error) {
      console.error('Error during login:', error);

      if (error === 'auth/wrong-password') {
        setShowIncorrectPasswordToast(true);
      } else if (error === 'auth/user-not-found') {
        setShowNotRegisteredToast(true);
      } else {
        // Handle other login errors
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    history.push('/register');
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <IonPage>
      <IonContent className="ion-content">
        <IonTitle className="ion-title">Check-Mate</IonTitle>
        <IonCard className="login-card">
          <IonCardContent>
            <div className="login-form">
              <IonInput
                type="email"
                placeholder="Email"
                value={email}
                onIonChange={(e) => setEmail(e.detail.value!)}
              />
              <IonInput
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onIonChange={(e) => setPassword(e.detail.value!)}
                style={{ marginTop: '10px', paddingRight: '40px' }}
              />
              <IonIcon
                icon={showPassword ? eye : eyeOff}
                onClick={toggleShowPassword}
                style={{
                  position: 'absolute',
                  top: '44%',
                  right: '10px',
                  transform: 'translateY(-50%)',
                  cursor: 'pointer',
                  zIndex: 1,
                }}
              />
              <IonButton
                className="login-button"
                onClick={handleLogin}
                style={{ marginTop: '35px', width: '90px' }}
              >
                Login
              </IonButton>
              <div className="register-text">
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: 'gray',
                    textDecoration: 'underline',
                    textAlign: 'center',
                    marginTop: '15px',
                  }}
                >
                  <span onClick={handleRegister}>Or register here</span>
                </div>
              </div>
            </div>
          </IonCardContent>
        </IonCard>
      </IonContent>
      <IonLoading isOpen={loading} message="Logging in..." />
      <IonToast
        isOpen={showNotRegisteredToast}
        onDidDismiss={() => setShowNotRegisteredToast(false)}
        message="Email is not registered. Please register first."
        duration={4000}
      />
      <IonToast
        isOpen={showIncorrectPasswordToast}
        onDidDismiss={() => setShowIncorrectPasswordToast(false)}
        message="Incorrect password. Please try again."
        duration={4000}
      />
      <IonToast
        isOpen={showEmptyFieldsToast}
        onDidDismiss={() => setShowEmptyFieldsToast(false)}
        message="Email and password cannot be empty."
        duration={4000}
      />
    </IonPage>
  );
};

export default Home;
