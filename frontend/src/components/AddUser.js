import React, { useState } from 'react';

const AddUser = ({ onAddUser }) => {
  const [userName, setUserName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userName.trim()) {
      alert('Please enter a user name');
      return;
    }

    setIsAdding(true);
    try {
      await onAddUser(userName.trim());
      setUserName('');
      alert('User added successfully!');
    } catch (error) {
      console.error('Error adding user:', error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="add-user">
      <h3>Add New User</h3>
      <form onSubmit={handleSubmit} className="add-user-form">
        <div className="input-group">
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Enter user name..."
            className="user-input"
            disabled={isAdding}
            maxLength={30}
          />
          <button 
            type="submit" 
            disabled={isAdding || !userName.trim()}
            className="add-button"
          >
            {isAdding ? 'Adding...' : '➕ Add User'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddUser;