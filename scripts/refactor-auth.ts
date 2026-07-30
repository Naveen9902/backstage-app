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
  // Skip auth routes
  if (route.includes('api\\auth') || route.includes('api/auth')) continue;

  let content = fs.readFileSync(route, 'utf8');

  // If the file already uses getAuthUserId, skip
  if (content.includes('getAuthUserId')) continue;

  // We are looking for blocks defining userId using cookieStore.get
  // Pattern 1: let userId = cookieStore.get(...
  // Pattern 2: const userId = cookieStore.get(...
  const hasCookieGet = content.includes('cookieStore.get(');
  if (!hasCookieGet) continue;

  console.log("Processing:", route);

  // Split into lines
  const lines = content.split('\n');
  let newLines = [];
  let addedImport = false;
  let skipMode = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Add import at the top
    if (!addedImport && (line.startsWith('import ') || line.startsWith('export '))) {
      newLines.push(`import { getAuthUserId } from '@/lib/auth';`);
      addedImport = true;
    }

    if (line.match(/(let|const)\s+userId\s*=\s*cookieStore\.get/)) {
      skipMode = true;
      // Get the indentation
      const match = line.match(/^(\s*)/);
      const indent = match ? match[1] : '';
      newLines.push(`${indent}const userId = await getAuthUserId();`);
      
      // If it's a single line like `const userId = cookieStore.get('...')?.value || ...` we can stop skipping
      if (line.includes(';') && !line.includes('if (!userId)')) {
        skipMode = false;
        continue;
      }
      continue;
    }

    if (skipMode) {
      if (line.match(/^\s*if\s*\(!userId\)\s*userId\s*=\s*cookieStore\.get/)) {
        // Skip these cascading if statements
        continue;
      } else {
        // We're past the cascading if statements
        skipMode = false;
      }
    }

    newLines.push(line);
  }

  content = newLines.join('\n');
  fs.writeFileSync(route, content);
  changedFiles++;
}

console.log(`Refactored ${changedFiles} files!`);
