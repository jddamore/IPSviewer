import base64url from 'base64url';
import * as jose from 'jose';

export interface SHLinkConnectRequest {
  shl: string;
  recipient: string;
  passcode?: string;
}

export interface SHLinkConnectResponse {
  state: string;
  shcs: string[];
}

export interface SHLClientStateDecoded {
  url: string;
  key: string;
  recipient: string;
  passcode?: string;
}

export interface SHLDecoded {
  url: string;
  key: string;
  flag?: string;
  label?: string;
}

export interface SHLManifestFile {
  files: {
    contentType: string;
    location: string;
    embedded?: string;
  }[];
}

export function randomStringWithEntropy(entropy: number) {
  const b = new Uint8Array(entropy);
  crypto.getRandomValues(b);
  return base64url.encode(b.buffer as Buffer);
}

export function decodeBase64urlToJson<T>(s: string): T {
  return JSON.parse(base64url.decode(s)) as T;
}

export function decodeToJson<T>(s: Uint8Array): T {
  return JSON.parse(new TextDecoder().decode(s)) as T;
}

export interface Manifest {
  file: { contentType: string; location: string }[];
}

function flag(config: { shl: string }) {
  const shlBody = config.shl.split(/^(?:.+:\/.+#)?shlink:\//)[1];
  const parsedShl: SHLDecoded = decodeBase64urlToJson(shlBody);
  return parsedShl?.flag;
}

function needPasscode(config: { shl: string }) {
  const shlBody = config.shl.split(/^(?:.+:\/.+#)?shlink:\//)[1];
  const parsedShl: SHLDecoded = decodeBase64urlToJson(shlBody);
  if (parsedShl.flag?.includes('P')) {
    return true;
  }

  return false;
}

async function retrieve(configIncoming: SHLinkConnectRequest | {state: string}) {
  const config: SHLinkConnectRequest = configIncoming["state"] ? JSON.parse(base64url.decode(configIncoming["state"])) : configIncoming
  const shlBody = config.shl.split(/^(?:.+:\/.+#)?shlink:\//)[1];
  const parsedShl: SHLDecoded = decodeBase64urlToJson(shlBody);
  const manifestResponse = await fetch(parsedShl.url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      passcode: config.passcode,
      recipient: config.recipient,
    }),
  });

  const manifestResponseJson = (await manifestResponse.json()) as SHLManifestFile;

  const allFiles = manifestResponseJson.files
    .filter((f) => f.contentType === 'application/smart-health-card')
    .map(async (f) =>  {
      if (f.embedded !== undefined) {
        return f.embedded
      } else {
        return fetch(f.location).then((f) => f.text())
      }
    });

  const decryptionKey = base64url.toBuffer(parsedShl.key);
  const allFilesDecrypted = allFiles.map(async (f) => {
    const decrypted = await jose.compactDecrypt(await f, decryptionKey);
    const decoded = new TextDecoder().decode(decrypted.plaintext);
    return decoded;
  });

  const shcs = (await Promise.all(allFilesDecrypted)).flatMap((f) => JSON.parse(f)['verifiableCredential'] as string);
  const result: SHLinkConnectResponse = { shcs, state: base64url.encode(JSON.stringify(config))};

  return result;
}

export { flag, retrieve };
