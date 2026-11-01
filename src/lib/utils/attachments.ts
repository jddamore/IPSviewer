// Set context to browser for window and document objects
/// <reference lib="dom" />
import type { Attachment, Binary, BundleEntry, FhirResource, Resource } from 'fhir/r4';

/**
 * Map of MIME types to the file extension (without the leading dot) used when
 * saving attachment content to disk. Keys must be lower case and must not
 * include MIME parameters (e.g. "; charset=utf-8").
 */
const MIME_EXTENSIONS: Record<string, string> = {
  // Imaging
  'application/dicom': 'dcm',
  'application/x-dicom': 'dcm',
  'application/dicom+json': 'json',
  'application/dicom+xml': 'xml',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/bmp': 'bmp',
  'image/tiff': 'tif',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
  'image/jp2': 'jp2',
  'image/jpx': 'jpf',
  // Documents
  'application/pdf': 'pdf',
  'text/plain': 'txt',
  'text/html': 'html',
  'text/csv': 'csv',
  'text/rtf': 'rtf',
  'application/rtf': 'rtf',
  'text/markdown': 'md',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.ms-excel': 'xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/vnd.oasis.opendocument.text': 'odt',
  // Structured data / health data formats
  'application/json': 'json',
  'application/fhir+json': 'json',
  'application/json+fhir': 'json',
  'application/xml': 'xml',
  'text/xml': 'xml',
  'application/fhir+xml': 'xml',
  'application/xml+fhir': 'xml',
  'application/hl7-v2': 'hl7',
  'x-application/hl7-v2+er7': 'hl7',
  'application/hl7-v3+xml': 'xml',
  'application/hl7-cda+xml': 'xml',
  // Archives
  'application/zip': 'zip',
  'application/x-zip-compressed': 'zip',
  'application/gzip': 'gz',
  'application/x-tar': 'tar',
  // Audio / video
  'audio/mpeg': 'mp3',
  'audio/wav': 'wav',
  'audio/x-wav': 'wav',
  'video/mp4': 'mp4',
  'video/mpeg': 'mpeg',
  'video/quicktime': 'mov',
  'video/webm': 'webm'
};

const DEFAULT_EXTENSION = 'bin';
const DEFAULT_CONTENT_TYPE = 'application/octet-stream';

/**
 * Types that are safe to open in a new browser tab. Script-capable types such
 * as text/html and image/svg+xml are deliberately excluded: a blob: URL runs
 * in this site's origin, so opening untrusted markup would allow XSS.
 */
const VIEWABLE_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/bmp',
  'image/webp',
  'text/plain'
]);

/** Lower-cases a MIME type and strips any parameters such as charset. */
export function normalizeMimeType(contentType: string | undefined): string {
  return (contentType ?? '').split(';')[0].trim().toLowerCase();
}

/** Returns the file extension (without the dot) for a MIME type, e.g. "dcm" for application/dicom. */
export function extensionForMimeType(contentType: string | undefined): string {
  return MIME_EXTENSIONS[normalizeMimeType(contentType)] ?? DEFAULT_EXTENSION;
}

export function isViewableInBrowser(contentType: string | undefined): boolean {
  return VIEWABLE_TYPES.has(normalizeMimeType(contentType));
}

/**
 * Builds a safe file name from a human readable base name and a MIME type,
 * appending the extension for that type unless the name already ends with it.
 */
export function buildFilename(baseName: string | undefined, contentType: string | undefined): string {
  const extension = extensionForMimeType(contentType);
  let name = (baseName ?? '')
    // Characters that are invalid in file names on common platforms
    .replace(/[\\/:*?"<>|\u0000-\u001f]+/g, '_')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^\.+/, '')
    .slice(0, 100)
    .trim();
  if (!name) {
    name = 'attachment';
  }
  if (name.toLowerCase().endsWith(`.${extension}`)) {
    return name;
  }
  return `${name}.${extension}`;
}

/** Decodes FHIR base64Binary content (whitespace tolerant) into bytes. */
export function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64.replace(/\s+/g, ''));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/** Approximate decoded size in bytes of a base64 string, without decoding it. */
export function base64DecodedSize(base64: string): number {
  const clean = base64.replace(/\s+/g, '');
  const padding = clean.endsWith('==') ? 2 : clean.endsWith('=') ? 1 : 0;
  return Math.max(0, Math.floor((clean.length * 3) / 4) - padding);
}

export function formatBytes(bytes: number | undefined): string {
  if (bytes === undefined || !isFinite(bytes)) {
    return '';
  }
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${unit === 0 ? value : value.toFixed(1)} ${units[unit]}`;
}

// Matches ".../Binary/<id>" optionally followed by "/_history/<version>"
const BINARY_REFERENCE = /(?:^|\/)Binary\/([A-Za-z0-9\-.]{1,64})(?:\/_history\/[^/]+)?$/;

/** True if the URL looks like a reference to a FHIR Binary resource. */
export function isBinaryReference(url: string | undefined): boolean {
  return !!url && BINARY_REFERENCE.test(url);
}

/**
 * Resolves an Attachment.url to a Binary resource carried in the IPS bundle or
 * contained in the referencing resource. Supported forms:
 *  - "#id"                                   contained resource
 *  - "urn:uuid:..." or any exact fullUrl     bundle entry
 *  - "Binary/id" or "http(s)://.../Binary/id" bundle entry with that Binary id
 */
export function resolveBinary(
  url: string | undefined,
  entries: BundleEntry[] | undefined,
  container?: Resource & { contained?: FhirResource[] }
): Binary | undefined {
  if (!url) {
    return undefined;
  }
  if (url.startsWith('#')) {
    const id = url.slice(1);
    return container?.contained?.find(
      (r): r is Binary => r.resourceType === 'Binary' && r.id === id
    );
  }
  const binaries = (entries ?? []).filter((e) => e.resource?.resourceType === 'Binary');
  const exact = binaries.find((e) => e.fullUrl === url);
  if (exact) {
    return exact.resource as Binary;
  }
  const id = url.match(BINARY_REFERENCE)?.[1];
  if (id) {
    const byId = binaries.find(
      (e) => e.resource?.id === id || BINARY_REFERENCE.exec(e.fullUrl ?? '')?.[1] === id
    );
    return byId?.resource as Binary | undefined;
  }
  return undefined;
}

export type AttachmentSource =
  /** Base64 content is available locally, either inline or from a Binary in the bundle. */
  | { kind: 'local'; data: string; origin: 'inline' | 'binary' }
  /** Content must be fetched from an absolute http(s) URL. */
  | { kind: 'remote'; url: string }
  /** Content is referenced but cannot be retrieved. */
  | { kind: 'unavailable'; reason: string };

export interface ResolvedAttachment {
  title: string;
  contentType: string;
  filename: string;
  size?: number;
  source: AttachmentSource;
  binaryReference: boolean;
}

/**
 * Works out where an attachment's bytes come from and what it should be called
 * when downloaded.
 */
export function resolveAttachment(
  attachment: Attachment,
  entries: BundleEntry[] | undefined,
  container: Resource & { contained?: FhirResource[] },
  fallbackName: string
): ResolvedAttachment {
  const binaryReference = isBinaryReference(attachment.url) || !!attachment.url?.startsWith('#');
  let binary: Binary | undefined;
  let source: AttachmentSource;

  if (attachment.data) {
    source = { kind: 'local', data: attachment.data, origin: 'inline' };
  } else if (attachment.url) {
    binary = resolveBinary(attachment.url, entries, container);
    if (binary?.data) {
      source = { kind: 'local', data: binary.data, origin: 'binary' };
    } else if (/^https?:\/\//i.test(attachment.url)) {
      source = { kind: 'remote', url: attachment.url };
    } else if (binary) {
      source = { kind: 'unavailable', reason: 'The referenced Binary resource has no data.' };
    } else {
      source = {
        kind: 'unavailable',
        reason: `The referenced content (${attachment.url}) is not included in this IPS.`
      };
    }
  } else {
    source = { kind: 'unavailable', reason: 'No content or URL was provided.' };
  }

  // The Binary's own contentType describes the bytes we will save; fall back to the attachment's.
  const contentType = binary?.contentType || attachment.contentType || DEFAULT_CONTENT_TYPE;
  const title = attachment.title || fallbackName;
  let size = attachment.size;
  if (size === undefined && source.kind === 'local') {
    size = base64DecodedSize(source.data);
  }

  return {
    title,
    contentType,
    filename: buildFilename(title, contentType),
    size,
    source,
    binaryReference: binaryReference || !!binary
  };
}

/** Builds a Blob for content that is available locally. */
export function localBlob(data: string, contentType: string): Blob {
  return new Blob([base64ToBytes(data)], { type: normalizeMimeType(contentType) || DEFAULT_CONTENT_TYPE });
}

/**
 * Fetches remote attachment content. If the server answers with a FHIR Binary
 * resource (JSON), its base64 data is decoded; otherwise the raw body is used.
 */
export async function fetchRemoteBlob(
  url: string,
  contentType: string
): Promise<{ blob: Blob; contentType: string }> {
  const expected = normalizeMimeType(contentType) || '*/*';
  const response = await fetch(url, {
    headers: { Accept: `${expected}, application/fhir+json;q=0.9, */*;q=0.8` }
  });
  if (!response.ok) {
    throw new Error(`Server responded with ${response.status} ${response.statusText}`.trim());
  }
  const responseType = response.headers.get('content-type') ?? '';
  if (/json/i.test(responseType) && !/dicom\+json/i.test(responseType)) {
    const text = await response.text();
    try {
      const json = JSON.parse(text);
      if (json?.resourceType === 'Binary' && typeof json.data === 'string') {
        const type = json.contentType || contentType;
        return { blob: localBlob(json.data, type), contentType: type };
      }
    } catch (e) {
      // Not FHIR JSON; fall through and save the body as-is
    }
    return { blob: new Blob([text], { type: responseType }), contentType: contentType || responseType };
  }
  const blob = await response.blob();
  return { blob, contentType: contentType || responseType || DEFAULT_CONTENT_TYPE };
}

function clickLink(href: string, configure: (a: HTMLAnchorElement) => void) {
  const element = document.createElement('a');
  element.href = href;
  configure(element);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

/** Prompts the browser to save a Blob under the given file name. */
export function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  clickLink(url, (a) => (a.download = filename));
  // Give the browser time to start the download before releasing the memory
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

/** Opens a Blob in a new tab. Only call for types accepted by isViewableInBrowser(). */
export function openBlob(blob: Blob) {
  const url = URL.createObjectURL(blob);
  clickLink(url, (a) => {
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
  });
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
