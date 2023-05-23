import { Command } from 'commander';
import fsp from 'node:fs/promises';
import path from 'node:path';

const command = new Command();

function buildFilename(url) {
  const basename = url.split('://', 2).at(-1).replace(/\W/gi, '-');
  return `${basename}.html`;
}

function run(url, dir) {
  const filepath = path.resolve(dir, buildFilename(url));
  fetch(url)
    .then((resp) => resp.text())
    .catch(() => Promise.reject(new Error(`Failed to fetch the page ${url}`)))
    .then((content) => fsp.writeFile(filepath, content))
    .then(() => console.log(filepath));
}

command
  .name('page-loader')
  .description('Page loader utility')
  .version('0.0.1')
  .argument('<url>', 'url of the page that is to be downloaded')
  .allowExcessArguments(false)
  .option('-o, --output [dir]', 'output dir', process.cwd())
  .action((url, { output }) => run(url, output));

export default command;
