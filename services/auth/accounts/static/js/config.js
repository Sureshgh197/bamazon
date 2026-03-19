// API Configuration - Dynamic Host Detection
const HOST = window.location.hostname;
const PROTOCOL = window.location.protocol;
const PORT = window.location.port;

const IS_LOCAL_DEV = HOST === 'localhost' && PORT !== '80';

// Local dev with ports, everything else through nginx/LB on port 80
let API_BASE_URL, PRODUCTS_API_URL, CART_API_URL, ORDERS_API_URL;

if (IS_LOCAL_DEV) {
    API_BASE_URL     = `http://${HOST}:8000`;
    PRODUCTS_API_URL = `http://${HOST}:8001`;
    CART_API_URL     = `http://${HOST}:8002`;
    ORDERS_API_URL   = `http://${HOST}:8003`;
} else {
    // Through nginx or LB - all on same host, API prefix handles routing
    API_BASE_URL     = `${PROTOCOL}//${HOST}`;
    PRODUCTS_API_URL = `${PROTOCOL}//${HOST}`;
    CART_API_URL     = `${PROTOCOL}//${HOST}`;
    ORDERS_API_URL   = `${PROTOCOL}//${HOST}`;
}
