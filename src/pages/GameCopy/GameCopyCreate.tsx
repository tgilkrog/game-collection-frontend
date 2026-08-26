import { useState, useEffect, useRef } from 'react';
import { searchGame } from '../../api/games';
import { lookupBarcode } from '../../api/barcode';
import { useDebounce } from '../../hooks/useDebounce';
import BarcodeScanner from './BarcodeScanner';
import PartsInput from './PartsInput';
import type { GameSearchResult } from '../../types/game';
import { resolvePartsForSubmit } from '../../types/copypart';
import type { CopyPart } from '../../types/copypart';
import type { Condition } from '../../types/condition';
import type { Platform } from '../../types/platform';
import styles from './GameCopyCreate.module.css';

type FormState = {
  platform_id: number;
  title: string;
  region: string;
  purchase_price: number;
  purchase_date: string;
  notes: string;
};

type Props = {
  conditions: Condition[];
  platforms: Platform[];
  onSubmit: (data: FormData) => Promise<unknown>;
};

export default function GameCopyCreate({ conditions, platforms, onSubmit }: Props) {
  const [form, setForm] = useState<FormState>({
    platform_id: 0,
    title: '',
    region: '',
    purchase_price: 0,
    purchase_date: '',
    notes: '',
  });
  const [parts, setParts] = useState<CopyPart[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // game search
  const [gameQuery, setGameQuery] = useState('');
  const [gameResults, setGameResults] = useState<GameSearchResult[]>([]);
  const [selectedGame, setSelectedGame] = useState<GameSearchResult | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [scanMode, setScanMode] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debouncedGameQuery = useDebounce(gameQuery, 300);

  useEffect(() => {
    if (debouncedGameQuery.length < 2) { setGameResults([]); setSearchError(''); return; }
    const controller = new AbortController();
    (async () => {
      setSearching(true);
      try {
        const res = await searchGame(debouncedGameQuery, undefined, controller.signal);
        setGameResults(res.data);
        setSearchError('');
      } catch {
        if (controller.signal.aborted) return;
        setGameResults([]);
        setSearchError('SEARCH FAILED. CHECK CONNECTION AND RETRY.');
      } finally {
        if (!controller.signal.aborted) setSearching(false);
      }
    })();
    return () => controller.abort();
  }, [debouncedGameQuery]);

  function selectGame(g: GameSearchResult) {
    setSelectedGame(g);
    setGameQuery('');
    setGameResults([]);
  }

  function clearGame() {
    setSelectedGame(null);
    setGameQuery('');
    setGameResults([]);
  }

  async function handleDecoded(barcode: string) {
    setScanMode(false);
    setSearching(true);
    try {
      const { data } = await lookupBarcode(barcode);
      if (data.matched && data.result?.title) {
        setGameQuery(data.result.title);
      } else {
        setGameQuery('');
        setGameResults([]);
        setSearchError('NO MATCH FOR THIS BARCODE. SEARCH MANUALLY BELOW.');
      }
    } catch {
      setGameQuery('');
      setGameResults([]);
      setSearchError('BARCODE LOOKUP FAILED. SEARCH MANUALLY BELOW.');
    } finally {
      setSearching(false);
    }
  }

  const numericFields = new Set(['platform_id', 'purchase_price']);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: numericFields.has(name) ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));

    if (selectedGame) {
      if (selectedGame.source === 'local' && selectedGame.id) {
        fd.append('game_base_id', String(selectedGame.id));
      } else {
        fd.append('igdb_id', String(selectedGame.igdb_id));
      }
    }

    resolvePartsForSubmit(parts, conditions).forEach((part, i) => {
      fd.append(`parts[${i}][type]`, part.type);
      fd.append(`parts[${i}][condition_id]`, String(part.condition.id));
      if (part.notes) fd.append(`parts[${i}][notes]`, part.notes);
    });

    setSubmitting(true);
    try {
      await onSubmit(fd);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.form_title}>// NEW GAME COPY</div>

      {/* ── Game search ── */}
      <div className={styles.field} ref={searchRef}>
        <label className={styles.label}>Game</label>

        {selectedGame ? (
          <div className={styles.selected_game}>
            {selectedGame.cover_image && (
              <img src={selectedGame.cover_image} className={styles.selected_thumb} alt="" />
            )}
            <span className={styles.selected_title}>{selectedGame.title}</span>
            <span className={`${styles.source_badge} ${selectedGame.source === 'local' ? styles.badge_local : styles.badge_igdb}`}>
              {selectedGame.source}
            </span>
            <button type="button" className={styles.clear_btn} onClick={clearGame}>×</button>
          </div>
        ) : scanMode ? (
          <BarcodeScanner onDecoded={handleDecoded} onCancel={() => setScanMode(false)} />
        ) : (
          <>
            <input
              className={styles.input}
              placeholder="Search for a game…"
              value={gameQuery}
              onChange={e => setGameQuery(e.target.value)}
              autoComplete="off"
            />
            <button type="button" className={styles.scan_btn} onClick={() => setScanMode(true)}>
              📷 SCAN BARCODE
            </button>
          </>
        )}

        {gameResults.length > 0 && (
          <div className={styles.search_results}>
            {searching && <div className={styles.search_hint}>SEARCHING…</div>}
            {gameResults.map(g => (
              <button
                key={`${g.source}-${g.igdb_id}`}
                type="button"
                className={styles.result_item}
                onClick={() => selectGame(g)}
              >
                {g.cover_image && (
                  <img src={g.cover_image} className={styles.result_thumb} alt="" />
                )}
                <span className={styles.result_title}>{g.title}</span>
                {g.platforms && g.platforms.length > 0 && (
                  <span className={styles.result_platforms}>{g.platforms.join(' · ')}</span>
                )}
                <span className={`${styles.source_badge} ${g.source === 'local' ? styles.badge_local : styles.badge_igdb}`}>
                  {g.source}
                </span>
              </button>
            ))}
          </div>
        )}
        {gameQuery.length >= 2 && !searching && gameResults.length === 0 && !searchError && (
          <div className={styles.search_hint}>NO RESULTS</div>
        )}
        {searchError && <div className={styles.search_hint}>{searchError}</div>}
      </div>

      {/* Platform */}
      <div className={styles.field}>
        <label className={styles.label}>Platform</label>
        <select className={styles.select} name="platform_id" value={form.platform_id} onChange={handleChange}>
          <option value={0}>— select platform —</option>
          {platforms.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      {/* Title + Region */}
      <div className={styles.field_row}>
        <div className={styles.field}>
          <label className={styles.label}>Title / Label</label>
          <input className={styles.input} name="title" placeholder="e.g. PAL variant" value={form.title} onChange={handleChange} />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Region</label>
          <input className={styles.input} name="region" placeholder="e.g. EU, US" value={form.region} onChange={handleChange} />
        </div>
      </div>

      {/* Price + Date */}
      <div className={styles.field_row}>
        <div className={styles.field}>
          <label className={styles.label}>Purchase Price</label>
          <input className={styles.input} name="purchase_price" type="number" min="0" step="0.01" value={form.purchase_price} onChange={handleChange} />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Purchase Date</label>
          <input className={styles.input} name="purchase_date" type="date" value={form.purchase_date} onChange={handleChange} />
        </div>
      </div>

      {/* Notes */}
      <div className={styles.field}>
        <label className={styles.label}>Notes</label>
        <input className={styles.input} name="notes" placeholder="Optional notes" value={form.notes} onChange={handleChange} />
      </div>

      <PartsInput parts={parts} conditions={conditions} onChange={setParts} />

      <button type="submit" className={styles.submit_btn} disabled={submitting}>
        {submitting ? 'SAVING...' : 'CREATE COPY'}
      </button>
    </form>
  );
}
