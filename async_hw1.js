const fs = require('fs');
const path = require('path');
const util = require('util');
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

const fsReaddirPromise = util.promisify(fs.readdir);
const fsStatPromise = util.promisify(fs.stat);
const fsMkdirPromise = util.promisify(fs.mkdir);
const fsUnlinkPromise = util.promisify(fs.unlink);
const fsRmdirPromise = util.promisify(fs.rmdir);

const findFiles = async directory => {
  try {
    const items = await fsReaddirPromise(directory);
    await Promise.all(
      items.map(async item => {
        if (item === '.DS_Store') return null;
        const itemPath = path.join(directory, item);
        const itemStats = await fsStatPromise(itemPath);
        itemStats.isDirectory() ? await findFiles(itemPath) : (files[item] = itemPath);
      })
    );
  } catch (err) {
    console.log(err.code === 'ENOENT' ? 'Упс! Исходной папки нет :(' : err);
    process.exit(1);
  }
}; // собирает файлы в словарь {fileName: filePath}

const moveFilesToDirectory = async (targetDirectory, files) => {
  try {
    await fsMkdirPromise(targetDirectory);
  } catch (err) {
    console.log(err.code === 'EEXIST' ? 'Целевая папка уже существует, но мы ее перезапишем' : err);
  } finally {
    let existedFolders = []; // Здесь будем хранить уникальные имена папок, чтобы кажды раз не пытаться создать существующую папку
    for (let file in files) {
      const newDirectoryName = file[0].toUpperCase();
      const fullPath = path.join(targetDirectory, newDirectoryName);
      if (existedFolders.indexOf(newDirectoryName) === -1) {
        await fsMkdirPromise(fullPath);
        existedFolders.push(newDirectoryName);
      }
      try {
        fs.createReadStream(files[file]).pipe(fs.createWriteStream(path.join(fullPath, file)));
      } catch (error) {
        console.log(error);
      }
    }
  }
};

const cleanFolder = async directory => {
  const items = await fsReaddirPromise(directory);
  await Promise.all(
    items.map(async item => {
      const itemPath = path.join(directory, item);
      const itemStats = await fsStatPromise(itemPath);
      itemStats.isDirectory() ? await cleanFolder(itemPath) : await fsUnlinkPromise(itemPath);
    })
  );
  await fsRmdirPromise(directory);
};

const func = async () => {
  await findFiles(sourceDirectory);
  await moveFilesToDirectory(targetDirectory, files);
  if (args.clean) await cleanFolder(sourceDirectory);
};

try {
  func();
} catch (err) {
  console.log(err);
}
