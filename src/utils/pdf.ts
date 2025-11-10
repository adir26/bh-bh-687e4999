export function createPdfBlob(data: ArrayBuffer | Uint8Array | string): Blob {
  let bytes: Uint8Array;
  
  if (typeof data === 'string') {
    const idx = data.indexOf('base64,');
    const b64 = idx !== -1 ? data.slice(idx + 'base64,'.length) : data;
    const bin = atob(b64);
    bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  } else if (data instanceof ArrayBuffer) {
    bytes = new Uint8Array(data);
  } else {
    bytes = data;
  }
  
  if (bytes.byteLength === 0) throw new Error('Empty PDF payload');
  return new Blob([bytes.slice()], { type: 'application/pdf' });
}

export function openPdfBlob(blob: Blob, filename = 'report.pdf') {
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank', 'noopener,noreferrer');
}

export function downloadPdfBlob(blob: Blob, filename = 'report.pdf') {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

