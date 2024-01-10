import React, { useEffect, useState } from 'react';
import {
  IonCard,
  IonContent,
  IonTextarea,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon,
  IonToast,
  IonButtons,
} from '@ionic/react';
import { chevronBackOutline, checkmarkOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import '../firebaseConfig';

// Interface for the Task object
interface Task {
  id: string;
  text: string;
  completed: boolean;
  date: string;
}


const Report: React.FC = () => {
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [userInput, setUserInput] = useState<string>('');
  const history = useHistory();
  const auth = getAuth();
  const db = getFirestore();
  const dbLocation = 'todo';

  useEffect(() => {
    // Load completed tasks when the user is logged in
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        loadCompletedTasks(user.uid);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [auth]);

  // Load completed tasks
  const loadCompletedTasks = async (userId: string) => {
    try {
      // Get all completed tasks
      const q = query(collection(db, dbLocation), where('userId', '==', userId), where('completed', '==', true));
      const querySnapshot = await getDocs(q);

      const tasks: Task[] = [];
      querySnapshot.forEach((doc) => {
        tasks.push({ ...doc.data(), id: doc.id } as Task);
      });

      setCompletedTasks(tasks);
    } catch (error) {
      console.error('Error loading completed tasks:', error);
    }
  };

  // Toggle back to the previous page
  const toggleBack = () => {
    history.push('/profile');
  };

  const handleDoneButtonClick = () => {
    // Save the user input to the localStorage or send it to your server
    // For simplicity, I'm using localStorage here
    localStorage.setItem('userInput', userInput);

    // Display a toast message
    setToastMessage('Report saved successfully!');
  };

  return (
    <IonContent>
      <IonToolbar>
        <IonButtons slot="start">
          <IonButton fill="clear" color="primary" onClick={toggleBack}>
            <IonIcon icon={chevronBackOutline} slot="icon-only"></IonIcon>
          </IonButton>
        </IonButtons>
        <IonTitle className="ion-title" style={{ marginRight: '60px' }}>
          Check-Mate
        </IonTitle>
      </IonToolbar>
      <IonCard style={{ padding: '16px' }}>
        <h2 style={{ textAlign: 'center', color: 'black' }}>Here's your weekly report!</h2>
        <h2 style={{ marginLeft: '27px', color: 'black' }}>Completed:</h2>
        <ul style={{ fontSize: '16px', color: 'black' }}>
          {completedTasks.map((task, index) => (
            <li key={index}>
              {`${task.text} (${task.completed ? 'completed' : 'deleted'} on ${task.date})`}
            </li>
          ))}
        </ul>
        <IonCard style={{ marginTop: '16px', position: 'relative' }}>
          <IonTextarea
            style={{
              border: '1px solid #ccc',
              borderRadius: '8px',
              padding: '8px',
              width: '100%',
              color: 'black',
            }}
            placeholder="How was your week?"
            value={userInput}
            onIonChange={(e) => setUserInput(e.detail.value || '')}
          />
          <IonButton
            color="primary"
            onClick={handleDoneButtonClick}
            style={{
              position: 'absolute',
              bottom: '15px',
              right: '8px',
            }}
          >
            <IonIcon icon={checkmarkOutline} slot="start" />
            Done
          </IonButton>
        </IonCard>
      </IonCard>
      <IonToast
        isOpen={!!toastMessage}
        message={toastMessage || ''}
        duration={2000}
        onDidDismiss={() => setToastMessage(null)}
      />
    </IonContent>
  );
};

export default Report;
