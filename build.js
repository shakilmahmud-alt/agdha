const fs = require('fs');
const path = require('path');

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

const items = ['index.html', 'page1.html', 'page2.html', 'page3.html', 'pdf-view.html', 'css', 'js', 'assets'];

['dist', 'public'].forEach(targetDir => {
  items.forEach(item => {
    const fullSrc = path.join(__dirname, item);
    const fullDest = path.join(__dirname, targetDir, item);
    if (fs.existsSync(fullSrc)) {
      copyRecursiveSync(fullSrc, fullDest);
    }
  });
});

console.log('Build complete! dist and public created successfully.');
