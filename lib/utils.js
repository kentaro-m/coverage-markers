/* global atom */

export default function findActiveProjectPath(editor) {
  const projectPaths = atom.project.getPaths();
  const filePath = editor.getPath();
  const [projectPath] = projectPaths.filter(p => filePath.indexOf(p) > -1);
  return projectPath;
}
