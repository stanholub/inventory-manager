import { useEffect, useRef } from "react";
import QRCode from "qrcode";
import styles from "./QRCodeDisplay.module.css";

interface QRCodeDisplayProps {
  value: string;
  label: string;
}

export function QRCodeDisplay({ value, label }: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, value, { width: 240, margin: 2 });
    }
  }, [value]);

  const handlePrint = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html>
        <head><title>QR – ${label}</title>
        <style>
          body { margin: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; }
          img { width: 240px; height: 240px; }
          p { margin: 8px 0 0; font-size: 14px; }
        </style>
        </head>
        <body>
          <img src="${dataUrl}" />
          <p>${label}</p>
          <script>window.onload = () => { window.print(); window.close(); }<\/script>
        </body>
      </html>
    `);
    win.document.close();
  };

  return (
    <div className={styles.wrapper}>
      <canvas ref={canvasRef} className={styles.canvas} />
      <p className={styles.label}>{label}</p>
      <button className={styles.printBtn} onClick={handlePrint}>
        Print
      </button>
    </div>
  );
}
