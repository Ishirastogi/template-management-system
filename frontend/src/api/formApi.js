import axios from "axios";

const API_URL = process.env.REACT_APP_BACKEND_API_URL; // Adjust for production if needed

export const submitForm = async (formData) => {
  try {
    const response = await axios.post(`${API_URL}/form/submit`, formData);
    return response.data;
  } catch (error) {
    console.error("Error submitting form data:", error);
    throw error;
  }
};

// Fetch departments for dropdown
export const fetchDepartments = async () => {
    try {
      const response = await axios.get(`${API_URL}/departments`);
      return response.data;
    } catch (error) {
      console.error("Error fetching departments:", error);
      throw error;
    }
  };
  
  // Fetch approval authorities for dropdown
  export const fetchApprovalAuthorities = async () => {
    try {
      const response = await axios.get(`${API_URL}/approval-authorities`);
      return response.data;
    } catch (error) {
      console.error("Error fetching approval authorities:", error);
      throw error;
    }
  };