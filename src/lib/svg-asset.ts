export async function validateCanonicalSvg(blob: Blob) {
  const mimeType = blob.type.split(';', 1)[0].trim().toLowerCase();
  const prefix = await blob.slice(0, 512).text();
  if (blob.size === 0 || mimeType !== 'image/svg+xml' || !/^\s*<svg(?:\s|>)/i.test(prefix)) {
    throw new Error('The canonical SVG asset is empty or invalid.');
  }
  return blob;
}