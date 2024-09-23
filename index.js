const axios = require('axios');
require('dotenv').config(); // To load environment variables

// Function to make a request with a custom roblox-machine-id
async function makeRequest(url) {
    const robloxMachineId = process.env.ROBLOX_MACHINE_ID; // Fetch from environment variables
    if (!robloxMachineId) {
        console.error("Error: Roblox machine ID is missing. Please set it in the environment variables.");
        return;
    }

    try {
        // Configure the request with headers and additional options
        const config = {
            headers: {
                'roblox-machine-id': robloxMachineId
            },
            timeout: 5000 // Optional: Add timeout of 5 seconds
        };

        // Make the HTTP request
        const response = await axios.get(url, config);

        // Check response status
        if (response.status === 200) {
            console.log('Response Data:', response.data);
            console.log('Response Headers:', response.headers);
        } else {
            console.error(`Unexpected response status: ${response.status}`);
        }
    } catch (error) {
        // Improved error handling with more context
        if (error.response) {
            // Server responded with a status other than 2xx
            console.error('Response Error:', error.response.status);
            console.error('Error Details:', error.response.data);
        } else if (error.request) {
            // Request was made but no response was received
            console.error('No response received from the server.');
            console.error('Request Details:', error.request);
        } else {
            // Something happened in setting up the request
            console.error('Error creating the request:', error.message);
        }
    }
}

// Call the function with the URL as an argument
makeRequest('https://your-roblox-endpoint.com');
