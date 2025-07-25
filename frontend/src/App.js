import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import UserSelection from './components/UserSelection';
import Leaderboard from './components/Leaderboard';
import PointsHistory from './components/PointsHistory';
import AddUser from './components/AddUser';
import './App.css';

const API_BASE_URL = 'http://localhost:5000/api';

function App() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [pointsHistory, setPointsHistory] = useState([]);
  const [lastPointsClaimed, setLastPointsClaimed] = useState(null);
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    // Listen for real-time updates
    newSocket.on('pointsClaimed', (data) => {
      setUsers(data.users);
      setLastPointsClaimed({
        userName: data.user.name,
        points: data.pointsAwarded
      });
      fetchPointsHistory();
    });

    newSocket.on('usersUpdated', (updatedUsers) => {
      setUsers(updatedUsers);
    });

    // Fetch initial data
    fetchUsers();
    fetchPointsHistory();

    // Cleanup
    return () => {
      newSocket.close();
    };
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users`);
      setUsers(response.data);
      if (response.data.length > 0 && !selectedUser) {
        setSelectedUser(response.data[0]._id);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Error fetching users. Please check if the server is running.');
    }
  };

  const fetchPointsHistory = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/points-history`);
      setPointsHistory(response.data);
    } catch (error) {
      console.error('Error fetching points history:', error);
    }
  };

  const handleClaimPoints = async () => {
    if (!selectedUser) {
      alert('Please select a user first');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/claim-points`, {
        userId: selectedUser
      });
      
      // Local state updates will be handled by socket events
      console.log('Points claimed successfully:', response.data);
    } catch (error) {
      console.error('Error claiming points:', error);
      alert('Error claiming points. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (userName) => {
    try {
      await axios.post(`${API_BASE_URL}/users`, { name: userName });
      // The socket event will update the users list
    } catch (error) {
      console.error('Error adding user:', error);
      if (error.response?.data?.error) {
        alert(error.response.data.error);
      } else {
        alert('Error adding user. Please try again.');
      }
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🏆 Points Claiming System</h1>
        <p>Select a user and claim random points (1-10) to see the leaderboard update in real-time!</p>
      </header>

      <main className="App-main">
        <div className="top-section">
          <div className="user-actions">
            <UserSelection 
              users={users}
              selectedUser={selectedUser}
              setSelectedUser={setSelectedUser}
              onClaimPoints={handleClaimPoints}
              loading={loading}
            />
            
            <AddUser onAddUser={handleAddUser} />
            
            {lastPointsClaimed && (
              <div className="points-notification">
                🎉 {lastPointsClaimed.userName} claimed {lastPointsClaimed.points} points!
              </div>
            )}
          </div>
        </div>

        <div className="content-section">
          <div className="leaderboard-section">
            <Leaderboard users={users} />
          </div>
          
          <div className="history-section">
            <PointsHistory history={pointsHistory} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;