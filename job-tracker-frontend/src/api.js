const API_BASE_URL = 'http://localhost:8080/api/jobs';

export const jobApi = {
    // Get all jobs
    getAllJobs: async () => {
        try {
            const response = await fetch(API_BASE_URL);
            if (!response.ok) throw new Error('Failed to fetch jobs');
            return await response.json();
        } catch (error) {
            console.error(error);
            throw error;
        }
    },

    // Create a new job manually
    createJob: async (jobData) => {
        try {
            const response = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(jobData),
            });
            if (!response.ok) throw new Error('Failed to create job');
            return await response.json();
        } catch (error) {
            console.error(error);
            throw error;
        }
    },

    // Update job status (for drag and drop)
    updateJobStatus: async (id, status) => {
        try {
            const response = await fetch(`${API_BASE_URL}/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status }),
            });
            if (!response.ok) throw new Error('Failed to update job status');
            return await response.json();
        } catch (error) {
            console.error(error);
            throw error;
        }
    },

    // Scrape job from URL
    scrapeJobDetails: async (url) => {
        try {
            const response = await fetch(`${API_BASE_URL}/scrape?url=${encodeURIComponent(url)}`);
            if (!response.ok) throw new Error('Failed to scrape job details');
            return await response.json();
        } catch (error) {
            console.error(error);
            throw error;
        }
    },
    
    // Delete Job
    deleteJob: async (id) => {
        try {
             const response = await fetch(`${API_BASE_URL}/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete job');
            return true;
        } catch (error) {
             console.error(error);
             throw error;
        }
    }
};
