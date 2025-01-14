// Set context to browser for window and document objects
/// <reference lib="dom" />

export async function base64toBlob(base64:string, type="application/octet-stream") {
  let result = await fetch(`data:${type};base64,${base64}`);
  return window.URL.createObjectURL(await result.blob());
}

export function download(filename:string, text:string) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}
