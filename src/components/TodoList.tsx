import React, { useEffect, useState } from 'react';
import {
  IonContent,
  IonPage,
  IonList,
  IonItemSliding,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonDatetime,
  IonItemOptions,
  IonItemOption,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
} from '@ionic/react';
import { send } from 'ionicons/icons';
import { DateTime } from 'luxon';
import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  writeBatch,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import '../firebaseConfig';

// Interface for the Task object
interface Task {
  id: string;
  text: string;
  completed: boolean;
  date: string;
  userId: string;
}

// Interface for the TodoList component props
interface TodoListProps {
  user: User;
}

const TodoList: React.FC<TodoListProps> = ({ user }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const db = getFirestore();
  const dbLocation = 'todo';

  useEffect(() => {
    // Set the selected date to the current date
    const now = DateTime.local().setZone('Asia/Jakarta');
    setSelectedDate(now.toISO() || '');

    // Update the selected date every minute
    const updateCurrentTime = () => {
      const currentTime = DateTime.local().setZone('Asia/Jakarta');
      setSelectedDate(currentTime.toISO() || '');
    };

    const interval = setInterval(updateCurrentTime, 60000);

    // Load tasks when the user is logged in
    const unsubscribe = onAuthStateChanged(getAuth(), (user) => {
      if (user) {
        loadTasks();
      }
    });

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, []);

  // Load tasks from Firestore
  const loadTasks = async () => {
    try {
      if (!user) {
        console.error('User not logged in');
        return;
      }

      const q = query(collection(db, dbLocation), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);

      const loadedTasks: Task[] = [];
      querySnapshot.forEach((doc) => {
        loadedTasks.push({ id: doc.id, ...doc.data() } as Task);
      });

      setTasks(loadedTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  // Add a new task to Firestore
  const addTask = async () => {
    try {
      if (!user) {
        console.error('User not logged in');
        return;
      }

      const taskDate = selectedDate;

      const currentNewTask = newTask;

      const newTaskItem: Task = { id: '', text: currentNewTask, completed: false, date: taskDate, userId: user.uid };

      const docRef = await addDoc(collection(db, dbLocation), newTaskItem);
      console.log('Task added with ID: ', docRef.id);

      setTasks([...tasks, { ...newTaskItem, id: docRef.id }]);
      setNewTask('');
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  // Update the new task when the input changes
  const handleInputChange = (event: CustomEvent) => {
    setNewTask(event.detail.value ?? '');
  };

  // Update the selected date when the date picker changes
  const handleDateChange = (event: CustomEvent) => {
    const selectedDateTime = event.detail.value || '';
    setSelectedDate(selectedDateTime);
  };

  // Add a new task when the user presses enter in the input
  const handleInputKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      addTask();
    }
  };

  // Delete a task from Firestore
  const deleteTask = async (index: number) => {
    if (!user) {
      console.error('User not logged in');
      return;
    }

    const taskToDelete = tasks[index];

    if (taskToDelete.userId !== user.uid) {
      console.error('Unauthorized access to delete task');
      return;
    }

    const updatedTasks = [...tasks];
    updatedTasks.splice(index, 1);
    setTasks(updatedTasks);

    try {
      await deleteDoc(doc(collection(db, dbLocation), taskToDelete.id));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  // Toggle a task's completed status in Firestore
  const toggleTask = async (index: number) => {
    if (!user) {
      console.error('User not logged in');
      return;
    }

    const taskToUpdate = tasks[index];

    if (taskToUpdate.userId !== user.uid) {
      console.error('Unauthorized access to toggle task');
      return;
    }

    const taskDocRef = doc(collection(db, dbLocation), taskToUpdate.id);

    try {
      await updateDoc(taskDocRef, {
        completed: !taskToUpdate.completed,
        text: newTask,
      });

      setTasks((prevTasks) => {
        return prevTasks.map((task) =>
          task.id === taskToUpdate.id ? { ...task, completed: !task.completed } : task
        );
      });
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  // Delete all completed tasks from Firestore
  const deleteCompletedTasks = async () => {
    const completedTasks = tasks.filter((task) => task.completed);
    const updatedTasks = tasks.filter((task) => !task.completed);
    setTasks(updatedTasks);

    try {
      const batch = writeBatch(db);
      completedTasks.forEach((task) => {
        const taskDocRef = doc(collection(db, dbLocation), task.id);
        batch.delete(taskDocRef);
      });

      await batch.commit();
    } catch (error) {
      console.error('Error deleting completed tasks:', error);
    }
  };

  // Toggle all tasks' completed status in Firestore
  const toggleSelectAll = () => {
    const allCompleted = tasks.every((task) => task.completed);
    const updatedTasks = tasks.map((task) => ({
      ...task,
      completed: !allCompleted,
    }));
    setTasks(updatedTasks);
  };

  // Toggle all tasks' completed status in Firestore
  const toggleAllDone = () => {
    const allCompleted = tasks.every((task) => task.completed);
    const updatedTasks = tasks.map((task) => ({
      ...task,
      completed: !allCompleted,
    }));
    setTasks(updatedTasks);
  };

  return (
    <IonPage>
      <IonContent>
        <IonList>
        <IonItem>
            <IonDatetime
              className="ion-datetime"
              display-format="MM/YYYY"
              value={selectedDate}
              locale="id-ID"
              onIonChange={handleDateChange}
              style={{ width: '100%' }}
            ></IonDatetime>
          </IonItem>
          <IonItem>
            <IonInput
              value={newTask}
              onIonChange={handleInputChange}
              onKeyPress={handleInputKeyPress}
              placeholder="Add a new task"
            />
            <IonButton onClick={addTask} fill="clear">
              <IonIcon icon={send} slot="icon-only" />
            </IonButton>
          </IonItem>
          {tasks.map((task, index) => (
            <IonItemSliding key={index}>
              <IonItem
                detail={false}
                onClick={() => {
                  toggleTask(index);
                }}
              >
                <IonLabel
                  className={task.completed ? 'completed-task' : ''}
                  style={{ textDecoration: task.completed ? 'line-through' : 'none' }}
                >
                  <p className="task-text">{task.text}</p>
                  {task.date && (
                    <p className="task-date">
                      {DateTime.fromISO(task.date, { zone: 'Asia/Jakarta' }).toLocaleString(
                        DateTime.DATETIME_MED
                      )}
                    </p>
                  )}
                </IonLabel>
              </IonItem>
              <IonItemOptions side="end">
                <IonItemOption color="danger" onClick={() => deleteTask(index)}>
                  Delete
                </IonItemOption>
              </IonItemOptions>
            </IonItemSliding>
          ))}
        </IonList>
        <IonGrid>
          <IonRow>
            <IonCol className="ion-text-center">
              <IonButton
                expand="full"
                color={tasks.every((task) => task.completed) ? 'primary' : 'primary'}
                onClick={toggleAllDone}
              >
                {tasks.every((task) => task.completed) ? 'Oops! Not done yet' : 'All Done!'}
              </IonButton>
            </IonCol>
            <IonCol className="ion-text-center">
              <IonButton
                expand="full"
                color="danger"
                onClick={deleteCompletedTasks}
                disabled={tasks.filter((task) => task.completed).length === 0}
              >
                Delete All Completed
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default TodoList;
