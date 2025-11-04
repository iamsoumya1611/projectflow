import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../utils/apiHelper';

const UserList = ({ onUserSelect }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await apiFetch('/api/users', {
          headers: {
            'x-auth-token': token
          }
        });
        const data = await res.json();
        
        if (res.ok) {
          setUsers(data);
        } else {
          setError(data.msg || 'Failed to fetch users');
        }
      } catch (err) {
        console.error(err);
        setError('Server error. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return <div className="text-gray-400">Loading users...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <select 
      onChange={(e) => onUserSelect(e.target.value)}
      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#4A90E2] focus:border-[#4A90E2] sm:text-sm rounded-md bg-[#14141D] text-white border border-[#2D2D44]"
    >
      <option value="">Select a user</option>
      {users.map(user => (
        <option key={user._id} value={user._id}>
          {user.name}
        </option>
      ))}
    </select>
  );
};

export default UserList;