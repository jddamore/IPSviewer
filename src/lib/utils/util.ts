// Set context to browser for window and document objects
/// <reference lib="dom" />
import type { BundleEntry } from "fhir/r4";

export async function base64toBlob(base64:string, type="application/octet-stream") {
  let result = await fetch(`data:${type};base64,${base64}`);
  return window.URL.createObjectURL(await result.blob());
}

// Helper function to format dates as "dd-MMM-yyyy"
export function formatDate(dateStr: string) {
  const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', options);
}

// For machine-readable content, use the reference in the Composition.section.entry to retrieve resource from Bundle
export function getEntry(entries: Array<BundleEntry>, reference: string) {
  let result;
  if (!entries) {
    return result;
  }
  for (let entry of entries) {
    if (entry.fullUrl?.includes(reference)) {
      return entry.resource;
    } else {
      // Attempt to match based on resource and uuid
      let splitReference = reference.split('/');
      let referenceId = splitReference?.pop();
      let referenceResourceType = splitReference?.pop();
      if (referenceResourceType === entry.resource?.resourceType && referenceId && entry.fullUrl?.includes(referenceId)) {
        return entry.resource;
      }
    }
  }

  if (!result) {
    console.log(`missing reference ${reference}`);
  }
  return result;
};

export function download(filename:string, text:string) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}
