import { useState } from 'react';

import type { CopyPart } from '../../types/CopyPart';
import type { Condition } from '../../types/condition';
import type { Platform } from '../../types/platform';
import type { Game } from '../../types/game';

type FormState = {
  title: string;
  game_base_id: number;
  platform_id: number;
  region: string;
  purchase_price: number;
  purchase_date: string;
  notes: string;
};

type GameCopyFormProps = {
  conditions: Condition[];
  platforms: Platform[];
  games: Game[];
  onSubmit: (data: FormData) => Promise<void>;
};

export default function GameCopy({
  conditions,
  platforms,
  games,
  onSubmit,
}: GameCopyFormProps) {
  const [form, setForm] = useState<FormState>({
    title: '',
    game_base_id: 0,
    platform_id: 0,
    region: '',
    purchase_price: 0,
    purchase_date: '',
    notes: '',
  });

  const [parts, setParts] = useState<CopyPart[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setForm(prev => ({
        ...prev,
        [name]: ['game_base_id', 'platform_id', 'purchase_price'].includes(name)
        ? Number(value)
        : value,
    }));
    };

  const addPart = () => {
    setParts(prev => [
        ...prev,
        {
        type: '',
        condition: conditions[0], 
        notes: ''
        }
    ]);
    };

  const removePart = (index: number) => {
    setParts(prev => prev.filter((_, i) => i !== index));
  };

    const updatePart = (
        index: number,
        field: keyof CopyPart,
        value: any
    ) => {
    setParts(prev => {
        const updated = [...prev];
        updated[index] = {
        ...updated[index],
        [field]: value
        };
        return updated;
    });
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, String(value));
    });
    
    parts.forEach((part, index) => {
    formData.append(`parts[${index}][type]`, part.type);
    formData.append(`parts[${index}][condition_id]`, String(part.condition.id));

    if (part.notes) {
        formData.append(`parts[${index}][notes]`, part.notes);
    }
    });

    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="ui-form">
      <div className="ui-form-header">New Game Copy</div>

      <input
        className="ui-input"
        name="title"
        placeholder="Title"
        value={form.title}
        onChange={handleChange}
      />

      <select
        className="ui-input"
        name="game_base_id"
        value={form.game_base_id}
        onChange={handleChange}
      >
        <option value={0} selected>Select Game</option>
        {games.map(g => (
          <option key={g.id} value={g.id}>
            {g.title}
          </option>
        ))}
      </select>

      <select
        className="ui-input"
        name="platform_id"
        value={form.platform_id}
        onChange={handleChange}
      >
        <option value={0} selected>Select Platform</option>
        {platforms.map(p => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      <input
        className="ui-input"
        name="region"
        placeholder="Region"
        value={form.region}
        onChange={handleChange}
      />

      <input
        className="ui-input"
        name="purchase_price"
        type="number"
        placeholder="Purchase Price"
        value={form.purchase_price}
        onChange={handleChange}
      />

      <input
        className="ui-input"
        name="purchase_date"
        type="date"
        value={form.purchase_date}
        onChange={handleChange}
      />

      <input
        className="ui-input"
        name="notes"
        placeholder="Notes"
        value={form.notes}
        onChange={handleChange}
      />

      <hr />

      <div className="ui-form-header">Parts</div>

      {parts.map((part, index) => (
        <div key={index} style={{ marginBottom: 10 }}>
          <input
            className="ui-input"
            placeholder="Type (disc, case...)"
            value={part.type}
            onChange={e => updatePart(index, 'type', e.target.value)}
          />

          <select
            className="ui-input"
            value={part.condition.id}
            onChange={e => {
                const selected = conditions.find(
                c => c.id === Number(e.target.value)
                );

                if (!selected) return;

                updatePart(index, 'condition', selected);
            }}
            >
            {conditions.map(c => (
                <option key={c.id} value={c.id}>
                {c.name}
                </option>
            ))}
            </select>

          <input
            className="ui-input"
            placeholder="Notes"
            value={part.notes}
            onChange={e => updatePart(index, 'notes', e.target.value)}
          />

          <button type="button" onClick={() => removePart(index)}>
            Remove
          </button>
        </div>
      ))}

      <button type="button" onClick={addPart}>
        Add Part
      </button>

      <button className="cybr-btn" type="submit">
        Submit
      </button>
    </form>
  );
}