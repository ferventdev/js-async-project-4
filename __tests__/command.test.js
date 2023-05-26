import nock from 'nock';
import fsp from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { buildFilename, loadAsync } from '../src/command.js';

test('filename', () => {
  expect(buildFilename('abc')).toBe('abc.html');
  expect(buildFilename('abc-def')).toBe('abc-def.html');
  expect(buildFilename('ru.hexlet.io/courses')).toBe(
    'ru-hexlet-io-courses.html',
  );
  expect(buildFilename('https://ru.hexlet.io/courses')).toBe(
    'ru-hexlet-io-courses.html',
  );
});

test('loads with error', async () => {
  const host = 'http://some-test-host.org';
  const page = '/some-page';
  const url = host + page;

  nock(host).get(page).replyWithError('any');

  await expect(loadAsync(url, '.')).rejects.toEqual(
    new Error(`Failed to fetch the page ${url}`),
  );
});

test('loads ok', async () => {
  const dir = await fsp.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
  try {
    const host = 'http://some-test-host.org';
    const page = '/some-page';
    const url = host + page;
    const pageContents = 'some contents';
    const filepath = path.resolve(dir, buildFilename(url));

    nock(host).get(page).reply(200, pageContents);

    await expect(loadAsync(url, dir)).resolves.toBe(filepath);
    await expect(fsp.readFile(filepath, { encoding: 'utf8' })).resolves.toBe(
      pageContents,
    );
  } finally {
    await fsp.rmdir(dir, { recursive: true });
  }
});
