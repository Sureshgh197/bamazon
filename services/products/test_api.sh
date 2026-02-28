#!/bin/bash
# Products Microservice - Testing Examples

# Replace with your actual token
TOKEN="your_auth_token_here"
BASE_URL="http://localhost:8001"

echo "========================================"
echo "Products API Testing Examples"
echo "========================================"
echo ""

# ============ CATEGORIES ============

echo "1. GET ALL CATEGORIES"
echo "Command:"
echo "curl $BASE_URL/api/products/category"
echo ""
curl $BASE_URL/api/products/category | python -m json.tool
echo ""
echo ""

echo "2. CREATE A CATEGORY (Admin Only)"
echo "Command:"
echo 'curl -X POST '"$BASE_URL"'/api/products/category \'
echo '  -H "Content-Type: application/json" \'
echo '  -H "Authorization: Token '"$TOKEN"'" \'
echo '  -d '"'"'{"name":"Electronics","description":"Electronic devices and gadgets"}'"'"
echo ""
curl -X POST "$BASE_URL/api/products/category" \
  -H "Content-Type: application/json" \
  -H "Authorization: Token $TOKEN" \
  -d '{"name":"Electronics","description":"Electronic devices and gadgets"}' | python -m json.tool
echo ""
echo ""

echo "3. GET SPECIFIC CATEGORY"
echo "Command:"
echo "curl $BASE_URL/api/products/category/1"
echo ""
curl $BASE_URL/api/products/category/1 | python -m json.tool
echo ""
echo ""

echo "4. UPDATE A CATEGORY (Admin Only)"
echo "Command:"
echo 'curl -X PUT '"$BASE_URL"'/api/products/category/1 \'
echo '  -H "Content-Type: application/json" \'
echo '  -H "Authorization: Token '"$TOKEN"'" \'
echo '  -d '"'"'{"name":"Electronics & Gadgets","description":"Updated description"}'"'"
echo ""
curl -X PUT "$BASE_URL/api/products/category/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Token $TOKEN" \
  -d '{"name":"Electronics & Gadgets","description":"Updated description"}' | python -m json.tool
echo ""
echo ""

# ============ PRODUCTS ============

echo "5. GET ALL PRODUCTS"
echo "Command:"
echo "curl $BASE_URL/api/products/product"
echo ""
curl $BASE_URL/api/products/product | python -m json.tool
echo ""
echo ""

echo "6. GET PRODUCTS BY CATEGORY"
echo "Command:"
echo "curl '$BASE_URL/api/products/product?category_id=1'"
echo ""
curl "$BASE_URL/api/products/product?category_id=1" | python -m json.tool
echo ""
echo ""

echo "7. CREATE A PRODUCT (Admin Only)"
echo "Command:"
echo 'curl -X POST '"$BASE_URL"'/api/products/product \'
echo '  -H "Content-Type: application/json" \'
echo '  -H "Authorization: Token '"$TOKEN"'" \'
echo '  -d '"'"'{"name":"Smartphone","description":"Latest smartphone","price":999.99,"category":1,"stock":50}'"'"
echo ""
curl -X POST "$BASE_URL/api/products/product" \
  -H "Content-Type: application/json" \
  -H "Authorization: Token $TOKEN" \
  -d '{"name":"Smartphone","description":"Latest smartphone","price":999.99,"category":1,"stock":50}' | python -m json.tool
echo ""
echo ""

echo "8. GET SPECIFIC PRODUCT"
echo "Command:"
echo "curl $BASE_URL/api/products/product/1"
echo ""
curl $BASE_URL/api/products/product/1 | python -m json.tool
echo ""
echo ""

echo "9. UPDATE A PRODUCT (Admin Only)"
echo "Command:"
echo 'curl -X PUT '"$BASE_URL"'/api/products/product/1 \'
echo '  -H "Content-Type: application/json" \'
echo '  -H "Authorization: Token '"$TOKEN"'" \'
echo '  -d '"'"'{"price":899.99,"stock":45}'"'"
echo ""
curl -X PUT "$BASE_URL/api/products/product/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Token $TOKEN" \
  -d '{"price":899.99,"stock":45}' | python -m json.tool
echo ""
echo ""

echo "10. DELETE A PRODUCT (Admin Only)"
echo "Command:"
echo 'curl -X DELETE '"$BASE_URL"'/api/products/product/1 \'
echo '  -H "Authorization: Token '"$TOKEN"'"'
echo ""
curl -X DELETE "$BASE_URL/api/products/product/1" \
  -H "Authorization: Token $TOKEN"
echo ""
echo ""

echo "========================================"
echo "Testing Complete!"
echo "========================================"
echo ""
echo "Note: Replace '$TOKEN' with your actual authentication token"
echo "obtained from the auth service login endpoint"
