import React, { useRef, useState, useEffect } from 'react';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonPopover,
  IonList,
  IonItem,
  IonIcon,
} from '@ionic/react';
import TodoList from '../components/TodoList';
import { logOut, menu, person } from 'ionicons/icons';
import { getAuth, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { useHistory } from 'react-router-dom';

const Todo: React.FC = () => {
  const menuRef = useRef<HTMLIonMenuElement | null>(null);
  const [popoverState, setShowPopover] = useState<{ showPopover: boolean, event: Event | undefined }>({ showPopover: false, event: undefined });
  const [user, setUser] = useState<User | null>(null);
  const history = useHistory();

  useEffect(() => {
    // Redirect to home page if the user is not logged in
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Toggle the menu
  const toggleMenu = () => {
    if (menuRef.current) {
      menuRef.current.toggle();
    }
  };

  // Present the popover menu
  const presentPopover = (event: React.MouseEvent) => {
    setShowPopover({ showPopover: true, event: event.nativeEvent });
  };

  // Dismiss the popover menu
  const dismissPopover = () => {
    setShowPopover({ showPopover: false, event: undefined });
  };

  // Logout
  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      history.push('/home');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <IonPage>
      <IonPopover
        isOpen={popoverState.showPopover}
        event={popoverState.event}
        onDidDismiss={dismissPopover}
      >
        <IonList>
          <IonItem routerLink="/profile" onClick={dismissPopover}>
            <IonIcon icon={person} slot="start" style={{ marginRight: '8px', color: "black" }}></IonIcon>Profile
          </IonItem>
          <IonItem onClick={handleLogout}>
            <IonIcon icon={logOut} slot="start" style={{ marginRight: '8px', color: "black" }}></IonIcon>Logout
          </IonItem>
        </IonList>
      </IonPopover>
      <IonHeader>
        <IonToolbar>
          <IonTitle className="ion-title" style={{ fontSize: '30px', marginRight: '50px' }}>
            Check-Mate
          </IonTitle>
          <IonButtons slot="start">
            <IonButton fill="clear" color="primary" onClick={(e) => presentPopover(e)}>
              <IonIcon icon={menu} slot="icon-only"></IonIcon>
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {user && <TodoList user={user} />}
      </IonContent>
    </IonPage>
  );
}

export default Todo;
