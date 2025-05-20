import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

function QRScanner() {
  const [roomId, setRoomId] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [duration, setDuration] = useState(null);
  const [step, setStep] = useState("scanStart"); // scanStart → scanEnd → complete

  const scannerRef = useRef(null);
  const scannerId = "qr-reader";

  useEffect(() => {
    const startScanner = async () => {
      const html5QrCode = new Html5Qrcode(scannerId);
      scannerRef.current = html5QrCode;

      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices.length === 0) throw new Error("No cameras found.");

        const cameraId = devices[0].id;

        await html5QrCode.start(
          cameraId,
          { fps: 10, qrbox: 250 },
          (decodedText) => {
            if (step === "scanStart") {
              setRoomId(decodedText);
              setStartTime(new Date());
              setStep("scanEnd");

              html5QrCode
                .stop()
                .then(() => console.log("Scanner stopped after start scan."))
                .catch((err) =>
                  console.warn("Stop error (ignored):", err.message)
                );
            } else if (step === "scanEnd" && decodedText === roomId) {
              const end = new Date();
              setEndTime(end);

              const durationInMinutes = Math.round(
                (end.getTime() - startTime.getTime()) / 60000
              );
              setDuration(durationInMinutes);
              setStep("complete");

              html5QrCode
                .stop()
                .then(() => console.log("Scanner stopped after end scan."))
                .catch((err) =>
                  console.warn("Stop error (ignored):", err.message)
                );
            }
          },
          (error) => {
            // optional: console.warn("Scan error:", error);
          }
        );
      } catch (err) {
        console.error("Camera init error:", err);
      }
    };

    if (step !== "complete") {
      startScanner();
    }

    return () => {
      const scanner = scannerRef.current;
      if (scanner && scanner._isScanning) {
        scanner
          .stop()
          .then(() => console.log("Scanner stopped on cleanup."))
          .catch((err) =>
            console.warn("Stop error (ignored on cleanup):", err.message)
          );
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
    <div style={{ padding: 30 }}>
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
          <div id={scannerId} style={{ width: "300px" }} />
        </>
      )}
    </div>
  );
}

export default QRScanner;
