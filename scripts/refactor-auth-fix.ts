import * as fs from 'fs';
import * as path from 'path';

function walk(dir: string, filelist: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filepath = path.join(dir, file);
    if (fs.statSync(filepath).isDirectory()) {
      walk(filepath, filelist);
    } else if (file.endsWith('route.ts')) {
      filelist.push(filepath);
    }
  }
  return filelist;
}

const apiDir = path.join(process.cwd(), 'src/app/api');
const routes = walk(apiDir);

let changedFiles = 0;

for (const route of routes) {
  let content = fs.readFileSync(route, 'utf8');

  if (!content.includes('if (!userId) userId = cookieStore.get')) continue;

  const lines = content.split('\n');
  const newLines = lines.filter(line => !line.match(/^\s*if\s*\(!userId\)\s*userId\s*=\s*cookieStore\.get/));

  content = newLines.join('\n');
  fs.writeFileSync(route, content);
  changedFiles++;
}

console.log(`Cleaned up ${changedFiles} files!`);
