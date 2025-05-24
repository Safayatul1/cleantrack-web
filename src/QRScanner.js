import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useNavigate } from "react-router-dom";

// Firebase
import { db } from "./firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";

function QRScanner() {
  const [roomId, setRoomId] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [duration, setDuration] = useState(null);
  const [step, setStep] = useState("scanStart");

  const scannerRef = useRef(null);
  const scannerId = "qr-reader";
  const navigate = useNavigate();

  useEffect(() => {
    const startScanner = async () => {
      // ✅ Clean up any previous scanner
      if (scannerRef.current && scannerRef.current._isScanning) {
        await scannerRef.current.stop().catch(() => {});
        await scannerRef.current.clear().catch(() => {});
      }

      const html5QrCode = new Html5Qrcode(scannerId);
      scannerRef.current = html5QrCode;

      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices.length === 0) throw new Error("No cameras found.");
        const cameraId = devices[0].id;

        await html5QrCode.start(
          cameraId,
          { fps: 10, qrbox: 250 },
          async (decodedText) => {
            if (step === "scanStart") {
              setRoomId(decodedText);
              const start = new Date();
              setStartTime(start);
              setStep("scanEnd");

              await html5QrCode.stop().catch(() => {});
              await html5QrCode.clear().catch(() => {});
              console.log("Scanner stopped after first scan.");
            } else if (step === "scanEnd" && decodedText === roomId) {
              const end = new Date();
              setEndTime(end);
              const durationInMinutes = Math.round(
                (end.getTime() - startTime.getTime()) / 60000
              );
              setDuration(durationInMinutes);
              setStep("complete");

              await html5QrCode.stop().catch(() => {});
              await html5QrCode.clear().catch(() => {});
              console.log("Scanner stopped after second scan.");

              // Save log to Firestore
              const log = {
                room_id: decodedText,
                employee_id: "hk_cynthia",
                start_time: Timestamp.fromDate(startTime),
                end_time: Timestamp.fromDate(end),
                duration_minutes: durationInMinutes,
                created_at: Timestamp.now(),
              };

              addDoc(collection(db, "cleaning_logs"), log)
                .then(() => console.log("✅ Cleaning log saved"))
                .catch((err) => console.error("❌ Save failed:", err));

              // Navigate to upload screen
              navigate("/upload", {
                state: {
                  roomId: decodedText,
                  startTime: start,
                  endTime: end,
                  duration: durationInMinutes,
                },
              });
            }
          },
          (error) => {
            // Optional error logging
          }
        );
      } catch (err) {
        console.error("Scanner init error:", err);
      }
    };

    if (step !== "complete") {
      startScanner();
    }

    return () => {
      if (scannerRef.current && scannerRef.current._isScanning) {
        scannerRef.current
          .stop()
          .then(() => scannerRef.current.clear())
          .catch(() => {});
      }
    };
  }, [step, roomId, startTime]);

  const reset = () => {
    setRoomId(null);
    setStartTime(null);
    setEndTime(null);
    setDuration(null);
    setStep("scanStart");
  };

  return (
    <div className="scanner-wrapper">
      <h2>Room Cleaning Tracker</h2>

      {step === "complete" ? (
        <div>
          <h3>Room: {roomId}</h3>
          <p>Start Time: {startTime.toLocaleTimeString()}</p>
          <p>End Time: {endTime.toLocaleTimeString()}</p>
          <p>Total Time: {duration} minute(s)</p>
          <button onClick={reset}>Start New Cleaning</button>
        </div>
      ) : (
        <>
          <p>
            {step === "scanStart"
              ? "Scan QR code to start cleaning"
              : "Scan the same QR code again to stop cleaning"}
          </p>
          <div id={scannerId} className="scanner-box" />
        </>
      )}
    </div>
  );
}

export default QRScanner;
