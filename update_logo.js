const fs = require('fs');
const path = require('path');

function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(file));
    } else {
      if (file.endsWith('.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = getFiles('src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  // Replace span wrapper
  content = content.replace(
    /<span className="([^"]*)">Back <span className="text-\[#CD7F32\]">Stage<\/span><\/span>/g,
    '<div className={`flex items-center gap-2.5 ${"$1"}`}><img src="/logo.jpg" alt="Logo" className="w-6 h-6 object-contain drop-shadow-md" /><span>Back <span className="text-[#CD7F32]">Stage</span></span></div>'
  );
  
  // Replace h2 wrapper
  content = content.replace(
    /<h2 className="([^"]*)">Back <span className="text-\[#CD7F32\]">Stage<\/span><\/h2>/g,
    '<div className={`flex items-center gap-2.5 ${"$1"}`}><img src="/logo.jpg" alt="Logo" className="w-8 h-8 object-contain drop-shadow-md" /><h2>Back <span className="text-[#CD7F32]">Stage</span></h2></div>'
  );
  
  if(original !== content) {
    fs.writeFileSync(file, content);
    console.log('Updated', file);
  }
});
