export function createPrivatePreviewUrl(blob: Blob) {
  const url = URL.createObjectURL(blob);
  let revoked = false;

  return {
    url,
    revoke() {
      if (revoked) return;
      revoked = true;
      URL.revokeObjectURL(url);
    },
  };
}