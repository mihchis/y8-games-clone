const fs = require('fs-extra');
const path = require('path');

// Đường dẫn nguồn và đích
const sourceDir = path.join(__dirname, 'src', 'games', 'demoquest-main', 'www');
const targetDir = path.join(__dirname, 'public', 'games', 'demoquest-main');

// Đảm bảo thư mục đích tồn tại
fs.ensureDirSync(targetDir);

// Sao chép các thư mục cần thiết
const dirsToCopy = ['js', 'css', 'media'];

dirsToCopy.forEach(dir => {
  const source = path.join(sourceDir, dir);
  const target = path.join(targetDir, dir);
  
  if (fs.existsSync(source)) {
    console.log(`Copying ${dir} directory...`);
    fs.copySync(source, target);
    console.log(`${dir} directory copied successfully.`);
  } else {
    console.error(`Source directory ${source} does not exist.`);
  }
});

console.log('All assets copied successfully!');