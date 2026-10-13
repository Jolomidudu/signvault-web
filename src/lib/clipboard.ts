export async function copyImageWithFallback(
  blob: Blob,
  writeToClipboard: (() => Promise<void>) | null,
  download: (blob: Blob) => void,
) {
  if (!writeToClipboard) {
    download(blob);
    return "downloaded" as const;
  }

  try {
    await writeToClipboard();
    return "copied" as const;
  } catch {
    download(blob);
    return "downloaded" as const;
  }
}