const fs = require('fs');
const path = require('path');

function fixSyntax(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      fixSyntax(fullPath);
    } else if (fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('\\\'')) {
        content = content.replace(/\\'/g, "'");
        fs.writeFileSync(fullPath, content);
        console.log('Fixed syntax in ' + fullPath);
      }
    }
  }
}

fixSyntax('src/app/api');
