import chokidar from 'chokidar';

export default function createWatcher(coverageFilePath) {
  const options = {
    awaitWriteFinish: {
      stabilityThreshold: 1000,
      pollInterval: 100,
    },
  };

  const watcher = chokidar.watch(coverageFilePath, options);

  return watcher;
}
