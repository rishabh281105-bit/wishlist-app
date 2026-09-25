// Builds the app's screen (www/index.html) from the same Index.html used by the Google version.
const fs = require('fs');
const version = process.env.APP_VERSION || '1.0.0';
const repo = process.env.GITHUB_REPOSITORY || '';
let html = fs.readFileSync('Index.html', 'utf8');
if (!html.includes('<?!= initialJson ?>')) throw new Error('Index.html looks wrong: upload the latest Index.html.');
html = html
  .replace('<?!= initialJson ?>', 'null')
  .replace('<base target="_top">', '')
  .split('__APP_VERSION__').join(version)
  .split('__APP_REPO__').join(repo);
fs.mkdirSync('www', { recursive: true });
fs.writeFileSync('www/index.html', html);
console.log('Prepared www/index.html for version', version, repo ? 'from ' + repo : '');
