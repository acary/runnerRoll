import React, { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { storage, db } from '../firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc, collection, addDoc } from 'firebase/firestore';
import './PhotoUpload.css';

const PhotoUpload = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const { eventId, runnerName, eventData } = location.state || {};
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image size should be less than 5MB');
        return;
      }
      
      setSelectedImage(file);
      setError(null);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedImage) {
      setError('Please select an image first');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // Create a reference to the storage location
      const storageRef = ref(storage, `event-photos/${eventId}/${selectedImage.name}`);
      
      // Upload the image
      const snapshot = await uploadBytes(storageRef, selectedImage);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Add photo information to Firestore
      const photoDoc = await addDoc(collection(db, 'photos'), {
        eventId,
        imageUrl: downloadURL,
        fileName: selectedImage.name,
        uploadedAt: new Date().toISOString(),
        runnerName
      });

      // Update the event document with the photo reference
      await updateDoc(doc(db, 'events', eventId), {
        photoId: photoDoc.id,
        status: 'photo-uploaded'
      });

      // Navigate to next step (you can create a success page or preview page)
      navigate(`/event/${eventId}`, { 
        state: { 
          eventId,
          photoId: photoDoc.id,
          runnerName,
          eventData,
          imageUrl: downloadURL
        } 
      });

    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="photo-upload-container">
      <header className="photo-upload-header">
        <h1>Upload Race Photo</h1>
        <p>Add a photo of {runnerName}'s achievement</p>
      </header>

      <div className="upload-section">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageSelect}
          accept="image/*"
          className="hidden-input"
        />

        <div 
          className="upload-area"
          onClick={triggerFileInput}
        >
          {previewUrl ? (
            <div className="image-preview">
              <img src={previewUrl} alt="Selected" />
            </div>
          ) : (
            <div className="upload-prompt">
              <i className="fas fa-camera"></i>
              <p>Tap to select a photo</p>
              <span>Maximum size: 5MB</span>
            </div>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="button-container">
          {previewUrl && (
            <button 
              className="change-photo-button" 
              onClick={triggerFileInput}
              disabled={isUploading}
            >
              Change Photo
            </button>
          )}
          <button
            className="upload-button"
            onClick={handleUpload}
            disabled={!selectedImage || isUploading}
          >
            {isUploading ? 'Uploading...' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhotoUpload; 