#!/bin/bash

# GitHub Repository Push Script
# Replace the placeholders below with your actual GitHub credentials

GITHUB_USERNAME="YOUR_GITHUB_USERNAME"
GITHUB_TOKEN="YOUR_PERSONAL_ACCESS_TOKEN"
REPO_URL="https://github.com/oleg3289/task-dashboard.git"

# Push with authentication
git push https://${GITHUB_USERNAME}:${GITHUB_TOKEN}@github.com/oleg3289/task-dashboard.git main

echo "✅ Dashboard pushed to GitHub!"
echo "🌐 Access at: https://oleg3289.github.io/task-dashboard"