import React, { useMemo } from 'react';
import './Dashboard.css';

const STATUS_CONFIG = [
  { key: 'WISHLIST', label: 'Wishlist', color: 'var(--status-wishlist)', hex: '#ec4899' },
  { key: 'APPLIED', label: 'Applied', color: 'var(--status-applied)', hex: '#3b82f6' },
  { key: 'INTERVIEWING', label: 'Interviewing', color: 'var(--status-interview)', hex: '#f59e0b' },
  { key: 'OFFER', label: 'Offer', color: 'var(--status-offer)', hex: '#10b981' },
  { key: 'REJECTED', label: 'Rejected', color: 'var(--status-rejected)', hex: '#ef4444' },
];

const Dashboard = ({ jobs }) => {
  const stats = useMemo(() => {
    const total = jobs.length;
    const counts = {};
    STATUS_CONFIG.forEach(s => { counts[s.key] = 0; });
    jobs.forEach(job => { counts[job.status] = (counts[job.status] || 0) + 1; });

    const interviewCount = counts['INTERVIEWING'] || 0;
    const offerCount = counts['OFFER'] || 0;
    const rejectedCount = counts['REJECTED'] || 0;
    const activeCount = total - rejectedCount;

    const interviewRate = total > 0 ? Math.round((interviewCount / total) * 100) : 0;
    const offerRate = total > 0 ? Math.round((offerCount / total) * 100) : 0;
    const responseRate = total > 0 ? Math.round(((interviewCount + offerCount + rejectedCount) / total) * 100) : 0;

    return { total, counts, interviewRate, offerRate, responseRate, activeCount };
  }, [jobs]);

  // SVG donut chart calculation
  const circumference = 2 * Math.PI * 70; // r = 70
  const segments = useMemo(() => {
    if (stats.total === 0) return [];
    let offset = 0;
    return STATUS_CONFIG.map(s => {
      const count = stats.counts[s.key] || 0;
      const pct = count / stats.total;
      const dashArray = pct * circumference;
      const segment = { ...s, count, pct, dashArray, dashOffset: -offset };
      offset += dashArray;
      return segment;
    }).filter(s => s.count > 0);
  }, [stats, circumference]);

  return (
    <div className="dashboard-container">
      {/* Stat Cards */}
      <div className="dashboard-grid">
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-primary)' }}>
          <div className="stat-card-label">Total Applications</div>
          <div className="stat-card-value">{stats.total}</div>
          <div className="stat-card-sub">{stats.activeCount} active</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--status-interview)' }}>
          <div className="stat-card-label">Interview Rate</div>
          <div className="stat-card-value">{stats.interviewRate}%</div>
          <div className="stat-card-sub">{stats.counts['INTERVIEWING'] || 0} interviews</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--status-offer)' }}>
          <div className="stat-card-label">Offer Rate</div>
          <div className="stat-card-value">{stats.offerRate}%</div>
          <div className="stat-card-sub">{stats.counts['OFFER'] || 0} offers</div>
        </div>
        <div className="stat-card" style={{ '--card-accent': 'var(--status-applied)' }}>
          <div className="stat-card-label">Response Rate</div>
          <div className="stat-card-value">{stats.responseRate}%</div>
          <div className="stat-card-sub">interviews + offers + rejections</div>
        </div>
      </div>

      {/* Charts */}
      <div className="dashboard-charts">
        {/* Donut Chart */}
        <div className="chart-card">
          <h3>Application Breakdown</h3>
          <div className="donut-chart-wrapper">
            <div className="donut-chart">
              <svg viewBox="0 0 180 180">
                {stats.total === 0 ? (
                  <circle cx="90" cy="90" r="70" stroke="var(--bg-hover)" strokeWidth="28" fill="none" />
                ) : (
                  segments.map((seg, i) => (
                    <circle
                      key={seg.key}
                      cx="90" cy="90" r="70"
                      stroke={seg.hex}
                      strokeWidth="28"
                      fill="none"
                      strokeDasharray={`${seg.dashArray} ${circumference - seg.dashArray}`}
                      strokeDashoffset={seg.dashOffset}
                      style={{ transition: 'all 1s ease-out' }}
                    />
                  ))
                )}
              </svg>
              <div className="donut-center">
                <div className="donut-center-value">{stats.total}</div>
                <div className="donut-center-label">Total</div>
              </div>
            </div>

            <div className="chart-legend">
              {STATUS_CONFIG.map(s => (
                <div className="legend-item" key={s.key}>
                  <div className="legend-left">
                    <span className="legend-dot" style={{ backgroundColor: s.hex }} />
                    <span>{s.label}</span>
                  </div>
                  <span className="legend-count">{stats.counts[s.key] || 0}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Breakdown bars */}
        <div className="chart-card">
          <h3>Status Breakdown</h3>
          <div className="breakdown-list">
            {STATUS_CONFIG.map(s => {
              const count = stats.counts[s.key] || 0;
              const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
              return (
                <div className="breakdown-item" key={s.key}>
                  <div className="breakdown-header">
                    <span className="breakdown-label">{s.label}</span>
                    <span className="breakdown-value">{count} ({Math.round(pct)}%)</span>
                  </div>
                  <div className="breakdown-bar-bg">
                    <div
                      className="breakdown-bar-fill"
                      style={{ width: `${pct}%`, backgroundColor: s.hex }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
