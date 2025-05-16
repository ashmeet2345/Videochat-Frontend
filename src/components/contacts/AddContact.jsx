import React, { useState } from 'react';
import { userApi } from '../../services/api';
import './AddContact.css';

const AddContact = ({ onAddContact, onCancel }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pendingRequests, setPendingRequests] = useState([]); // Track pending requests

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    try {
      setLoading(true);
      setError('');
      console.log(`Searching with term: ${searchTerm}`);
      console.log(`Request URL will be: /api/users?search=${encodeURIComponent(searchTerm)}`);
      // Make an API call to search for users
      const response = await userApi.getUsers( searchTerm );
      console.log('Search response:', response);
      setSearchResults(response.data);
      
      if (response.data.length === 0) {
        setError('No users found matching your search.');
      }
      
      setLoading(false);
    } catch (error) {
      setError('Failed to search for users. Please try again.');
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSendRequest = async (userId) => {
    try {
      // Track this request as pending in the UI 
      setPendingRequests([...pendingRequests, userId]);
      await onAddContact(userId);
    } catch (error) {
      // Remove from pending if it fails
      setPendingRequests(pendingRequests.filter(id => id !== userId));
      console.error('Failed to send contact request:', error);
    }
  };

  // Check if a request is pending for this user
  const isRequestPending = (userId) => {
    return pendingRequests.includes(userId);
  };

  return (
    <div className="add-contact">
      <div className="search-container">
        <input
          type="text"
          placeholder="Search by username or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          className="add-contact-input"
        />
        <button 
          onClick={handleSearch} 
          disabled={loading || !searchTerm.trim()}
          className="search-button"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>
      
      {error && <div className="add-contact-error">{error}</div>}
      
      <div className="search-results">
        {searchResults.map(user => (
          <div key={user.id} className="user-item">
            <div className="user-info">
              <div className="user-avatar">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="user-details">
                <div className="user-name">{user.username}</div>
                {user.email && <div className="user-email">{user.email}</div>}
              </div>
            </div>
            <button 
              onClick={() => handleSendRequest(user.id)}
              className={`add-button ${isRequestPending(user.id) ? 'pending' : ''}`}
              disabled={isRequestPending(user.id)}
            >
              {isRequestPending(user.id) ? 'Pending' : 'Send Request'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AddContact;