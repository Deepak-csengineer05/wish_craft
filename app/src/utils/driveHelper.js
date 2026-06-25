/**
 * Converts a standard Google Drive shareable link into a direct download/stream link.
 * Handles patterns like /file/d/FILE_ID/view or open?id=FILE_ID
 * @param {string} url - The Google Drive URL
 * @returns {string} - Direct streamable URL or original URL if not recognized
 */
export function getDirectDriveUrl(url) {
  if (!url || typeof url !== 'string') return '';
  
  const trimmed = url.trim();
  
  // Pattern 1: https://drive.google.com/file/d/FILE_ID/view...
  const fileDMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileDMatch && fileDMatch[1]) {
    return `https://docs.google.com/uc?export=download&id=${fileDMatch[1]}`;
  }
  
  // Pattern 2: https://drive.google.com/open?id=FILE_ID...
  const openIdMatch = trimmed.match(/open\?id=([a-zA-Z0-9_-]+)/);
  if (openIdMatch && openIdMatch[1]) {
    return `https://docs.google.com/uc?export=download&id=${openIdMatch[1]}`;
  }

  // Pattern 3: https://drive.google.com/uc?id=FILE_ID
  const ucIdMatch = trimmed.match(/uc\?id=([a-zA-Z0-9_-]+)/);
  if (ucIdMatch && ucIdMatch[1]) {
    return `https://docs.google.com/uc?export=download&id=${ucIdMatch[1]}`;
  }

  return trimmed;
}
