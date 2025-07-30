import axios from "axios";

let csrfToken = null;

// Function to fetch the CSRF token
export const fetchCsrfToken = async () => {
  try {
    const response = await axios.get("/api/csrf-token");
    csrfToken = response.data.csrfToken;
    return csrfToken;
  } catch (error) {
    console.error("Error fetching CSRF token:", error);
    throw error;
  }
};

// Function to get the CSRF token
export const getCsrfToken = () => csrfToken;
