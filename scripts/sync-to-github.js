#!/usr/bin/env node

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

// Configuration
const DATA_DIR = path.join(__dirname, '../public/data')
const AGENTS_FILE = path.join(DATA_DIR, 'agents.json')
const STORIES_FILE = path.join(DATA_DIR, 'stories.json')
const COMMIT_MESSAGE = 'chore: Update dashboard data from local changes'

function log(message) {
  console.log(`[GitHub Sync] ${new Date().toISOString()}: ${message}`)
}

function executeCommand(command, options = {}) {
  try {
    const result = execSync(command, { 
      stdio: 'pipe',
      encoding: 'utf8',
      ...options 
    })
    return { success: true, output: result }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

function checkGitStatus() {
  const gitStatus = executeCommand('git status --porcelain')
  if (!gitStatus.success) {
    log('Error checking git status: ' + gitStatus.error)
    return false
  }
  
  const changes = gitStatus.output.trim()
  log(`Git status: ${changes ? 'Changes detected' : 'No changes'}`)
  
  return changes.length > 0
}

function commitAndPush() {
  log('Starting commit and push process...')
  
  // Add all dashboard data files
  const addResult = executeCommand('git add public/data/*')
  if (!addResult.success) {
    log('Failed to add files: ' + addResult.error)
    return false
  }
  
  // Commit changes
  const commitResult = executeCommand(`git commit -m "${COMMIT_MESSAGE}"`)
  if (!commitResult.success) {
    log('Failed to commit: ' + commitResult.error)
    log('Files staged but commit failed')
    return false
  }
  
  // Push to GitHub
  const pushResult = executeCommand('git push origin main')
  if (!pushResult.success) {
    log('Failed to push: ' + pushResult.error)
    return false
  }
  
  log('Successfully pushed changes to GitHub')
  return true
}

function main() {
  log('GitHub sync script started')
  
  // Check if we have changes to commit
  if (!checkGitStatus()) {
    log('No changes detected, skipping sync')
    return true
  }
  
  // Check if we're in a git repository
  const gitRepoCheck = executeCommand('git rev-parse --is-inside-work-tree')
  if (!gitRepoCheck.success) {
    log('Not in a git repository')
    return false
  }
  
  // Commit and push
  return commitAndPush()
}

// Execute if called directly
if (require.main === module) {
  const success = main()
  process.exit(success ? 0 : 1)
}

module.exports = { main, checkGitStatus, commitAndPush }