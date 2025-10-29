import React from 'react';

const StatusBadge = ({ status, type = 'default' }) => {
  const statusConfig = {
    active: { color: 'green', text: 'Active' },
    inactive: { color: 'gray', text: 'Inactive' },
    suspended: { color: 'red', text: 'Suspended' },
    pending: { color: 'yellow', text: 'Pending' },
    expired: { color: 'red', text: 'Expired' },
    revoked: { color: 'red', text: 'Revoked' },
    submitted: { color: 'blue', text: 'Submitted' },
    under_review: { color: 'yellow', text: 'Under Review' },
    resolved: { color: 'green', text: 'Resolved' },
    escalated: { color: 'purple', text: 'Escalated' },
    passed: { color: 'green', text: 'Passed' },
    failed: { color: 'red', text: 'Failed' },
    inconclusive: { color: 'yellow', text: 'Inconclusive' }
  };

  const config = statusConfig[status] || { color: 'gray', text: status };

  const colorClasses = {
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    blue: 'bg-blue-100 text-blue-800',
    purple: 'bg-purple-100 text-purple-800',
    gray: 'bg-gray-100 text-gray-800'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClasses[config.color]}`}>
      {config.text}
    </span>
  );
};

export default StatusBadge;
