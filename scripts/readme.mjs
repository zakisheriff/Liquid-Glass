// Writes the component guides (demo/lib/guides.ts) into the README between
// the components markers, so the README and the docs site say the same thing.
import { readFileSync, writeFileSync } from 'node:fs';
import { build } from 'esbuild';

const { outputFiles } = await build({ entryPoints: ['demo/lib/guides.ts'], bundle: true, format: 'esm', write: false });
const { guidesMarkdown } = await import(`data:text/javascript;base64,${Buffer.from(outputFiles[0].text).toString('base64')}`);

const start = '<!-- components:start -->';
const end = '<!-- components:end -->';
const readme = readFileSync('README.md', 'utf8');
const [before, rest] = readme.split(start);
if (rest === undefined || !rest.includes(end)) throw new Error('README is missing the components markers');
writeFileSync('README.md', `${before}${start}\n${guidesMarkdown(3)}\n${end}${rest.split(end)[1]}`);
console.log('README components updated');
