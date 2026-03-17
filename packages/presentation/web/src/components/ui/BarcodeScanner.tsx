import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import styles from "./BarcodeScanner.module.css";

interface BarcodeScannerProps {
  onDetected: (code: string) => void;
  onCancel: () => void;
}

export function BarcodeScanner({ onDetected, onCancel }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const reader = new BrowserMultiFormatReader();
    readerRef.current = reader;

    let stopped = false;

    reader
      .decodeFromVideoDevice(undefined, videoRef.current!, (result, err) => {
        if (stopped) return;
        if (result) {
          stopped = true;
          BrowserMultiFormatReader.releaseAllStreams();
          onDetected(result.getText());
        } else if (err && !(err.message?.includes("No MultiFormat"))) {
          // ignore "no barcode found" noise; surface real errors
        }
      })
      .catch((e) => {
        setError(String(e?.message ?? e));
      });

    return () => {
      stopped = true;
      BrowserMultiFormatReader.releaseAllStreams();
    };
  }, [onDetected]);

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <p className={styles.hint}>Point the camera at a barcode or QR code</p>
        {error ? (
          <p className={styles.error}>{error}</p>
        ) : (
          <video ref={videoRef} className={styles.video} autoPlay muted playsInline />
        )}
        <button className={styles.cancelBtn} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
