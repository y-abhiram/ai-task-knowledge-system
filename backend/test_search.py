#!/usr/bin/env python3
import requests
import json

# Login
login_response = requests.post(
    "http://localhost:8000/auth/login",
    json={"username": "admin", "password": "admin123"}
)
token = login_response.json()["access_token"]
print(f"✓ Login successful")

# Test search
headers = {"Authorization": f"Bearer {token}"}
search_response = requests.post(
    "http://localhost:8000/search",
    headers=headers,
    json={"query": "python programming", "top_k": 5}
)

print(f"\nSearch for 'python programming':")
print(f"Status code: {search_response.status_code}")
results = search_response.json()
print(f"Number of results: {len(results)}")
print(f"\nResults:")
print(json.dumps(results, indent=2))
