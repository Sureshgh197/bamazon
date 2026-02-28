@echo off
REM Products Microservice - Testing Examples for Windows
REM Requires: curl and jq (JSON processor)
REM Download jq from: https://stedolan.github.io/jq/download/

setlocal enabledelayedexpansion

REM Configuration
set TOKEN=your_auth_token_here
set BASE_URL=http://localhost:8001

echo ========================================
echo Products API Testing Examples
echo ========================================
echo.

REM ============ CATEGORIES ============

echo 1. GET ALL CATEGORIES
echo Command:
echo curl !BASE_URL!/api/products/category
echo.
call curl !BASE_URL!/api/products/category
echo.
echo.

echo 2. CREATE A CATEGORY (Admin Only)
echo Command:
echo curl -X POST !BASE_URL!/api/products/category ^
echo   -H "Content-Type: application/json" ^
echo   -H "Authorization: Token !TOKEN!" ^
echo   -d "{"name":"Electronics","description":"Electronic devices"}"
echo.
call curl -X POST !BASE_URL!/api/products/category ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Token !TOKEN!" ^
  -d "{\"name\":\"Electronics\",\"description\":\"Electronic devices\"}"
echo.
echo.

echo 3. GET SPECIFIC CATEGORY
echo Command:
echo curl !BASE_URL!/api/products/category/1
echo.
call curl !BASE_URL!/api/products/category/1
echo.
echo.

echo 4. UPDATE A CATEGORY (Admin Only)
echo Command:
echo curl -X PUT !BASE_URL!/api/products/category/1 ^
echo   -H "Content-Type: application/json" ^
echo   -H "Authorization: Token !TOKEN!" ^
echo   -d "{"name":"Electronics Updated"}"
echo.
call curl -X PUT !BASE_URL!/api/products/category/1 ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Token !TOKEN!" ^
  -d "{\"name\":\"Electronics Updated\"}"
echo.
echo.

REM ============ PRODUCTS ============

echo 5. GET ALL PRODUCTS
echo Command:
echo curl !BASE_URL!/api/products/product
echo.
call curl !BASE_URL!/api/products/product
echo.
echo.

echo 6. GET PRODUCTS BY CATEGORY
echo Command:
echo curl !BASE_URL!/api/products/product?category_id=1
echo.
call curl !BASE_URL!/api/products/product?category_id=1
echo.
echo.

echo 7. CREATE A PRODUCT (Admin Only)
echo Command:
echo curl -X POST !BASE_URL!/api/products/product ^
echo   -H "Content-Type: application/json" ^
echo   -H "Authorization: Token !TOKEN!" ^
echo   -d "{"name":"Smartphone","price":999.99,"category":1,"stock":50}"
echo.
call curl -X POST !BASE_URL!/api/products/product ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Token !TOKEN!" ^
  -d "{\"name\":\"Smartphone\",\"price\":999.99,\"category\":1,\"stock\":50}"
echo.
echo.

echo 8. GET SPECIFIC PRODUCT
echo Command:
echo curl !BASE_URL!/api/products/product/1
echo.
call curl !BASE_URL!/api/products/product/1
echo.
echo.

echo 9. UPDATE A PRODUCT (Admin Only)
echo Command:
echo curl -X PUT !BASE_URL!/api/products/product/1 ^
echo   -H "Content-Type: application/json" ^
echo   -H "Authorization: Token !TOKEN!" ^
echo   -d "{"price":899.99,"stock":45}"
echo.
call curl -X PUT !BASE_URL!/api/products/product/1 ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Token !TOKEN!" ^
  -d "{\"price\":899.99,\"stock\":45}"
echo.
echo.

echo 10. DELETE A PRODUCT (Admin Only)
echo Command:
echo curl -X DELETE !BASE_URL!/api/products/product/1 ^
echo   -H "Authorization: Token !TOKEN!"
echo.
call curl -X DELETE !BASE_URL!/api/products/product/1 ^
  -H "Authorization: Token !TOKEN!"
echo.
echo.

echo ========================================
echo Testing Complete!
echo ========================================
echo.
echo Note: Replace '%TOKEN%' with your actual authentication token
echo obtained from the auth service login endpoint
echo.
pause
