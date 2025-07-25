import React from 'react';

const PointsHistory = ({ history }) => {
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getPointsColor = (points) => {
    if (points >= 8) return 'points-high';
    if (points >= 5) return 'points-medium';
    return 'points-low';
  };

  return (
    <div className="points-history">
      <h3>📊 Recent Claims</h3>
      {history.length === 0 ? (
        <div className="no-history">
          <p>No points claimed yet!</p>
          <p>Start claiming points to see the history.</p>
        </div>
      ) : (
        <div className="history-list">
          {history.slice(0, 20).map((entry, index) => (
            <div key={entry._id || index} className="history-item">
              <div className="history-user">
                <span className="user-avatar">👤</span>
                <span className="user-name">{entry.userName}</span>
              </div>
              
              <div className="history-points">
                <span className={`points-value ${getPointsColor(entry.pointsAwarded)}`}>
                  +{entry.pointsAwarded}
                </span>
              </div>
              
              <div className="history-time">
                {formatTimestamp(entry.timestamp)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PointsHistory;