const fs = require('fs');
const path = require('path');

const sourceDirectory = path.join(__dirname, 'initialFolder');
const targetDirectory = path.join(__dirname, 'finalFolder');
let files = {};

const findFiles = directory => {
  fs.readdirSync(directory).forEach(item => {
    if (item === '.DS_Store') return null;
    const itemPath = path.join(directory, item);
    const itemIsDirectory = fs.statSync(itemPath).isDirectory();
    itemIsDirectory ? findFiles(itemPath) : (files[item] = itemPath);
  });
}; // собирает файлы в словарь {fileName: filePath}

const moveFilesToDirectory = (targetDirectory, files) => {
  for (let file in files) {
    const newDirectoryName = file[0].toUpperCase();
    const fullPath = path.join(targetDirectory, newDirectoryName);
    if (!fs.existsSync(targetDirectory)) fs.mkdirSync(targetDirectory);
    if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath);
    try {
      fs
        .createReadStream(files[file])
        .pipe(fs.createWriteStream(path.join(fullPath, file)));
    } catch (error) {
      console.log(error);
    }
  }
};

findFiles(sourceDirectory);
moveFilesToDirectory(targetDirectory, files);
