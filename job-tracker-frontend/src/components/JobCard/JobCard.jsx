import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { FiBriefcase, FiLink, FiCalendar, FiTrash2 } from 'react-icons/fi';
import './JobCard.css';

const JobCard = ({ job, index, onDelete }) => {
  // Determine color based on status
  const getStatusColor = (status) => {
    switch (status) {
      case 'WISHLIST': return 'var(--status-wishlist)';
      case 'APPLIED': return 'var(--status-applied)';
      case 'INTERVIEWING': return 'var(--status-interview)';
      case 'OFFER': return 'var(--status-offer)';
      default: return 'var(--text-muted)';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown Date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <Draggable draggableId={job.id.toString()} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`job-card ${snapshot.isDragging ? 'dragging' : ''}`}
          style={{
            ...provided.draggableProps.style,
            borderLeft: `4px solid ${getStatusColor(job.status)}`
          }}
        >
          <div className="job-card-header">
            <h3 className="job-title">{job.jobTitle}</h3>
            <button 
              className="delete-btn" 
              onClick={() => onDelete(job.id)}
              title="Delete Job"
            >
              <FiTrash2 />
            </button>
          </div>
          
          <div className="job-company">
            <FiBriefcase className="icon" />
            <span>{job.companyName}</span>
          </div>

          <div className="job-footer">
            <div className="job-date">
              <FiCalendar className="icon" />
              <span>{formatDate(job.appliedDate)}</span>
            </div>
            
            {job.url && (
              <a 
                href={job.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="job-link"
                title="View Posting"
              >
                <FiLink />
              </a>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default JobCard;
