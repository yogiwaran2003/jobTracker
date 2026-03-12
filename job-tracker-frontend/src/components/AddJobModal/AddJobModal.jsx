import React, { useState } from 'react';
import { FiPlus, FiLink, FiBriefcase, FiSearch, FiLoader } from 'react-icons/fi';
import { jobApi } from '../../api';
import './AddJobModal.css';

// Re-using FiPlus, FiLink since 'fit' doesn't exist, will correct in App
import { FiX } from 'react-icons/fi';

const AddJobModal = ({ isOpen, onClose, onAddJob }) => {
  const [formData, setFormData] = useState({
    companyName: '',
    jobTitle: '',
    url: '',
    status: 'WISHLIST'
  });
  
  const [isScraping, setIsScraping] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleScrape = async () => {
    if (!formData.url) {
      setError("Please enter a URL to scrape.");
      return;
    }

    try {
      setIsScraping(true);
      setError(null);
      const data = await jobApi.scrapeJobDetails(formData.url);
      
      setFormData(prev => ({
        ...prev,
        companyName: data.companyName !== "Unknown Company" ? data.companyName : prev.companyName,
        jobTitle: data.jobTitle !== "Unknown Title" ? data.jobTitle : prev.jobTitle,
      }));
    } catch (err) {
      setError("Failed to scrape URL. Please enter details manually.");
    } finally {
      setIsScraping(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.companyName || !formData.jobTitle) {
      setError("Company and Job Title are required.");
      return;
    }
    
    try {
      const newJob = await jobApi.createJob(formData);
      onAddJob(newJob);
      setFormData({ companyName: '', jobTitle: '', url: '', status: 'WISHLIST' }); // reset
      onClose();
    } catch (err) {
      setError("Failed to save job.");
    }
  };

  return (
    <div className="modal-overlay glass-panel">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Add New Application</h2>
          <button className="close-btn" onClick={onClose}><FiX /></button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="scraper-section">
          <p className="section-label">Auto-fill with Magic Scraper</p>
          <div className="scraper-input-group">
            <input
              type="url"
              name="url"
              className="input-field"
              placeholder="Paste LinkedIn or Indeed URL..."
              value={formData.url}
              onChange={handleChange}
            />
            <button 
              type="button" 
              className="primary-btn scrape-btn"
              onClick={handleScrape}
              disabled={isScraping || !formData.url}
            >
              {isScraping ? "Scraping..." : "Auto-Fill"}
            </button>
          </div>
        </div>

        <div className="divider"><span>OR</span></div>

        <form onSubmit={handleSubmit} className="manual-form">
          <div className="form-group">
            <label>Job Title *</label>
            <input
              type="text"
              name="jobTitle"
              className="input-field"
              placeholder="e.g. Senior Frontend Engineer"
              value={formData.jobTitle}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Company Name *</label>
            <input
              type="text"
              name="companyName"
              className="input-field"
              placeholder="e.g. Capgemini"
              value={formData.companyName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Initial Status</label>
            <select 
              name="status" 
              className="input-field select-field"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="WISHLIST">Wishlist (Planning to apply)</option>
              <option value="APPLIED">Applied</option>
              <option value="INTERVIEWING">Interviewing</option>
              <option value="OFFER">Offer Received</option>
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" className="secondary-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary-btn">Save Application</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddJobModal;
