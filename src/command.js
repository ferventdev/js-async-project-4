import { Command } from 'commander';
import axios from 'axios';
import fsp from 'node:fs/promises';
import path from 'node:path';

export const command = new Command();

export function buildFilename(url) {
  const basename = url.split('://', 2).at(-1).replace(/\W/gi, '-');
  return `${basename}.html`;
}

export function loadAsync(url, dir) {
  const filepath = path.resolve(dir, buildFilename(url));
  return axios
    .get(url)
    .then((resp) => resp.data)
    .catch(() => Promise.reject(new Error(`Failed to fetch the page ${url}`)))
    .then((content) => fsp.writeFile(filepath, content))
    .then(() => filepath);
}

command
  .name('page-loader')
  .description('Page loader utility')
  .version('0.0.1')
  .argument('<url>', 'url of the page that is to be downloaded')
  .allowExcessArguments(false)
  .option('-o, --output [dir]', 'output dir', process.cwd())
  .action((url, { output }) => loadAsync(url, output).then(console.log));
