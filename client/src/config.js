// Production API URL - Replace with your actual Render service URL
const PRODUCTION_API_URL = "https://aquabeacon-backend.onrender.com/api";

// Development API URL
const DEVELOPMENT_API_URL = "http://localhost:5000/api";

// Use production URL when deployed (not localhost), development URL otherwise
export const API_BASE_URL = window.location.hostname === 'localhost' 
  ? DEVELOPMENT_API_URL 
  : PRODUCTION_API_URL;
