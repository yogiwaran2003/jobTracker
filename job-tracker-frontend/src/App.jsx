import React, { useState, useEffect, useMemo } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { FiPlus, FiBarChart2, FiGrid, FiZap, FiLogOut } from 'react-icons/fi';
import KanbanColumn from './components/KanbanBoard/KanbanColumn';
import AddJobModal from './components/AddJobModal/AddJobModal';
import Dashboard from './components/Dashboard/Dashboard';
import InterviewPrep from './components/InterviewPrep/InterviewPrep';
import AuthPage from './components/Auth/AuthPage';
import { jobApi } from './api';
import './App.css';

function App() {
  const [jobs, setJobs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('jt_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [showDashboard, setShowDashboard] = useState(false);
  const [showInterviewPrep, setShowInterviewPrep] = useState(false);

  // Column definitions (now includes REJECTED)
  const columns = [
    { id: 'WISHLIST', title: 'Wishlist' },
    { id: 'APPLIED', title: 'Applied' },
    { id: 'INTERVIEWING', title: 'Interviewing' },
    { id: 'OFFER', title: 'Offer' },
    { id: 'REJECTED', title: 'Rejected' }
  ];

  // Quick stats computed from jobs
  const stats = useMemo(() => {
    const total = jobs.length;
    const interviewing = jobs.filter(j => j.status === 'INTERVIEWING').length;
    const offers = jobs.filter(j => j.status === 'OFFER').length;
    return {
      total,
      interviewRate: total > 0 ? Math.round((interviewing / total) * 100) : 0,
      offerRate: total > 0 ? Math.round((offers / total) * 100) : 0,
    };
  }, [jobs]);

  // Fetch jobs on mount if authenticated
  useEffect(() => {
    if (user) {
      fetchJobs();
    }
  }, [user]);

  const handleAuthSuccess = (userData) => {
    setUser({ name: userData.name, email: userData.email });
  };

  const handleLogout = () => {
    localStorage.removeItem('jt_token');
    localStorage.removeItem('jt_user');
    setUser(null);
    setJobs([]);
  };

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

    // Only update if status changed.
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

  if (!user) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="app-container">
      <header className="app-header glass-panel">
        <div className="header-left">
          <div className="logo">
            <h1>Automated Job Tracker</h1>
          </div>
          {/* Quick Stats */}
          <div className="header-stats">
            <div className="header-stat">
              <span className="header-stat-value">{stats.total}</span>
              <span className="header-stat-label">Apps</span>
            </div>
            <div className="header-stat-divider" />
            <div className="header-stat">
              <span className="header-stat-value accent-interview">{stats.interviewRate}%</span>
              <span className="header-stat-label">Interview</span>
            </div>
            <div className="header-stat-divider" />
            <div className="header-stat">
              <span className="header-stat-value accent-offer">{stats.offerRate}%</span>
              <span className="header-stat-label">Offer</span>
            </div>
          </div>
        </div>

        <div className="header-actions">
          <button
            className="view-toggle-btn ai-prep-btn"
            onClick={() => setShowInterviewPrep(true)}
            title="AI Interview Prep"
          >
            <FiZap /> AI Prep
          </button>
          <button
            className={`view-toggle-btn ${showDashboard ? 'active' : ''}`}
            onClick={() => setShowDashboard(!showDashboard)}
            title={showDashboard ? 'Show Board' : 'Show Analytics'}
          >
            {showDashboard ? <FiGrid /> : <FiBarChart2 />}
            {showDashboard ? 'Board' : 'Analytics'}
          </button>
          <button 
            className="primary-btn" 
            onClick={() => setIsModalOpen(true)}
          >
            <FiPlus /> Add Job
          </button>
          <button 
            className="secondary-btn logout-btn" 
            onClick={handleLogout}
            title="Logout"
            style={{ padding: '0.75rem' }}
          >
            <FiLogOut />
          </button>
        </div>
      </header>

      <main className="board-container">
        {isLoading ? (
          <div className="loading-state">Loading your applications...</div>
        ) : showDashboard ? (
          <Dashboard jobs={jobs} />
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

      <InterviewPrep
        isOpen={showInterviewPrep}
        onClose={() => setShowInterviewPrep(false)}
      />
    </div>
  );
}

export default App;
