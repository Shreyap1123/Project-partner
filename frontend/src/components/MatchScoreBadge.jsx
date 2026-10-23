import React from 'react';

export const MatchScoreBadge = ({ score, size = 'md' }) => {
  let colorClass = 'match-high';
  if (score < 70 && score >= 50) colorClass = 'match-med';
  if (score < 50) colorClass = 'match-fair';

  const dimension = size === 'sm' ? 44 : size === 'lg' ? 70 : 56;
  const fontSize = size === 'sm' ? '0.85rem' : size === 'lg' ? '1.35rem' : '1.05rem';

  return (
    <div
      className={`match-circle ${colorClass}`}
      style={{
        width: `${dimension}px`,
        height: `${dimension}px`,
        fontSize: fontSize,
      }}
      title={`${score}% Skill & Domain Compatibility Match`}
    >
      <span>{score}%</span>
      <span style={{ fontSize: '0.55rem', textTransform: 'uppercase', letterSpacing: '0.04em', lineHeight: 1, opacity: 0.85 }}>
        Match
      </span>
    </div>
  );
};
