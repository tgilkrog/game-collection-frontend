import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import type { IScannerControls } from '@zxing/browser';
import { BarcodeFormat, DecodeHintType } from '@zxing/library';
import styles from './BarcodeScanner.module.css';

type Props = {
  onDecoded: (barcode: string) => void;
  onCancel: () => void;
};

export default function BarcodeScanner({ onDecoded, onCancel }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.UPC_A,
      BarcodeFormat.UPC_E,
      BarcodeFormat.EAN_13,
      BarcodeFormat.EAN_8,
    ]);
    const reader = new BrowserMultiFormatReader(hints);
    let controls: IScannerControls | null = null;
    let cancelled = false;

    reader
      .decodeFromVideoDevice(undefined, videoRef.current ?? undefined, (result, err) => {
        if (result && !cancelled) {
          cancelled = true;
          controls?.stop();
          onDecoded(result.getText());
        }
        // NotFoundException fires continuously while no barcode is in frame — ignore it.
        if (err && err.name !== 'NotFoundException' && !cancelled) {
          setError('COULD NOT ACCESS CAMERA. TRY AGAIN OR SEARCH MANUALLY.');
        }
      })
      .then(c => {
        controls = c;
        if (cancelled) controls.stop();
      })
      .catch(() => {
        setError('CAMERA ACCESS DENIED OR UNAVAILABLE. SEARCH MANUALLY BELOW.');
      });

    return () => {
      cancelled = true;
      controls?.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <div className={styles.error_box}>
        <div className={styles.error_text}>{error}</div>
        <button type="button" className={styles.cancel_btn} onClick={onCancel}>
          × CANCEL SCAN
        </button>
      </div>
    );
  }

  return (
    <div className={styles.scanner}>
      <video ref={videoRef} className={styles.video} muted playsInline />
      <div className={styles.scan_line} />
      <button type="button" className={styles.cancel_btn} onClick={onCancel}>
        × CANCEL SCAN
      </button>
    </div>
  );
}
