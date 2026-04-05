#!/usr/bin/env python3
"""Test the exact same flow as the frontend"""
import requests
import json

print("=== Testing Frontend Flow ===\n")

# Step 1: Login
print("1. Logging in...")
login_response = requests.post(
    "http://localhost:8000/auth/login",
    json={"username": "admin", "password": "admin123"}
)
print(f"   Status: {login_response.status_code}")
token = login_response.json()["access_token"]
print(f"   ✓ Got token: {token[:50]}...\n")

# Step 2: Search (exactly as frontend does)
print("2. Searching for 'python'...")
headers = {"Authorization": f"Bearer {token}"}
search_response = requests.post(
    "http://localhost:8000/search",
    headers=headers,
    json={"query": "python", "top_k": 5}
)
print(f"   Status: {search_response.status_code}")
results = search_response.json()
print(f"   Results: {len(results)} found")

if results:
    print("\n   Top result:")
    print(f"   - Title: {results[0]['title']}")
    print(f"   - Filename: {results[0]['filename']}")
    print(f"   - Similarity: {results[0]['similarity_score']:.4f}")
else:
    print("\n   ⚠ No results returned!")
    print(f"   Response: {json.dumps(results, indent=2)}")
