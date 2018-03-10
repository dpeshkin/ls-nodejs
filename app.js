const fs = require('fs');
const path = require('path');
const args = require('yargs')
  .usage('Usage: $0 [-sourceDir "directoryName"] [-targetDir "directoryName"] [--clean]')
  .option('sourceDir', {
    alias: 'S',
    describe: 'Source directory name',
    type: 'string'
  })
  .option('targetDir', {
    alias: 'T',
    describe: 'Output directory name',
    type: 'string'
  })
  .option('clean', { describe: 'Clean source folder', type: 'boolean' })
  .help('?')
  .alias('?', 'help')
  .example('$0 -D initialFolder -T targetFolder --clean')
  .demandOption(
    ['sourceDir', 'targetDir'],
    'Необходимо указать имена исходной и целевой директорий'
  ).argv;

const sourceDirectory = path.normalize(path.join(__dirname, args.sourceDir));
const targetDirectory = path.normalize(path.join(__dirname, args.targetDir));
let files = {};

if (!fs.existsSync(sourceDirectory)) {
  console.log('Упс! Такой папки нет :(');
  process.exit(1);
}

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
      fs.createReadStream(files[file]).pipe(fs.createWriteStream(path.join(fullPath, file)));
    } catch (error) {
      console.log(error);
    }
  }
};

const cleanFolder = directory => {
  if (fs.existsSync(directory)) {
    fs.readdirSync(directory).forEach(item => {
      const itemPath = path.join(directory, item);
      const itemIsDirectory = fs.statSync(itemPath).isDirectory();
      itemIsDirectory ? cleanFolder(itemPath) : fs.unlinkSync(itemPath);
    });
    fs.rmdirSync(directory);
  }
};

findFiles(sourceDirectory);
moveFilesToDirectory(targetDirectory, files);
if (args.clean) cleanFolder(sourceDirectory);
