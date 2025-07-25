import React from 'react';

const Leaderboard = ({ users }) => {
  const getRankEmoji = (rank) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '🏅';
    }
  };

  const getRankClass = (rank) => {
    switch (rank) {
      case 1: return 'rank-gold';
      case 2: return 'rank-silver';
      case 3: return 'rank-bronze';
      default: return 'rank-default';
    }
  };

  return (
    <div className="leaderboard">
      <h3>🏆 Leaderboard</h3>
      {users.length === 0 ? (
        <div className="loading">Loading leaderboard...</div>
      ) : (
        <div className="leaderboard-list">
          {users.map((user, index) => (
            <div 
              key={user._id} 
              className={`leaderboard-item ${getRankClass(user.rank)}`}
            >
              <div className="rank-section">
                <span className="rank-emoji">{getRankEmoji(user.rank)}</span>
                <span className="rank-number">#{user.rank}</span>
              </div>
              
              <div className="user-info">
                <div className="user-name">{user.name}</div>
                <div className="user-points">{user.totalPoints} points</div>
              </div>
              
              <div className="points-display">
                <span className="points-badge">{user.totalPoints}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Leaderboard;