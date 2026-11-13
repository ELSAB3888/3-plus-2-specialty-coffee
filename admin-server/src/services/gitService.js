/**
 * gitService.js — Git operations for committing and pushing data changes.
 * Operates on the project root (one level above admin-server/).
 */

import simpleGit from 'simple-git';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, '../../..');

/**
 * Returns a configured simple-git instance for the project root.
 * @returns {import('simple-git').SimpleGit}
 */
export function getGit() {
  const git = simpleGit(PROJECT_ROOT);

  // Apply git identity from env if provided
  if (process.env.GIT_USER_NAME && process.env.GIT_USER_EMAIL) {
    git
      .addConfig('user.name', process.env.GIT_USER_NAME, false, 'local')
      .catch(() => {}); // non-fatal
    git
      .addConfig('user.email', process.env.GIT_USER_EMAIL, false, 'local')
      .catch(() => {}); // non-fatal
  }

  return git;
}

/**
 * Stage data + image files, commit, and push to origin/main.
 * @param {string} message  Commit message prefix
 * @returns {Promise<{success: boolean, commitHash?: string, error?: string}>}
 */
export async function commitAndPush(message) {
  try {
    const git = getGit();

    // Stage data and images
    await git.add(['public/data/', 'public/images/']);

    // Check if there's actually anything to commit
    const status = await git.status();
    if (status.staged.length === 0) {
      return { success: true, commitHash: null, message: 'Nothing to commit' };
    }

    const timestamp = new Date().toISOString();
    const fullMessage = `${message} [${timestamp}]`;

    // Set remote URL with credentials if provided
    if (process.env.GIT_REMOTE) {
      await git.remote(['set-url', 'origin', process.env.GIT_REMOTE]);
    }

    const commitResult = await git.commit(fullMessage);
    const commitHash = commitResult.commit || null;

    console.log(`[${timestamp}] gitService: committed ${commitHash} — "${fullMessage}"`);

    // Determine branch
    const branch = (await git.revparse(['--abbrev-ref', 'HEAD'])).trim() || 'main';

    await git.push('origin', branch);

    console.log(`[${new Date().toISOString()}] gitService: pushed to origin/${branch}`);

    return { success: true, commitHash, branch };
  } catch (err) {
    console.error(`[${new Date().toISOString()}] gitService: commitAndPush failed:`, err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Get current git working tree status.
 * @returns {Promise<{hasChanges: boolean, modifiedFiles: string[], branch: string}>}
 */
export async function getStatus() {
  try {
    const git = getGit();
    const status = await git.status();
    const branch = (await git.revparse(['--abbrev-ref', 'HEAD'])).trim();

    const modifiedFiles = [
      ...status.modified,
      ...status.created,
      ...status.deleted,
      ...status.not_added,
    ];

    return {
      hasChanges: modifiedFiles.length > 0,
      modifiedFiles,
      branch,
      staged: status.staged,
    };
  } catch (err) {
    throw new Error(`Failed to get git status: ${err.message}`);
  }
}

/**
 * Check if git is configured and return basic info.
 * @param {string|null} [commitHash]  Optional — check deployment status for a commit
 * @returns {Promise<{status: string, commitHash?: string}>}
 */
export async function getDeploymentStatus(commitHash = null) {
  // Without a GitHub API token, we can only report "pushed"
  // A future enhancement could hit the GitHub Actions API
  return {
    status: 'pushed',
    commitHash,
    note: 'Configure GH_TOKEN env var to get live deployment status from GitHub Actions',
  };
}

/**
 * Check if git is configured for use.
 * @returns {Promise<{configured: boolean, remote: string|null, branch: string|null}>}
 */
export async function getGitHealth() {
  try {
    const git = getGit();
    const remotes = await git.getRemotes(true);
    const origin = remotes.find((r) => r.name === 'origin');
    const branch = (await git.revparse(['--abbrev-ref', 'HEAD'])).trim();

    // Mask credentials in remote URL
    let remoteUrl = origin?.refs?.push || null;
    if (remoteUrl) {
      remoteUrl = remoteUrl.replace(/ghp_[^@]+@/, 'ghp_***@');
    }

    return {
      configured: Boolean(origin),
      remote: remoteUrl,
      branch,
    };
  } catch (err) {
    return { configured: false, remote: null, branch: null, error: err.message };
  }
}
