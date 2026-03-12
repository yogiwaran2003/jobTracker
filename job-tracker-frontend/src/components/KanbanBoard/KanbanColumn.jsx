import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import JobCard from '../JobCard/JobCard';
import './KanbanColumn.css';

const KanbanColumn = ({ status, title, jobs, onDelete }) => {
  return (
    <div className={`kanban-column column-${status.toLowerCase()}`}>
      <div className="column-header">
        <h2>{title}</h2>
        <div className="job-count">{jobs.length}</div>
      </div>
      
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            className={`column-content ${snapshot.isDraggingOver ? 'drag-over' : ''}`}
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {jobs.map((job, index) => (
              <JobCard 
                key={job.id} 
                job={job} 
                index={index} 
                onDelete={onDelete}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default KanbanColumn;
