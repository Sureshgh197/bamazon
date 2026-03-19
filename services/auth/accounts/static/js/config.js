// API Configuration - Dynamic Host Detection
const HOST = window.location.hostname;
const PROTOCOL = window.location.protocol;
const PORT = window.location.port;

const IS_LOCAL = HOST === 'localhost' || HOST === '127.0.0.1';
const IS_LB = PORT === '' || PORT === '80' || PORT === '443';

let API_BASE_URL, PRODUCTS_API_URL, CART_API_URL, ORDERS_API_URL;

if (IS_LOCAL) {
    // Local development
    API_BASE_URL      = `http://${HOST}:8000`;
    PRODUCTS_API_URL  = `http://${HOST}:8001`;
    CART_API_URL      = `http://${HOST}:8002`;
    ORDERS_API_URL    = `http://${HOST}:8003`;
} else if (IS_LB) {
    // Through Load Balancer - path based routing
    API_BASE_URL      = `${PROTOCOL}//${HOST}`;
    PRODUCTS_API_URL  = `${PROTOCOL}//${HOST}/products-service`;
    CART_API_URL      = `${PROTOCOL}//${HOST}/cart-service`;
    ORDERS_API_URL    = `${PROTOCOL}//${HOST}/orders-service`;
} else {
    // Direct app server access with ports
    API_BASE_URL      = `${PROTOCOL}//${HOST}:8000`;
    PRODUCTS_API_URL  = `${PROTOCOL}//${HOST}:8001`;
    CART_API_URL      = `${PROTOCOL}//${HOST}:8002`;
    ORDERS_API_URL    = `${PROTOCOL}//${HOST}:8003`;
}
