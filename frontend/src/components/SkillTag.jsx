import React from 'react';

export const SkillTag = ({ name, proficiency, onRemove }) => {
  const getProficiencyColor = (level) => {
    switch (level) {
      case 'EXPERT': return '#ec4899';
      case 'ADVANCED': return '#8b5cf6';
      case 'INTERMEDIATE': return '#6366f1';
      case 'BEGINNER': return '#06b6d4';
      default: return 'var(--text-muted)';
    }
  };

  const color = getProficiencyColor(proficiency);

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.4rem',
      background: 'var(--bg-tertiary)',
      border: '1px solid var(--border-color)',
      padding: '0.3rem 0.65rem',
      borderRadius: 'var(--radius-full)',
      fontSize: '0.8rem',
      fontWeight: '600',
      color: 'var(--text-primary)',
      transition: 'all 0.15s ease'
    }}>
      {proficiency && (
        <span style={{
          width: '7px',
          height: '7px',
          borderRadius: '50%',
          backgroundColor: color,
          display: 'inline-block'
        }} title={`Proficiency: ${proficiency}`} />
      )}
      <span>{name}</span>
      {proficiency && (
        <span style={{ fontSize: '0.68rem', color: color, fontWeight: '700' }}>
          {proficiency.slice(0, 3)}
        </span>
      )}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onRemove();
          }}
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            color: '#ef4444',
            cursor: 'pointer',
            padding: '0 4px',
            borderRadius: '50%',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: '0.35rem',
            fontSize: '0.85rem',
            lineHeight: 1,
            width: '18px',
            height: '18px',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#ef4444';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
            e.currentTarget.style.color = '#ef4444';
          }}
          title="Remove skill"
        >
          ×
        </button>
      )}
    </span>
  );
};
