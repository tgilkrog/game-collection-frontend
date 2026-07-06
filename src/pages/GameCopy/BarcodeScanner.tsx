import { useEffect, useRef, useState } from 'react';
import { readBarcodes } from 'zxing-wasm/reader';
import type { ReaderOptions } from 'zxing-wasm/reader';
import styles from './BarcodeScanner.module.css';

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
    let imageCapture: ImageCapture | null = null;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    // ImageCapture.takePhoto() triggers the camera's real still-photo pipeline (full
    // sensor resolution, proper focus-lock-then-shutter) instead of a raw video frame —
    // the same quality boost as the manual "take a photo" button, but automatic and without
    // leaving the page. Falls back to grabbing a plain video frame where it's unsupported
    // (notably iOS Safari) or if a given capture attempt fails (camera briefly busy).
    async function grabInput(): Promise<Blob | ImageData | null> {
      if (imageCapture) {
        try {
          return await imageCapture.takePhoto();
        } catch {
          // fall through to the video-frame method for this attempt
        }
      }
      const video = videoRef.current;
      if (!video || !ctx || video.readyState < video.HAVE_CURRENT_DATA) return null;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);
      return ctx.getImageData(0, 0, canvas.width, canvas.height);
    }

    async function tick() {
      if (cancelled) return;
      const input = await grabInput();
      if (!input) {
        timeoutId = setTimeout(tick, SCAN_INTERVAL_MS);
        return;
      }

      try {
        const results = await readBarcodes(input, READER_OPTIONS);
        if (!cancelled && results.length > 0) {
          cancelled = true;
          onDecoded(results[0].text);
          return;
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
        const [track] = stream.getVideoTracks();
        if (typeof ImageCapture !== 'undefined' && track) {
          try {
            imageCapture = new ImageCapture(track);
          } catch {
            imageCapture = null;
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
