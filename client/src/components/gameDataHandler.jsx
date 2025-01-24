// gameDataHandler.js
import axios from 'axios';

// Create an Axios instance with a custom base URL
const api = axios.create({
  baseURL: "https://monkey-see-monkey-do-yi4u.onrender.com/", // Set base URL for the API
});

// Function to fetch game info from the backend
export const fetchGameInfo = async (userId) => {
  try {
    console.log("Fetching game info for userId:", userId);
    const response = await api.get("/api/gameInfo", {
      params: { userId: userId },
    });

    console.log("Fetched game info from backend:", response.data);

    const { tasks, numBananas } = response.data;

    console.log("Tasks (gameDataHandler):", tasks);
    console.log("Number of bananas (gameDataHandler):", numBananas);

    const sortedTasksById = tasks.sort((a, b) => a._id.localeCompare(b._id));
    console.log("Sorted tasks (gameDataHandler):", sortedTasksById);

    // Return the fetched game data so it can be used in Tree.jsx
    return {
      tasks: sortedTasksById || [],
      numBananas: numBananas || 0,
    };

  } catch (error) {
    console.error("Error fetching game info:", error);

    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    } else if (error.request) {
      console.error("Request error:", error.request);
    } else {
      console.error("Error message:", error.message);
    }

    throw new Error('An error occurred while fetching game info. Please try again.');
  }
};

// Function to save player task data to the backend
export const saveTaskData = async (userId, tasks, numBananas, setTasks) => {
  try {
    console.log('Saving task data:', tasks);
    console.log('User ID:', userId);

    // Send the updated task list and numBananas to the backend
    const response = await axios.post('/api/gameInfo', {
      userId,               // Ensure the userId is passed
      tasks,                // Send the updated list of tasks
      numBananas,           // Send the updated numBananas value
    });

    console.log('Backend response:', response);

    if (response.status === 200 || response.status === 201) {
      console.log('Task data saved successfully');
      // Update the UI state here to reflect changes
    } else {
      console.error('Failed to save task data', response);
      alert('Failed to save task data to the server. Please try again.');
    }
  } catch (error) {
    console.error('Error saving task data:', error.response || error);
    alert('There was an error while saving task data. Please try again.');
  }
};


export default {
  fetchGameInfo,
  saveTaskData
};
