import React from 'react';

const UserSelection = ({ users, selectedUser, setSelectedUser, onClaimPoints, loading }) => {
  return (
    <div className="user-selection">
      <h3>Select User</h3>
      <div className="selection-container">
        <select 
          value={selectedUser} 
          onChange={(e) => setSelectedUser(e.target.value)}
          className="user-dropdown"
        >
          <option value="">-- Select a user --</option>
          {users.map(user => (
            <option key={user._id} value={user._id}>
              {user.name} ({user.totalPoints} points)
            </option>
          ))}
        </select>
        
        <button 
          onClick={onClaimPoints}
          disabled={!selectedUser || loading}
          className="claim-button"
        >
          {loading ? 'Claiming...' : '🎲 Claim Points'}
        </button>
      </div>
      
      <div className="selection-info">
        <p>Selected user will receive 1-10 random points</p>
      </div>
    </div>
  );
};

export default UserSelection;