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
  IonToast,
  IonButtons,
  IonToolbar,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { eye, eyeOff, chevronBackOutline, logoGoogle } from 'ionicons/icons';
import './Home.css';
import { collection, addDoc } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import '../firebaseConfig';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const history = useHistory();
  const db = getFirestore();
  const dbLocation = 'login';
  const auth = getAuth();

  // Add user data to the database
  const addUserDataToDatabase = async (userId: string) => {
    try {
      const docRef = await addDoc(collection(db, dbLocation), { userId, email });
      console.log('User data added to the database');
    } catch (error) {
      console.error('Error adding user data to the database:', error);
    }
  };

  // Register user
  const handleRegister = async () => {
    try {
      // Check if email and password are empty
      if (password.trim() === '') {
        console.error('Password cannot be empty');
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;

      addUserDataToDatabase(userId);

      setShowToast(true);

      history.push('/home');

    } catch (error) {
      console.error('Error registering user:', error);
    }
  };

  // const handleGoogleSignIn = async () => {
  //   try {
  //     const provider = new GoogleAuthProvider();
  //     const result = await signInWithPopup(auth, provider);

  //     console.log('Google Sign-In Result:', result);

  //     history.push('/home');
  //   } catch (error) {
  //     console.error('Error during Google Sign-In:', error);
  //   }
  // };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleLogin = () => {
    history.push('/home');
  };

  return (
    <IonPage>
      <IonContent className="ion-content">
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton fill="clear" color="primary" onClick={toggleLogin}>
              <IonIcon icon={chevronBackOutline} slot="icon-only"></IonIcon>
            </IonButton>
          </IonButtons>
          <IonTitle className="ion-title" style={{ marginRight: "60px" }}>Check-Mate</IonTitle>
        </IonToolbar>
        <IonCard className="login-card" style={{ marginTop: "1.5px" }}>
          <IonCardContent>
            <div className="login-form">
              <IonInput
                type="email"
                placeholder="Email"
                value={email}
                onIonChange={(e) => setEmail(e.detail.value!)}
                style={{ marginTop: '-50px' }}
              />
              <IonInput
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onIonChange={(e) => setPassword(e.detail.value!)}
                style={{ marginTop: '10px', paddingRight: '40px' }}
              ></IonInput>
              <IonIcon
                icon={showPassword ? eye : eyeOff}
                onClick={toggleShowPassword}
                style={{
                  position: 'absolute',
                  top: '42%',
                  right: '10px',
                  transform: 'translateY(-50%)',
                  cursor: 'pointer',
                  zIndex: 1,
                }}
              />
              {/* or sign in with google
              <IonButton
                className="google-sign-in-button"
                onClick={handleGoogleSignIn}
                fill="clear"
              >
                <IonIcon icon={logoGoogle} slot="start" />
              </IonButton> */}
              <IonButton
                className="login-button"
                onClick={handleRegister}
                style={{ marginTop: '35px', width: '90px' }}
              >
                Register
              </IonButton>
            </div>
          </IonCardContent>
        </IonCard>
      </IonContent>
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message="Registration successful. Please login."
        duration={2000}
      />
    </IonPage>
  );
};

export default Register;
