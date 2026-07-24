const fs = require('fs');
const files = [
  'src/components/Navbar.tsx',
  'src/app/worker/layout.tsx',
  'src/app/user/layout.tsx',
  'src/app/manager/layout.tsx',
  'src/app/admin/layout-client.tsx'
];
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/\s*<img\s+src=\"\/logo\.png\"[^>]*>\s*/g, ' ');
  fs.writeFileSync(file, content);
  console.log('Updated ' + file);
});

const layoutPath = 'src/app/layout.tsx';
let layoutContent = fs.readFileSync(layoutPath, 'utf8');
layoutContent = layoutContent.replace(/\/logo\.png/g, '/logo.jpg');
fs.writeFileSync(layoutPath, layoutContent);
console.log('Updated layout.tsx');
