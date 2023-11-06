import * as core from '@actions/core';
import { Octokit } from '@octokit/rest';

(async (): Promise<void> => {
  try {
    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN
    });

    let owner: string = core.getInput('owner');
    let repo: string = core.getInput('repo');
    let releaseName: string = core.getInput('release_name');
    let tagName: string = core.getInput('tag_name');

    if (!owner || !repo) {
      const repoInfo: string[] = process.env.GITHUB_REPOSITORY!.split('/');
      owner = repoInfo[0];
      repo = repoInfo[1];
    }

    const releases = await octokit.repos.listReleases({
      owner,
      repo
    });

    let targetReleases: any[] = [];
    if (releaseName) {
      targetReleases = releases.data.filter(release => release.name === releaseName);
    } else if (tagName) {
      targetReleases = releases.data.filter(release => release.tag_name === tagName);
    }

    for (const targetRelease of targetReleases) {
      for (const targetAsset of targetRelease.assets) {
        console.log(`Deleting release asset "${targetAsset.name}"...`);
        await octokit.repos.deleteReleaseAsset({
          owner,
          repo,
          asset_id: targetAsset.id
        });
      }
    }
  } catch (err: any) {
    core.setFailed(err.message);
  }
})();
