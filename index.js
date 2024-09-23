const axios = require('axios');
const Bottleneck = require('bottleneck');
require('dotenv').config(); // To load environment variables
let cachedMachineId = process.env.ROBLOX_MACHINE_ID;

function validateEnvVariables() {
    if (!process.env.ROBLOX_MACHINE_ID) {
        throw new Error("ROBLOX_MACHINE_ID is not set in the environment variables.");
    }
    if (!process.env.MAX_CONCURRENT || !process.env.MIN_TIME) {
        throw new Error("MAX_CONCURRENT or MIN_TIME is not set in the environment variables.");
    }
}

const limiter = new Bottleneck({
    maxConcurrent: parseInt(process.env.MAX_CONCURRENT, 10),
    minTime: parseInt(process.env.MIN_TIME, 10)
});

function handleError(error) {
    if (error.response) {
        console.error('Response Error:', error.response.status);
        console.error('Error Details:', error.response.data);
    } else if (error.request) {
        console.error('No response received from the server.');
        console.error('Request Details:', error.request);
    } else {
        console.error('Error in setting up request:', error.message);
    }
}

// Function to make a request with a custom roblox-machine-id
async function makeRequest(url, method = 'GET', data = null) {
    validateEnvVariables();
    const robloxMachineId = process.env.ROBLOX_MACHINE_ID; // Fetch from environment variables

    const config = {
        method: method,
        url: url,
        headers: {
            'roblox-machine-id': robloxMachineId
        },
        proxy: url.include('roblox') ? false : {
            host: process.env.PROXY_HOST,
            port: process.env.PROXY_PORT
        },
        timeout: 5000
    };

    if (data && (method === 'POST' || method === 'PUT')) {
        config.data = data;
    }

    try {
        const response = await limiter.schedule(() => axios(config));

        if (response.headers['roblox-machine-id'] && !cachedMachineId) {
            cachedMachineId = response.headers['roblox-machine-id'];
            console.log('New Machine ID cached:', cachedMachineId)
        }

        return response;
    } catch(error) {
        console.error('Error making request:', error);
        throw error;
    }
}

(async () => {
    try {
        const response = await makeRequest('https://your-roblox-endpoint.com');
        console.log('Response Data:', response.data);
    } catch (error) {
        handleError(error);
    }
})();
