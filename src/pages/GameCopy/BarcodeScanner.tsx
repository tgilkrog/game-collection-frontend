import { useEffect, useRef, useState } from 'react';
import { readBarcodes } from 'zxing-wasm/reader';
import type { ReaderOptions } from 'zxing-wasm/reader';
import styles from './BarcodeScanner.module.css';

// Not yet in TypeScript's bundled DOM lib. Minimal ambient typing for the W3C Shape
// Detection API's BarcodeDetector, matching the shape lib.dom.d.ts uses for ImageCapture.
declare global {
  interface DetectedBarcode {
    readonly rawValue: string;
    readonly format: string;
  }
  interface BarcodeDetectorOptions {
    formats?: string[];
  }
  interface BarcodeDetector {
    detect(image: ImageBitmapSource): Promise<DetectedBarcode[]>;
  }
  var BarcodeDetector: {
    prototype: BarcodeDetector;
    new (options?: BarcodeDetectorOptions): BarcodeDetector;
    getSupportedFormats(): Promise<string[]>;
  };
}

type Props = {
  onDecoded: (barcode: string) => void;
  onCancel: () => void;
};

const READER_OPTIONS: ReaderOptions = {
  formats: ['EAN13', 'EAN8', 'UPCA', 'UPCE'],
  maxNumberOfSymbols: 1,
};

const SCAN_INTERVAL_MS = 150;

export default function BarcodeScanner({ onDecoded, onCancel }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState('');
  const [photoError, setPhotoError] = useState('');
  const [decodingPhoto, setDecodingPhoto] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let stream: MediaStream | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let detector: BarcodeDetector | null = null;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    async function tick() {
      if (cancelled) return;
      const video = videoRef.current;
      if (!video || video.readyState < video.HAVE_CURRENT_DATA) {
        timeoutId = setTimeout(tick, SCAN_INTERVAL_MS);
        return;
      }

      try {
        if (detector) {
          // Native, OS/browser-accelerated detection running directly on the live <video>
          // element — no per-frame canvas copy or WASM data marshaling, so it stays fast.
          const detections = await detector.detect(video);
          if (!cancelled && detections.length > 0) {
            cancelled = true;
            onDecoded(detections[0].rawValue);
            return;
          }
        } else if (ctx) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const results = await readBarcodes(imageData, READER_OPTIONS);
          if (!cancelled && results.length > 0) {
            cancelled = true;
            onDecoded(results[0].text);
            return;
          }
        }
      } catch {
        // Transient decode failure on this frame — just retry on the next tick.
      }

      if (!cancelled) timeoutId = setTimeout(tick, SCAN_INTERVAL_MS);
    }

    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            // Non-standard but widely supported on mobile Chrome/Safari — barcodes need
            // close-focus, and the default stream from facingMode alone is often fixed-focus.
            advanced: [{ focusMode: 'continuous' } as unknown as MediaTrackConstraintSet],
          },
        });
        if (cancelled) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        if (typeof BarcodeDetector !== 'undefined') {
          try {
            detector = new BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e'] });
          } catch {
            detector = null;
          }
        }
        tick();
      } catch {
        setError('CAMERA ACCESS DENIED OR UNAVAILABLE. SEARCH MANUALLY BELOW.');
      }
    })();

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
      stream?.getTracks().forEach(t => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setPhotoError('');
    setDecodingPhoto(true);
    try {
      const results = await readBarcodes(file, READER_OPTIONS);
      if (results.length > 0) {
        onDecoded(results[0].text);
      } else {
        setPhotoError('NO BARCODE FOUND IN THAT PHOTO. TRY AGAIN OR SEARCH MANUALLY.');
      }
    } catch {
      setPhotoError('NO BARCODE FOUND IN THAT PHOTO. TRY AGAIN OR SEARCH MANUALLY.');
    } finally {
      setDecodingPhoto(false);
    }
  }

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
    <div>
      <div className={styles.scanner}>
        <video ref={videoRef} className={styles.video} muted playsInline />
        <div className={styles.scan_line} />
        <button type="button" className={styles.cancel_btn} onClick={onCancel}>
          × CANCEL SCAN
        </button>
      </div>
      <label className={styles.photo_label}>
        {decodingPhoto ? 'DECODING…' : '📸 OR TAKE A PHOTO INSTEAD'}
        <input
          className={styles.file_hidden}
          type="file"
          accept="image/*"
          capture="environment"
          disabled={decodingPhoto}
          onChange={handlePhotoChange}
        />
      </label>
      {photoError && <div className={styles.error_text}>{photoError}</div>}
    </div>
  );
}
