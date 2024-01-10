import React, { useState, useEffect, useRef } from 'react';
import { IonButton } from '@ionic/react';

const CameraComponent: React.FC<{ onPhotoCapture: (photo: string) => void; onCancel: () => void }> = ({ onPhotoCapture, onCancel }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Enable the camera stream and set it as the video element source
    const enableCamera = async () => {
      try {
        const userMedia = await navigator.mediaDevices.getUserMedia({ video: true });

        setStream(userMedia);

        if (videoRef.current) {
          videoRef.current.srcObject = userMedia;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
      }
    };

    enableCamera();

    // Cleanup function to stop the camera stream when the component unmounts
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Capture a photo from the video stream
  const handleCapture = () => {
    if (videoRef.current) {
      const captureCanvas = document.createElement('canvas');
      captureCanvas.width = videoRef.current.videoWidth;
      captureCanvas.height = videoRef.current.videoHeight;
      const context = captureCanvas.getContext('2d');

      if (context) {
        context.drawImage(videoRef.current, 0, 0, captureCanvas.width, captureCanvas.height);
        const photoUrl = captureCanvas.toDataURL('image/jpeg');
        onPhotoCapture(photoUrl);
      }
    }
  };

  return (
    <div>
      {stream ? (
        <div>
          <video ref={videoRef} style={{ width: '100%', height: 'auto' }} autoPlay playsInline />
          <IonButton expand="full" onClick={handleCapture} style={{ marginTop: '10px' }}>
            Take Photo
          </IonButton>
          <IonButton expand="full" color="danger" onClick={onCancel} style={{ marginTop: '5px' }}>
            Cancel
          </IonButton>
        </div>
      ) : (
        <p>Access to camera is not available.</p>
      )}
    </div>
  );
};

export default CameraComponent;
