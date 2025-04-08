const axios = require('axios');
const Bottleneck = require('bottleneck');
require('dotenv').config();
let cachedMachineId = process.env.ROBLOX_MACHINE_ID;

function getEnvVariable(varName, defaultValue = null) {
    const value = process.env[varName];
    if (!value && defaultValue === null) {
        throw new Error(`${varName} is not set in the environment variables.`);
    }
    return value || defaultValue;
}

function validateEnvVariables() {
    getEnvVariable('ROBLOX_MACHINE_ID');
    getEnvVariable('MAX_CONCURRENT');
    getEnvVariable('MIN_TIME');
    getEnvVariable('PROXY_HOST', '');
    getEnvVariable('PROXY_PORT', '');
}

const limiter = new Bottleneck({
    maxConcurrent: parseInt(getEnvVariable('MAX_CONCURRENT', '1'), 10),
    minTime: parseInt(getEnvVariable('MIN_TIME', '1000'), 10)
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
    try {
        validateEnvVariables();

        // Use cached machine ID if available, otherwise fetch from environment
        const robloxMachineId = cachedMachineId || process.env.ROBLOX_MACHINE_ID;

        // Configure proxy if the URL is not a roblox endpoint
        const proxyConfig = url.includes('roblox') ? false : {
            host: getEnvVariable('PROXY_HOST'),
            port: getEnvVariable('PROXY_PORT')
        };

        const config = {
            method: method,
            url: url,
            headers: {
                'roblox-machine-id': robloxMachineId
            },
            proxy: proxyConfig,
            timeout: 5000
        };

        if (data && (method === 'POST' || method === 'PUT')) {
            config.data = data;
        }

        const response = await limiter.schedule(() => axios(config));

        // Cache new machine ID from response headers
        if (response.headers['roblox-machine-id'] && !cachedMachineId) {
            cachedMachineId = response.headers['roblox-machine-id'];
            console.log('New Machine ID cached:', cachedMachineId);
        }

        return response;
    } catch (error) {
        handleError(error);
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
