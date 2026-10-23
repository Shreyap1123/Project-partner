import React from 'react';

export const StatusBadge = ({ status }) => {
  if (!status) return null;

  let badgeClass = 'badge-indigo';
  let label = status;

  switch (status) {
    case 'RECRUITING':
      badgeClass = 'badge-cyan';
      label = 'Recruiting';
      break;
    case 'IN_PROGRESS':
      badgeClass = 'badge-warning';
      label = 'In Progress';
      break;
    case 'COMPLETED':
      badgeClass = 'badge-success';
      label = 'Completed';
      break;
    case 'ARCHIVED':
      badgeClass = 'badge-danger';
      label = 'Archived';
      break;
    case 'PENDING':
      badgeClass = 'badge-warning';
      label = 'Pending';
      break;
    case 'ACCEPTED':
      badgeClass = 'badge-success';
      label = 'Accepted';
      break;
    case 'REJECTED':
      badgeClass = 'badge-danger';
      label = 'Rejected';
      break;
    case 'CANCELLED':
      badgeClass = 'badge-indigo';
      label = 'Cancelled';
      break;
    case 'URGENT':
      badgeClass = 'badge-danger';
      label = 'Urgent';
      break;
    case 'HIGH':
      badgeClass = 'badge-warning';
      label = 'High';
      break;
    case 'MEDIUM':
      badgeClass = 'badge-indigo';
      label = 'Medium';
      break;
    case 'LOW':
      badgeClass = 'badge-cyan';
      label = 'Low';
      break;
    default:
      label = status.replace('_', ' ');
  }

  return (
    <span className={`badge ${badgeClass}`}>
      {label}
    </span>
  );
};
