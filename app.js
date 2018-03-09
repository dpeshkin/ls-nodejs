const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, 'initialFolder');
const targetDir = path.join(__dirname, 'finalFolder');

const moveFileToNewDirectory = (targetDir, itemPath, item) => {
  const dirName = item[0].toUpperCase();
  const fullPath = path.join(targetDir, dirName);
  if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir);
  if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath);
  try {
    fs
      .createReadStream(itemPath)
      .pipe(fs.createWriteStream(path.join(fullPath, item)));
  } catch (error) {
    console.log(error);
  }
};

const findFiles = directory => {
  fs.readdirSync(directory).forEach(item => {
    if (item === '.DS_Store') return;

    const itemPath = path.join(directory, item);
    const itemIsDirectory = fs.statSync(itemPath).isDirectory();
    if (itemIsDirectory) {
      findFiles(itemPath);
      return;
    }
    moveFileToNewDirectory(targetDir, itemPath, item);
  });
};

findFiles(sourceDir);
