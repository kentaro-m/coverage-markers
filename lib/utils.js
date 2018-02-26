import chokidar from 'chokidar';

export default function createWatcher(coverageFilePath) {
  const options = {
    awaitWriteFinish: {
      stabilityThreshold: 2000,
      pollInterval: 100,
    },
  };

  const watcher = chokidar.watch(coverageFilePath, options);

  return watcher;
}
