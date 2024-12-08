export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function formatDate(date: number | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
}

export function truncateFilename(filename: string, maxLength = 20): string {
  if (filename.length <= maxLength) return filename;
  
  const ext = filename.split('.').pop();
  const name = filename.substring(0, filename.length - ext!.length - 1);
  
  if (ext) {
    return `${name.substring(0, maxLength - ext.length - 3)}...${ext}`;
  }
  
  return `${filename.substring(0, maxLength - 3)}...`;
}