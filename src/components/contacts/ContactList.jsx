import React, { useState, useEffect } from 'react';
import { contactsApi } from '../../services/api';
import ContactItem from './ContactItem';
import ContactSearch from './ContactSearch';
import AddContact from './AddContact';
import './ContactList.css';

const ContactList = ({ onSelectContact }) => {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddContact, setShowAddContact] = useState(false);
  const [activeTab, setActiveTab] = useState('contacts'); // 'contacts' or 'pending'

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await contactsApi.getContacts();
      setContacts(response.data);
      setFilteredContacts(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      setError('Failed to load contacts. Please try again later.');
      setLoading(false);
    }
  };

  const handleSearch = (searchTerm) => {
    if (!searchTerm.trim()) {
      setFilteredContacts(contacts);
      return;
    }

    const filtered = contacts.filter(contact => 
      contact.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contact.email && contact.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    setFilteredContacts(filtered);
  };

  const handleAddContact = async (userId) => {
    try {
      await contactsApi.addContact(userId);
      fetchContacts(); // Refresh contacts
      setShowAddContact(false);
      // Switch to pending tab after sending a request
      setActiveTab('pending');
    } catch (error) {
      console.error('Error adding contact:', error);
      alert('Failed to add contact. Please try again.');
    }
  };

  const handleAcceptContact = async (contactId) => {
    try {
      await contactsApi.acceptContact(contactId);
      fetchContacts(); // Refresh contacts
      // Switch to contacts tab after accepting
      setActiveTab('contacts');
    } catch (error) {
      console.error('Error accepting contact:', error);
      alert('Failed to accept contact request. Please try again.');
    }
  };

  const handleRejectContact = async (contactId) => {
    try {
      await contactsApi.rejectContact(contactId);
      fetchContacts(); // Refresh contacts
    } catch (error) {
      console.error('Error rejecting contact:', error);
      alert('Failed to reject contact request. Please try again.');
    }
  };
  
  const handleRemoveContact = async (contactId) => {
    if (window.confirm('Are you sure you want to remove this contact?')) {
      try {
        await contactsApi.removeContact(contactId);
        fetchContacts(); // Refresh contacts
      } catch (error) {
        console.error('Error removing contact:', error);
        alert('Failed to remove contact. Please try again.');
      }
    }
  };

  const toggleAddContact = () => {
    setShowAddContact(!showAddContact);
  };

  // Filter contacts based on active tab and search term
  const getDisplayedContacts = () => {
    if (activeTab === 'contacts') {
      return filteredContacts.filter(contact => contact.status === 'accepted');
    } else {
      return filteredContacts.filter(contact => contact.status === 'pending');
    }
  };
  
  // Get counts for badge display
  const pendingCount = contacts.filter(contact => contact.status === 'pending').length;
  const incomingPendingCount = contacts.filter(
    contact => contact.status === 'pending' && contact.direction === 'incoming'
  ).length;

  return (
    <div className="contact-list-container">
      <div className="contact-list-header">
        <h2>Contacts</h2>
        <button 
          className="add-contact-button" 
          onClick={toggleAddContact}
        >
          {showAddContact ? 'Cancel' : 'Add Contact'}
        </button>
      </div>

      {showAddContact ? (
        <AddContact onAddContact={handleAddContact} onCancel={toggleAddContact} />
      ) : (
        <ContactSearch onSearch={handleSearch} />
      )}

      {/* Tab Navigation */}
      <div className="contact-tabs">
        <button 
          className={`contact-tab ${activeTab === 'contacts' ? 'active' : ''}`}
          onClick={() => setActiveTab('contacts')}
        >
          Contacts
        </button>
        <button 
          className={`contact-tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending
          {pendingCount > 0 && (
            <span className="tab-badge">
              {pendingCount}
              {incomingPendingCount > 0 && <span className="incoming-badge">{incomingPendingCount}</span>}
            </span>
          )}
        </button>
      </div>

      <div className="contact-list">
        {loading ? (
          <div className="contact-list-loading">Loading contacts...</div>
        ) : error ? (
          <div className="contact-list-error">{error}</div>
        ) : getDisplayedContacts().length === 0 ? (
          <div className="contact-list-empty">
            {contacts.length === 0 
              ? "You don't have any contacts yet. Add some to start chatting!" 
              : activeTab === 'contacts'
                ? "No contacts match your search."
                : "No pending requests."}
          </div>
        ) : (
          <>
            {activeTab === 'pending' && (
              <>
                {/* Incoming Requests */}
                {getDisplayedContacts().some(contact => contact.direction === 'incoming') && (
                  <div className="contact-section">
                    <h3>Incoming Requests</h3>
                    {getDisplayedContacts()
                      .filter(contact => contact.direction === 'incoming')
                      .map(contact => (
                        <ContactItem
                          key={contact.id}
                          contact={contact}
                          onSelectContact={onSelectContact}
                          onAcceptContact={handleAcceptContact}
                          onRejectContact={handleRejectContact}
                          onRemoveContact={handleRemoveContact}
                        />
                      ))}
                  </div>
                )}
                
                {/* Outgoing Requests */}
                {getDisplayedContacts().some(contact => contact.direction === 'outgoing') && (
                  <div className="contact-section">
                    <h3>Sent Requests</h3>
                    {getDisplayedContacts()
                      .filter(contact => contact.direction === 'outgoing')
                      .map(contact => (
                        <ContactItem
                          key={contact.id}
                          contact={contact}
                          onSelectContact={onSelectContact}
                          onRemoveContact={handleRemoveContact}
                        />
                      ))}
                  </div>
                )}
              </>
            )}
            
            {/* Active contacts */}
            {activeTab === 'contacts' && (
              <div className="contact-section">
                {getDisplayedContacts().map(contact => (
                  <ContactItem
                    key={contact.id}
                    contact={contact}
                    onSelectContact={onSelectContact}
                    onRemoveContact={handleRemoveContact}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ContactList;