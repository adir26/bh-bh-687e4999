const decodeBase64ToArrayBuffer = (base64: string): ArrayBuffer => {
  // Handle data URI format (e.g., "data:application/pdf;base64,...")
  let cleanBase64 = base64;
  if (base64.includes('base64,')) {
    cleanBase64 = base64.split('base64,')[1];
  }
  
  const binaryString = atob(cleanBase64);
  const length = binaryString.length;
  const bytes = new Uint8Array(length);

  for (let i = 0; i < length; i += 1) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes.buffer;
};

const viewToArrayBuffer = (view: ArrayBufferView): ArrayBuffer => {
  const uint8 = new Uint8Array(view.byteLength);
  const srcView = new Uint8Array(view.buffer, view.byteOffset, view.byteLength);
  uint8.set(srcView);
  return uint8.buffer;
};

export const createPdfBlob = (data: unknown): Blob => {
  if (!data) {
    throw new Error('קובץ PDF לא הוחזר מהשרת');
  }

  if (data instanceof Blob) {
    return data;
  }

  let arrayBuffer: ArrayBuffer | null = null;

  if (data instanceof ArrayBuffer) {
    arrayBuffer = data;
  } else if (ArrayBuffer.isView(data)) {
    arrayBuffer = viewToArrayBuffer(data);
  } else if (typeof data === 'string') {
    arrayBuffer = decodeBase64ToArrayBuffer(data);
  } else if (typeof data === 'object' && data !== null && 'data' in data) {
    const nested = (data as { data: unknown }).data;

    if (nested instanceof ArrayBuffer) {
      arrayBuffer = nested;
    } else if (ArrayBuffer.isView(nested)) {
      arrayBuffer = viewToArrayBuffer(nested as ArrayBufferView);
    } else if (typeof nested === 'string') {
      arrayBuffer = decodeBase64ToArrayBuffer(nested);
    }
  }

  if (!arrayBuffer) {
    throw new Error('תגובת השרת אינה בפורמט PDF תקין');
  }

  if (!arrayBuffer.byteLength) {
    throw new Error('קובץ ה-PDF שהתקבל ריק');
  }

  // Optional validation: Check for PDF signature
  const uint8 = new Uint8Array(arrayBuffer);
  const pdfSignature = String.fromCharCode(uint8[0], uint8[1], uint8[2], uint8[3]);
  if (pdfSignature !== '%PDF') {
    console.warn('Warning: File does not start with PDF signature');
  }

  return new Blob([arrayBuffer], { type: 'application/pdf' });
};

