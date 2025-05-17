import React from 'react';
import './PendingContactsSummary.css';

const PendingContactsSummary = ({ pendingContacts }) => {
  // Separate incoming and outgoing requests
  const incomingRequests = pendingContacts.filter(contact => contact.direction === 'INCOMING');
  const outgoingRequests = pendingContacts.filter(contact => contact.direction === 'OUTGOING');
  console.log("Outgoing: ", outgoingRequests);
  return (
    <div className="pending-contacts-summary">
      <div className="summary-section">
        <h3>Pending Requests Summary</h3>
        
        <div className="summary-counts">
          <div className="summary-count">
            <span className="count-label">Incoming:</span>
            <span className="count-value">{incomingRequests.length}</span>
          </div>
          <div className="summary-count">
            <span className="count-label">Outgoing:</span>
            <span className="count-value">{outgoingRequests.length}</span>
          </div>
        </div>
      </div>

      {outgoingRequests.length > 0 && (
        <div className="summary-section">
          <h4>Sent Requests</h4>
          <ul className="request-list">
            {outgoingRequests.map(contact => (
              <li key={contact.id} className="request-item">
                <div className="request-avatar">
                  {contact.username.charAt(0).toUpperCase()}
                </div>
                <div className="request-details">
                  <div className="request-name">{contact.username}</div>
                  {contact.email && <div className="request-email">{contact.email}</div>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {incomingRequests.length > 0 && (
        <div className="summary-section">
          <h4>New Requests</h4>
          <ul className="request-list">
            {incomingRequests.map(contact => (
              <li key={contact.id} className="request-item">
                <div className="request-avatar">
                  {contact.username.charAt(0).toUpperCase()}
                </div>
                <div className="request-details">
                  <div className="request-name">{contact.username}</div>
                  {contact.email && <div className="request-email">{contact.email}</div>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PendingContactsSummary;