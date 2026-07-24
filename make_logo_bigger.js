const fs = require('fs');
const files = [
  'src/components/Navbar.tsx',
  'src/app/worker/schedule/page.tsx',
  'src/app/worker/layout.tsx',
  'src/app/user/layout.tsx',
  'src/app/page.tsx',
  'src/app/manager/layout.tsx',
  'src/app/admin/layout-client.tsx'
];
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/className=\"w-6 h-6 object-contain drop-shadow-md\"/g, 'className=\"w-10 h-10 object-contain drop-shadow-md\"');
  content = content.replace(/className=\"w-8 h-8 object-contain drop-shadow-md\"/g, 'className=\"w-14 h-14 object-contain drop-shadow-md\"');
  fs.writeFileSync(file, content);
  console.log('Updated ' + file);
});
