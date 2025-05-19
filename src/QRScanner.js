/// src/QRScanner.js
import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

function QRScanner() {
  const [roomId, setRoomId] = useState("");
  const [scanned, setScanned] = useState(false);
  const scannerRef = useRef(null);
  const scannerId = "qr-reader";

  useEffect(() => {
    const initScanner = async () => {
      const html5QrCode = new Html5Qrcode(scannerId);
      scannerRef.current = html5QrCode;

      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          const cameraId = devices[0].id;

          await html5QrCode.start(
            cameraId,
            { fps: 10, qrbox: 250 },
            (decodedText) => {
              if (!scanned) {
                setRoomId(decodedText);
                setScanned(true);
                html5QrCode.stop().then(() => {
                  console.log("Scanner stopped.");
                }).catch((err) => {
                  console.warn("Stop error (ignored):", err.message);
                });
              }
            },
            (errorMessage) => {
              // optional: console.warn(`Scan error: ${errorMessage}`);
            }
          );
        }
      } catch (err) {
        console.error("Scanner error:", err);
      }
    };

    // Add a short delay to ensure the DOM is ready
    const timeout = setTimeout(initScanner, 500);

    return () => {
      clearTimeout(timeout);
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .catch(() => console.log("Scanner already stopped."));
      }
    };
  }, [scanned]);

  const resetScanner = () => {
    setRoomId("");
    setScanned(false);
  };

  return (
    <div style={{ padding: 30 }}>
      <h2>QR Code Scanner</h2>
      {!scanned ? (
        <div id={scannerId} style={{ width: "300px", marginBottom: "20px" }} />
      ) : (
        <div>
          <h3>Scanned Room ID: {roomId}</h3>
          <button onClick={resetScanner}>Scan Another</button>
        </div>
      )}
    </div>
  );
}

export default QRScanner;
