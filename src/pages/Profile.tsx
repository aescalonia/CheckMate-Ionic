import React, { useEffect, useState, useRef } from 'react';
import {
  IonCard,
  IonCardContent,
  IonContent,
  IonPage,
  IonTitle,
  IonButton,
  IonItem,
  IonIcon,
  IonChip,
  IonText,
  IonLabel,
  IonGrid,
  IonRow,
  IonCol,
  IonActionSheet,
  IonPopover,
  IonHeader,
  IonToolbar,
  IonButtons,
} from '@ionic/react';
import {
  pencil,
  image,
  camera as cameraIcon,
  images as imagesIcon,
  createOutline as createOutlineIcon,
  menu,
  logOut,
  list
} from 'ionicons/icons';
import CameraComponent from '../components/CameraComponent';
import { useHistory } from 'react-router-dom';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const Profile: React.FC = () => {
  // User state
  const [user, setUser] = useState<{ name: string; photo: string | null }>({
    name: '',
    photo: null,
  });
  

  const [isHovered, setIsHovered] = useState(false);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const [isEditingPhoto, setIsEditingPhoto] = useState(false);
  const history = useHistory();
  const db = getFirestore();
  const auth = getAuth();

  // Edit photo functions
  const startEditingPhoto = () => {
    setIsEditingPhoto(true);
    openActionSheet();
  };

  // Cancel editing photo
  const cancelEditingPhoto = () => {
    setIsEditingPhoto(false);
    closeActionSheet();
  };

  // Confirm editing photo
  const confirmEditingPhoto = async () => {
    try {
      // Update user photo in the database
      const userEmail = localStorage.getItem('userEmail');
      const userDocRef = doc(db, 'profiles', userEmail?.split('@')[0] || '');

      await setDoc(userDocRef, { photo: user.photo }, { merge: true });
    } catch (error) {
      console.error('Error updating user photo:', error);
    } finally {
      setIsEditingPhoto(false);
      closeActionSheet();
    }
  };

  // Edit name function
  const editName = async () => {
    const newName = prompt('Enter new name', user.name);
    if (newName !== null) {
      setUser({ ...user, name: newName });

      try {
        // Update user name in the database
        const userEmail = localStorage.getItem('userEmail');
        const userDocRef = doc(db, 'profiles', userEmail?.split('@')[0] || '');

        await setDoc(userDocRef, { name: newName }, { merge: true });
      } catch (error) {
        console.error('Error updating user name:', error);
      }
    }
  };

  // Take photo from camera
  const takePhoto = async () => {
    try {
      if (videoRef.current && canvasRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });

        videoRef.current.srcObject = stream;
        cameraStreamRef.current = stream;

        const captureCanvas = canvasRef.current;
        captureCanvas.width = videoRef.current?.videoWidth || 0;
        captureCanvas.height = videoRef.current?.videoHeight || 0;
        const context = captureCanvas.getContext('2d');

        if (context) {
          context.drawImage(
            videoRef.current,
            0,
            0,
            captureCanvas.width,
            captureCanvas.height
          );

          setUser((prevUser) => ({
            ...prevUser,
            photo: null,
          }));

          // Stop the video stream
          if (cameraStreamRef.current) {
            cameraStreamRef.current.getTracks().forEach((track) => track.stop());
            cameraStreamRef.current = null;
          }

          setIsCameraActive(false);
        }
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setIsCameraActive(false);
    }
  };

  // Select photo from photo library
  const handleActionSheetButtonClick = async (index: number) => {
    try {
      if (index === 0) {
        setIsCameraActive(true);

        openActionSheet();
      } else if (index === 1) {
        // Open file selection dialog when the "Photo Library" option is clicked
        document.getElementById('file-input')?.click();
      }
    } catch (error) {
      console.error('Error handling action sheet button click:', error);
    } finally {
      closeActionSheet();
    }
  };

  // Handle camera capture
  const handleCameraCapture = (photo: string) => {
    setUser((prevUser) => ({
      ...prevUser,
      photo: photo,
    }));
    setIsCameraActive(false);
  };

  // Handle file input change
  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target?.result as string;
        setUser({ ...user, photo: base64String });
      };
      reader.readAsDataURL(files[0]);
    }
  };

  // Open Action Sheet
  const openActionSheet = () => {
    if (!isCameraActive) {
      setShowActionSheet(true);
    }
  };

  // Close Action Sheet
  const closeActionSheet = () => {
    setShowActionSheet(false);
  };

  // Toggle camera
  const toggleCamera = () => {
    // If the camera is disabled, stop the stream and hide the video
    if (!isCameraActive && cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
      videoRef.current && (videoRef.current.srcObject = null);
    }

    // Show Action Sheet if the camera is not active
    if (!isCameraActive) {
      openActionSheet();
    }
  };

  // Handle weekly report click
  const handleWeeklyReportClick = () => {
    // Navigate to the "report" page
    history.push('/report');
  };

  // Load user data from Firestore
  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    const userDocRef = doc(db, 'profiles', userEmail?.split('@')[0] || '');

    // Get user data from Firestore
    const getUserData = async () => {
      try {
        const userDocSnapshot = await getDoc(userDocRef);

        if (userDocSnapshot.exists()) {
          const userData = userDocSnapshot.data();
          setUser({
            name: userData?.name || '',
            photo: userData?.photo || null,
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    getUserData();
  }, [user.photo]);

  // Handle component unmount
  const [popoverState, setShowPopover] = useState<{
    showPopover: boolean;
    event: Event | undefined;
  }>({ showPopover: false, event: undefined });

  // Show popover
  const presentPopover = (event: React.MouseEvent) => {
    setShowPopover({ showPopover: true, event: event.nativeEvent });
  };

  // Dismiss popover
  const dismissPopover = () => {
    setShowPopover({ showPopover: false, event: undefined });
  };

  return (
    <IonPage>
      <IonPopover
        isOpen={popoverState.showPopover}
        event={popoverState.event}
        onDidDismiss={dismissPopover}
      >
        <IonItem routerLink="/todo" onClick={dismissPopover}>
            <IonIcon icon={list} slot="start" style={{ marginRight: '8px', color: "black" }}></IonIcon>To do List
          </IonItem>
          <IonItem routerLink="/home" onClick={dismissPopover}>
            <IonIcon icon={logOut} slot="start" style={{ marginRight: '8px', color: "black" }}></IonIcon>Logout
          </IonItem>
      </IonPopover>
      <IonHeader>
        <IonToolbar>
          <IonTitle className="ion-title" style={{ fontSize: '30px', marginRight: '50px' }}>
            Profile
          </IonTitle>
          <IonButtons slot="start">
            <IonButton
              fill="clear"
              color="primary"
              onClick={(e) => presentPopover(e)}
            >
              <IonIcon icon={menu} slot="icon-only"></IonIcon>
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonCard style={{ height: 'auto', minHeight: '300px' }}>
          <IonCardContent>
            <IonItem style={{ position: 'relative', textAlign: 'center' }}>
              <label
                onClick={() =>
                  isEditingPhoto ? confirmEditingPhoto() : startEditingPhoto()
                }
                style={{ cursor: 'pointer', width: '100%' }}
              >
                {user.photo ? (
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img
                      src={user.photo}
                      alt="User Photo"
                      style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                      }}
                    />
                    {isHovered && !isEditingPhoto && (
                      <IonIcon
                        icon={pencil}
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          fontSize: '24px',
                          color: 'white',
                          cursor: 'pointer',
                        }}
                        onClick={() => handleActionSheetButtonClick(0)}
                      />
                    )}
                    {isEditingPhoto && (
                      <IonIcon
                        icon={createOutlineIcon}
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          fontSize: '24px',
                          color: 'white',
                          cursor: 'pointer',
                        }}
                        onClick={cancelEditingPhoto}
                      />
                    )}
                  </div>
                ) : (
                  <>
                    {isCameraActive ? (
                      <CameraComponent
                        onPhotoCapture={handleCameraCapture}
                        onCancel={toggleCamera}
                      />
                    ) : (
                      <IonIcon
                        icon={image}
                        onClick={toggleCamera}
                        style={{ fontSize: '50px', color: 'gray', cursor: 'pointer' }}
                      />
                    )}
                  </>
                )}
              </label>
            </IonItem>

            <IonItem style={{ position: 'relative', textAlign: 'left' }}>
              {isHovered && (
                <IonChip
                  style={{
                    position: 'absolute',
                    top: '40%',
                    left: '80%',
                    transform: 'translate(-50%, -50%)',
                    fontSize: '12px',
                    backgroundColor: 'transparent',
                    color: 'gray',
                    zIndex: 1,
                  }}
                  onClick={editName}
                >
                  <IonText>Edit Name</IonText>
                </IonChip>
              )}
              <IonLabel>{user.name}</IonLabel>
              <IonIcon
                icon={pencil}
                slot="end"
                onClick={editName}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={{ zIndex: 0 }}
              />
            </IonItem>
            <IonGrid>
              <IonRow className="ion-justify-content-center">
                <IonCol size="12" size-sm="8" size-md="6" size-lg="4">
                  <IonButton
                    onClick={handleWeeklyReportClick}
                    expand="full"
                    style={{ marginTop: '90px' }}
                  >
                    {user.name}'s Weekly Report
                  </IonButton>
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonCardContent>
        </IonCard>
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        <input
          id="file-input"
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileInputChange}
        />

        <IonActionSheet
          isOpen={showActionSheet}
          onDidDismiss={closeActionSheet}
          buttons={[
            {
              text: 'Camera',
              icon: cameraIcon,
              handler: () => handleActionSheetButtonClick(0),
            },
            {
              text: 'Photo Library',
              icon: imagesIcon,
              handler: () => handleActionSheetButtonClick(1),
            },
            {
              text: 'Cancel',
              role: 'cancel',
              handler: () => handleActionSheetButtonClick(2),
            },
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default Profile;
