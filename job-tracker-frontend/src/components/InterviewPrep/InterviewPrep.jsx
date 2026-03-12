import React, { useState } from 'react';
import { FiX, FiZap, FiCode, FiUsers, FiTarget, FiDollarSign } from 'react-icons/fi';
import { jobApi } from '../../api';
import './InterviewPrep.css';

const InterviewPrep = ({ isOpen, onClose, prefillJob }) => {
  const [formData, setFormData] = useState({
    jobTitle: prefillJob?.jobTitle || '',
    companyName: prefillJob?.companyName || '',
    jobDescription: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerate = async () => {
    if (!formData.jobTitle) {
      setError('Please enter at least a job title.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setResults(null);
      const data = await jobApi.generateInterviewPrep(
        formData.jobTitle,
        formData.companyName,
        formData.jobDescription
      );
      setResults(data);
    } catch (err) {
      setError('Failed to generate interview prep. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setResults(null);
    setError(null);
    setFormData({ jobTitle: '', companyName: '', jobDescription: '' });
    onClose();
  };

  return (
    <div className="interview-prep-overlay" onClick={handleClose}>
      <div className="interview-prep-modal" onClick={e => e.stopPropagation()}>
        <div className="prep-modal-header">
          <h2>
            <FiZap /> AI Interview Prep
            <span className="ai-badge">Gemini AI</span>
          </h2>
          <button className="close-btn" onClick={handleClose}><FiX /></button>
        </div>

        <div className="prep-modal-body">
          {!results && !isLoading && (
            <div className="prep-form">
              <div className="prep-form-row">
                <div className="form-group">
                  <label>Job Title *</label>
                  <input
                    type="text"
                    name="jobTitle"
                    className="input-field"
                    placeholder="e.g. Senior Frontend Engineer"
                    value={formData.jobTitle}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Company Name</label>
                  <input
                    type="text"
                    name="companyName"
                    className="input-field"
                    placeholder="e.g. Google"
                    value={formData.companyName}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Job Description (paste for better results)</label>
                <textarea
                  name="jobDescription"
                  className="input-field"
                  placeholder="Paste the full job description here for tailored questions..."
                  value={formData.jobDescription}
                  onChange={handleChange}
                  rows={5}
                />
              </div>
              {error && <div className="prep-error">{error}</div>}
              <button
                className="generate-btn"
                onClick={handleGenerate}
                disabled={!formData.jobTitle}
              >
                <FiZap /> Generate Interview Questions
              </button>
            </div>
          )}

          {isLoading && (
            <div className="prep-loading">
              <div className="prep-spinner" />
              <div className="prep-loading-text">
                AI is analyzing the role and generating tailored questions...
              </div>
            </div>
          )}

          {results && (
            <div className="prep-results">
              {/* Technical Questions */}
              {results.technicalQuestions?.length > 0 && (
                <div className="prep-section">
                  <div className="prep-section-title">
                    <FiCode /> Technical Questions
                  </div>
                  <ul className="prep-question-list">
                    {results.technicalQuestions.map((q, i) => (
                      <li className="prep-question-item" key={i}>
                        <div className="prep-question-text">{q.question}</div>
                        {q.tip && <div className="prep-question-tip">💡 {q.tip}</div>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Behavioral Questions */}
              {results.behavioralQuestions?.length > 0 && (
                <div className="prep-section">
                  <div className="prep-section-title">
                    <FiUsers /> Behavioral Questions
                  </div>
                  <ul className="prep-question-list">
                    {results.behavioralQuestions.map((q, i) => (
                      <li className="prep-question-item behavioral" key={i}>
                        <div className="prep-question-text">{q.question}</div>
                        {q.tip && <div className="prep-question-tip">💡 {q.tip}</div>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Key Skills */}
              {results.keySkills?.length > 0 && (
                <div className="prep-section">
                  <div className="prep-section-title">
                    <FiTarget /> Key Skills to Highlight
                  </div>
                  <div className="prep-tags">
                    {results.keySkills.map((skill, i) => (
                      <span className="prep-tag" key={i}>{skill}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Company Tips */}
              {results.companyTips?.length > 0 && (
                <div className="prep-section">
                  <div className="prep-section-title">
                    <FiTarget /> Company-Specific Tips
                  </div>
                  <ul className="prep-tip-list">
                    {results.companyTips.map((tip, i) => (
                      <li className="prep-tip-item" key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Salary Range */}
              {results.salaryRange && (
                <div className="prep-section">
                  <div className="prep-section-title">
                    <FiDollarSign /> Expected Salary Range
                  </div>
                  <div className="salary-highlight">{results.salaryRange}</div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="prep-actions">
          {results ? (
            <>
              <button className="secondary-btn" onClick={() => setResults(null)}>
                ← Try Another
              </button>
              <button className="secondary-btn" onClick={handleClose}>
                Close
              </button>
            </>
          ) : (
            <div />
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewPrep;
