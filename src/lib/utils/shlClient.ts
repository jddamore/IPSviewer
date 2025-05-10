import base64url from 'base64url';
import * as jose from 'jose';
import { Buffer } from 'buffer';

export interface SHLinkConnectRequest {
  shl: string;
  recipient: string;
  passcode?: string;
}

export interface SHLinkConnectResponse {
  state: string;
  shcs: string[];
  jsons: string[];
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
  return JSON.parse(Buffer.from(s, 'base64').toString()) as T;
}

export function decodeToJson<T>(s: Uint8Array): T {
  return JSON.parse(new TextDecoder().decode(s)) as T;
}

export interface Manifest {
  file: { contentType: string; location: string }[];
}

export function flag(config: { shl: string }) {
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

export function id(config: { shl: string }) {
  const shlBody = config.shl.split(/^(?:.+:\/.+#)?shlink:\//)[1];
  const parsedShl: SHLDecoded = decodeBase64urlToJson(shlBody);
  return new URL(parsedShl?.url).href.split("/").pop();
}

export async function retrieve(configIncoming: SHLinkConnectRequest | {state: string}) {
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
  let isJson = false;
  let manifestResponseContent;
  manifestResponseContent = await manifestResponse.text();
  try {
    manifestResponseContent = JSON.parse(manifestResponseContent);
    isJson = true;
  } catch (error) {
    console.warn("Manifest did not return JSON object");
  }

  if (!manifestResponse.ok || !isJson) {
    return {
      status: manifestResponse.status,
      error: (manifestResponseContent ?? "")
    };
  } else {
    const decryptionKey = Buffer.from(parsedShl.key, 'base64');
    const shcFiles = (manifestResponseContent as SHLManifestFile).files
      .filter((f) => f.contentType === 'application/smart-health-card')
      .map(async (f) =>  {
        if (f.embedded !== undefined) {
          return f.embedded
        } else {
          return fetch(f.location).then((f) => f.text())
        }
      });

    const shcFilesDecrypted = shcFiles.map(async (f) => {
      const decrypted = await jose.compactDecrypt(await f, decryptionKey);
      const decoded = new TextDecoder().decode(decrypted.plaintext);
      return decoded;
    });

    const shcs = (await Promise.all(shcFilesDecrypted)).flatMap((f) => JSON.parse(f)['verifiableCredential'] as string);

    const jsonFiles = (manifestResponseContent as SHLManifestFile).files
      .filter((f) => f.contentType === 'application/fhir+json')
      .map(async (f) =>  {
        if (f.embedded !== undefined) {
          return f.embedded
        } else {
          return fetch(f.location).then((f) => f.text())
        }
      });

    const jsonFilesDecrypted = jsonFiles.map(async (f) => {
      const decrypted = await jose.compactDecrypt(await f, decryptionKey);
      const decoded = new TextDecoder().decode(decrypted.plaintext);
      return decoded;
    });

    const jsons = (await Promise.all(jsonFilesDecrypted)).flatMap((f) => JSON.parse(f));

    
    const result: SHLinkConnectResponse = { shcs, jsons, state: btoa(JSON.stringify(config))};

    return result;
  }
}
