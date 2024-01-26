export function replaceTagHtml(content) {
  const contentAfterReplace = content.replace(/<[^>]*>/g, '');
  return contentAfterReplace;
}
