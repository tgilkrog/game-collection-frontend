import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import type { IScannerControls } from '@zxing/browser';
import {
  BarcodeFormat,
  ChecksumException,
  DecodeHintType,
  FormatException,
  NotFoundException,
} from '@zxing/library';
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
    // Default decoding is tuned for speed over accuracy — tries fewer scan angles/passes
    // per frame. Dedicated scanner apps always run the thorough mode; match that here.
    hints.set(DecodeHintType.TRY_HARDER, true);
    const reader = new BrowserMultiFormatReader(hints);
    let controls: IScannerControls | null = null;
    let cancelled = false;

    const constraints: MediaStreamConstraints = {
      video: {
        facingMode: 'environment',
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        // Non-standard but widely supported on mobile Chrome/Safari — barcodes need
        // close-focus, and the default stream from facingMode alone is often fixed-focus.
        advanced: [{ focusMode: 'continuous' } as unknown as MediaTrackConstraintSet],
      },
    };

    reader
      .decodeFromConstraints(constraints, videoRef.current ?? undefined, (result, err) => {
        if (result && !cancelled) {
          cancelled = true;
          controls?.stop();
          onDecoded(result.getText());
        }
        // These fire continuously on every unsuccessful decode attempt while scanning
        // (no barcode in frame, blurry/partial read, still focusing) — all expected, not errors.
        const isExpectedMiss =
          err instanceof NotFoundException ||
          err instanceof ChecksumException ||
          err instanceof FormatException;
        if (err && !isExpectedMiss && !cancelled) {
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
