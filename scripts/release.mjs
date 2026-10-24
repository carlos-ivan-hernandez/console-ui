// Publishes a version of console-ui to GitHub for apps to install.
//
//   pnpm release 0.2.0
//
// 1. Sets the version in package.json and commits it on the current branch.
// 2. Builds the library.
// 3. Commits the built package (dist, package.json, readme) to the `release`
//    branch and tags it v0.2.0. Source files stay on master; `release` only ever
//    holds built output, so installing it needs no build step.
// 4. Pushes master, release and the tag.
//
// Apps then depend on "console-ui": "github:carlos-ivan-hernandez/console-ui#v0.2.0".

import {execFileSync} from 'node:child_process';
import {cpSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

const root = join(import.meta.dirname, '..');
const run = (cmd, args, cwd = root) =>
  execFileSync(cmd, args, {cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit']}).trim();
const git = (args, cwd) => run('git', args, cwd);
const fail = message => {
  console.error(`release: ${message}`);
  process.exit(1);
};

const version = process.argv[2];
if (!/^\d+\.\d+\.\d+(-[\w.]+)?$/.test(version ?? '')) fail('usage: pnpm release <version>, e.g. pnpm release 0.2.0');
const tag = `v${version}`;
if (git(['status', '--porcelain'])) fail('commit or stash your changes first');
if (git(['tag', '--list', tag])) fail(`${tag} already exists`);

// 1. Version bump on the source branch.
const pkgPath = join(root, 'package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
if (pkg.version !== version) {
  pkg.version = version;
  writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
  git(['commit', '-q', '-am', `console-ui ${version}`]);
}
const source = git(['rev-parse', '--short', 'HEAD']);
const branch = git(['rev-parse', '--abbrev-ref', 'HEAD']);

// 2. Build.
console.log(`building ${tag} from ${source}…`);
execFileSync('pnpm', ['build'], {cwd: root, stdio: 'inherit'});

// 3. Commit the built package to the release branch, in a separate worktree.
const dir = mkdtempSync(join(tmpdir(), 'console-ui-release-'));
try {
  execFileSync('git', ['fetch', '-q', 'origin', 'release'], {cwd: root, stdio: 'ignore'});
} catch {
  // No release branch on GitHub yet: this is the first release.
}
const hasLocal = Boolean(git(['branch', '--list', 'release']));
const hasRemote = Boolean(git(['branch', '-r', '--list', 'origin/release']));
if (hasLocal) git(['worktree', 'add', '-q', dir, 'release']);
else if (hasRemote) git(['worktree', 'add', '-q', '-b', 'release', dir, 'origin/release']);
else git(['worktree', 'add', '-q', '--orphan', '-b', 'release', dir]);

try {
  for (const entry of readdirSync(dir)) {
    if (entry !== '.git') rmSync(join(dir, entry), {recursive: true, force: true});
  }
  cpSync(join(root, 'dist'), join(dir, 'dist'), {recursive: true});
  cpSync(join(root, 'readme.md'), join(dir, 'readme.md'));
  // Installing from git must not try to build: drop scripts and dev tooling.
  const {scripts: _scripts, devDependencies: _dev, packageManager: _pm, ...published} = pkg;
  writeFileSync(join(dir, 'package.json'), `${JSON.stringify(published, null, 2)}\n`);

  git(['add', '-A'], dir);
  git(['commit', '-q', '--allow-empty', '-m', `console-ui ${version} (built from ${source})`], dir);
  git(['tag', '-a', tag, '-m', `console-ui ${version}`], dir);
} finally {
  git(['worktree', 'remove', '--force', dir]);
}

// 4. Publish.
git(['push', '-q', 'origin', branch, 'release', tag]);
console.log(`\npublished ${tag}. Install it with:\n  "console-ui": "github:carlos-ivan-hernandez/console-ui#${tag}"`);
