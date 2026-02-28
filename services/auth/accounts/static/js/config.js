// API Configuration - Dynamic Host Detection
// For mobile access: Replace 'localhost' with your PC's IP address (e.g., '192.168.1.100')
const HOST = window.location.hostname === 'localhost' ? 'localhost' : window.location.hostname;

const API_BASE_URL = `http://${HOST}:8000`;
const PRODUCTS_API_URL = `http://${HOST}:8001`;
const CART_API_URL = `http://${HOST}:8002`;
const ORDERS_API_URL = `http://${HOST}:8003`;
