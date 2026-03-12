const API_BASE_URL = 'http://localhost:8080/api/jobs';
const AUTH_BASE_URL = 'http://localhost:8080/api/auth';
const AI_BASE_URL = 'http://localhost:8080/api/ai';

// Helper to get auth headers
const getAuthHeaders = () => {
    const token = localStorage.getItem('jt_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

// Global error handler for auth failures
const handleResponse = async (response) => {
    if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('jt_token');
        localStorage.removeItem('jt_user');
        window.location.reload(); // Force full reload to reset App state
        throw new Error('Session expired. Please log in again.');
    }
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'API request failed');
    return data;
};

export const jobApi = {
    // Auth - Register
    register: async (name, email, password) => {
        const response = await fetch(`${AUTH_BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Registration failed');
        return data;
    },

    // Auth - Login
    login: async (email, password) => {
        const response = await fetch(`${AUTH_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Login failed');
        return data;
    },

    // Get all jobs
    getAllJobs: async () => {
        const response = await fetch(API_BASE_URL, { headers: getAuthHeaders() });
        return handleResponse(response);
    },

    // Create a new job manually
    createJob: async (jobData) => {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(jobData),
        });
        return handleResponse(response);
    },

    // Update job status (for drag and drop)
    updateJobStatus: async (id, status) => {
        const response = await fetch(`${API_BASE_URL}/${id}/status`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: JSON.stringify({ status }),
        });
        return handleResponse(response);
    },

    // Scrape job from URL
    scrapeJobDetails: async (url) => {
        const response = await fetch(`${API_BASE_URL}/scrape?url=${encodeURIComponent(url)}`, {
            headers: getAuthHeaders(),
        });
        return handleResponse(response);
    },

    // Delete Job
    deleteJob: async (id) => {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        if (response.status === 401 || response.status === 403) return handleResponse(response);
        if (!response.ok) throw new Error('Failed to delete job');
        return true;
    },

    // Update a job (full update)
    updateJob: async (id, jobData) => {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(jobData),
        });
        return handleResponse(response);
    },

    // AI Interview Prep
    generateInterviewPrep: async (jobTitle, companyName, jobDescription) => {
        const response = await fetch(`${AI_BASE_URL}/interview-prep`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ jobTitle, companyName, jobDescription }),
        });
        return handleResponse(response);
    }
};
