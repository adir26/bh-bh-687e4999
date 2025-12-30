export function createPdfBlob(data: ArrayBuffer | Uint8Array | string | { type: 'Buffer'; data: number[] }): Blob {
  let bytes: Uint8Array;
  
  // Handle Node-style Buffer object: { type: 'Buffer', data: number[] }
  if (data && typeof data === 'object' && 'type' in data && data.type === 'Buffer' && Array.isArray((data as any).data)) {
    bytes = new Uint8Array((data as { type: 'Buffer'; data: number[] }).data);
  } else if (typeof data === 'string') {
    const idx = data.indexOf('base64,');
    const b64 = idx !== -1 ? data.slice(idx + 'base64,'.length) : data;
    const bin = atob(b64);
    bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  } else if (data instanceof ArrayBuffer) {
    bytes = new Uint8Array(data);
  } else {
    bytes = data as Uint8Array;
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

/**
 * Validates that a Blob contains a valid PDF by checking the signature
 */
export async function validatePdfBlob(blob: Blob): Promise<void> {
  const slice = blob.slice(0, 5);
  const text = await slice.text();
  
  if (!text.startsWith('%PDF-')) {
    // Get more content for debugging
    const debugSlice = blob.slice(0, 100);
    const debugText = await debugSlice.text();
    throw new Error(`Invalid PDF signature. First 50 chars: ${debugText.slice(0, 50)}`);
  }
}

/**
 * Creates a PDF blob from various response types and validates it
 */
export async function createAndValidatePdfBlob(data: unknown): Promise<Blob> {
  let pdfBlob: Blob;
  
  console.log('[PDF] typeof data:', typeof data);
  console.log('[PDF] data ctor:', data?.constructor?.name);
  console.log('[PDF] data keys:', data && typeof data === 'object' ? Object.keys(data as object) : null);
  
  if (data instanceof Blob) {
    pdfBlob = data;
  } else if (data instanceof ArrayBuffer) {
    pdfBlob = createPdfBlob(data);
  } else if (data instanceof Uint8Array) {
    pdfBlob = createPdfBlob(data);
  } else if (typeof data === 'string') {
    pdfBlob = createPdfBlob(data);
  } else if (
    data && 
    typeof data === 'object' && 
    'type' in data && 
    (data as any).type === 'Buffer' && 
    Array.isArray((data as any).data)
  ) {
    pdfBlob = createPdfBlob(new Uint8Array((data as { type: 'Buffer'; data: number[] }).data));
  } else {
    throw new Error(`Unexpected PDF response type: ${typeof data}, constructor: ${data?.constructor?.name}`);
  }
  
  // Validate PDF signature
  await validatePdfBlob(pdfBlob);
  
  return pdfBlob;
}
