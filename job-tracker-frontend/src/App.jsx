import React, { useState, useEffect } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { FiPlus } from 'react-icons/fi';
import KanbanColumn from './components/KanbanBoard/KanbanColumn';
import AddJobModal from './components/AddJobModal/AddJobModal';
import { jobApi } from './api';
import './App.css';

function App() {
  const [jobs, setJobs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Column definitions
  const columns = [
    { id: 'WISHLIST', title: 'Wishlist' },
    { id: 'APPLIED', title: 'Applied' },
    { id: 'INTERVIEWING', title: 'Interviewing' },
    { id: 'OFFER', title: 'Offer' }
  ];

  // Fetch jobs on mount
  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      const data = await jobApi.getAllJobs();
      setJobs(data);
    } catch (error) {
      console.error("Failed to fetch jobs");
    } finally {
      setIsLoading(false);
    }
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    // Dropped outside a list
    if (!destination) return;

    // Dropped in the same place
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) return;

    // Find the job that was moved
    const jobToMove = jobs.find(job => job.id.toString() === draggableId);
    
    // Status change logic - optimistic UI update
    const previousStatus = jobToMove.status;
    const newStatus = destination.droppableId;

    // Only update if status changed. (Ordering within the same column isn't saved to DB in this basic version)
    if (previousStatus !== newStatus) {
      // Optimistic update
      setJobs(prevJobs => 
        prevJobs.map(job => 
          job.id.toString() === draggableId ? { ...job, status: newStatus } : job
        )
      );

      try {
        await jobApi.updateJobStatus(jobToMove.id, newStatus);
      } catch (error) {
        // Revert on failure
        console.error("Failed to update status, reverting...");
        setJobs(prevJobs => 
          prevJobs.map(job => 
            job.id.toString() === draggableId ? { ...job, status: previousStatus } : job
          )
        );
      }
    }
  };

  const handleAddJob = (newJob) => {
    setJobs(prev => [...prev, newJob]);
  };

  const handleDeleteJob = async (id) => {
    if(window.confirm("Are you sure you want to delete this application?")) {
      try {
         await jobApi.deleteJob(id);
         setJobs(prev => prev.filter(job => job.id !== id));
      } catch (error) {
         console.error("Error deleting job", error);
      }
    }
  };

  return (
    <div className="app-container">
      <header className="app-header glass-panel">
        <div className="logo">
          <h1>Automated Job Tracker</h1>
        </div>
        <button 
          className="primary-btn" 
          onClick={() => setIsModalOpen(true)}
        >
          <FiPlus /> Add Job
        </button>
      </header>

      <main className="board-container">
        {isLoading ? (
          <div className="loading-state">Loading your applications...</div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="kanban-board">
              {columns.map(col => (
                <KanbanColumn 
                  key={col.id}
                  status={col.id}
                  title={col.title}
                  jobs={jobs.filter(job => job.status === col.id)}
                  onDelete={handleDeleteJob}
                />
              ))}
            </div>
          </DragDropContext>
        )}
      </main>

      <AddJobModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAddJob={handleAddJob}
      />
    </div>
  );
}

export default App;
