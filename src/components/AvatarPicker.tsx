import { useState } from 'react';
import './AvatarPicker.css';

const AVATARS = [
  // Robots
  { id: 'robot-1', emoji: '🤖', label: 'Robot' },
  { id: 'robot-2', emoji: '🦾', label: 'Mechanická ruka' },
  // Animals
  { id: 'cat', emoji: '🐱', label: 'Kočka' },
  { id: 'dog', emoji: '🐶', label: 'Pes' },
  { id: 'fox', emoji: '🦊', label: 'Liška' },
  { id: 'panda', emoji: '🐼', label: 'Panda' },
  { id: 'koala', emoji: '🐨', label: 'Koala' },
  { id: 'lion', emoji: '🦁', label: 'Lev' },
  { id: 'tiger', emoji: '🐯', label: 'Tygr' },
  { id: 'bear', emoji: '🐻', label: 'Medvěd' },
  { id: 'rabbit', emoji: '🐰', label: 'Králík' },
  { id: 'owl', emoji: '🦉', label: 'Sova' },
  // Space & Fantasy
  { id: 'alien', emoji: '👽', label: 'Mimozemšťan' },
  { id: 'astronaut', emoji: '🧑‍🚀', label: 'Astronaut' },
  { id: 'dragon', emoji: '🐉', label: 'Drak' },
  { id: 'unicorn', emoji: '🦄', label: 'Jednorožec' },
  // Fun
  { id: 'ninja', emoji: '🥷', label: 'Ninja' },
  { id: 'wizard', emoji: '🧙', label: 'Čaroděj' },
  { id: 'superhero', emoji: '🦸', label: 'Superhrdina' },
  { id: 'ghost', emoji: '👻', label: 'Duch' },
];

interface AvatarPickerProps {
  currentAvatar: string | null;
  onSelect: (avatarId: string) => void;
  onClose: () => void;
}

export default function AvatarPicker({ currentAvatar, onSelect, onClose }: AvatarPickerProps) {
  const [selected, setSelected] = useState<string | null>(currentAvatar);

  const handleConfirm = () => {
    if (selected) {
      onSelect(selected);
    }
  };

  const getAvatarEmoji = (avatarId: string | null) => {
    const avatar = AVATARS.find(a => a.id === avatarId);
    return avatar?.emoji || '👤';
  };

  return (
    <div className="avatar-picker-overlay" onClick={onClose}>
      <div className="avatar-picker-modal" onClick={e => e.stopPropagation()}>
        <h2>Vyber si avatar</h2>
        <p className="avatar-picker-subtitle">Klikni na obrázek, který se ti líbí</p>

        <div className="avatar-picker-preview">
          <div className="avatar-preview-large">
            {getAvatarEmoji(selected)}
          </div>
          <span className="avatar-preview-label">
            {selected ? AVATARS.find(a => a.id === selected)?.label : 'Žádný avatar'}
          </span>
        </div>

        <div className="avatar-picker-grid">
          {AVATARS.map(avatar => (
            <button
              key={avatar.id}
              className={`avatar-option ${selected === avatar.id ? 'selected' : ''}`}
              onClick={() => setSelected(avatar.id)}
              title={avatar.label}
            >
              {avatar.emoji}
            </button>
          ))}
        </div>

        <div className="avatar-picker-actions">
          <button className="btn-secondary" onClick={onClose}>
            Zrušit
          </button>
          <button
            className="btn-primary"
            onClick={handleConfirm}
            disabled={!selected}
          >
            Potvrdit
          </button>
        </div>
      </div>
    </div>
  );
}

// Export helper to get avatar emoji by ID
export function getAvatarEmoji(avatarId: string | null): string {
  const avatar = AVATARS.find(a => a.id === avatarId);
  return avatar?.emoji || '👤';
}
