// src/UploadPage.js

import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { db } from "./firebase";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, Timestamp } from "firebase/firestore";

function UploadPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const { roomId, startTime, endTime, duration } = state || {};
  const [bedPhoto, setBedPhoto] = useState(null);
  const [bathroomPhoto, setBathroomPhoto] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async () => {
    if (!bedPhoto || !bathroomPhoto) {
      alert("Please upload both photos.");
      return;
    }

    setUploading(true);
    const storage = getStorage();

    try {
      const timestamp = Date.now();

      const bedRef = ref(storage, `photos/${roomId}_bed_${timestamp}`);
      const bathroomRef = ref(storage, `photos/${roomId}_bathroom_${timestamp}`);

      await uploadBytes(bedRef, bedPhoto);
      await uploadBytes(bathroomRef, bathroomPhoto);

      const bedURL = await getDownloadURL(bedRef);
      const bathroomURL = await getDownloadURL(bathroomRef);

      // Save photo links to Firestore
      await addDoc(collection(db, "cleaning_photos"), {
        room_id: roomId,
        bed_photo_url: bedURL,
        bathroom_photo_url: bathroomURL,
        duration_minutes: duration,
        start_time: Timestamp.fromDate(new Date(startTime)),
        end_time: Timestamp.fromDate(new Date(endTime)),
        created_at: Timestamp.now(),
      });

      alert("✅ Photos uploaded successfully.");
      navigate("/"); // return to scanner or home

    } catch (err) {
      console.error("❌ Upload failed:", err);
      alert("Upload failed. Try again.");
    }

    setUploading(false);
  };

  return (
    <div className="scanner-wrapper">
      <h2>Upload Room Photos</h2>
      <p>Room: {roomId}</p>
      <p>Cleaning Duration: {duration} minutes</p>

      <label>Bed Photo:</label>
      <input type="file" accept="image/*" onChange={(e) => setBedPhoto(e.target.files[0])} />

      <label>Bathroom Photo:</label>
      <input type="file" accept="image/*" onChange={(e) => setBathroomPhoto(e.target.files[0])} />

      <br /><br />
      <button onClick={handleSubmit} disabled={uploading}>
        {uploading ? "Uploading..." : "Upload Photos"}
      </button>
    </div>
  );
}

export default UploadPage;
