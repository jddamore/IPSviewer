<!--
  Lists the attachments of a DocumentReference (DocumentReference.content[].attachment)
  and lets the user download them. Content may be inline (attachment.data), a Binary
  resource in the bundle or contained in the DocumentReference (attachment.url), or a
  remote URL. Downloads are named using the attachment title and an extension derived
  from the MIME type (e.g. application/dicom -> .dcm).
-->
<script lang="ts">
  import { Button, Icon } from 'sveltestrap';
  import type { BundleEntry, DocumentReference } from 'fhir/r4';
  import {
    buildFilename,
    extensionForMimeType,
    fetchRemoteBlob,
    formatBytes,
    isViewableInBrowser,
    localBlob,
    openBlob,
    resolveAttachment,
    saveBlob,
    type ResolvedAttachment
  } from '$lib/utils/attachments';

  export let resource: DocumentReference;
  export let entries: BundleEntry[] | undefined = undefined;

  let attachments: ResolvedAttachment[] = [];
  $: {
    const content = resource?.content ?? [];
    const baseName =
      resource?.description ||
      resource?.type?.text ||
      resource?.type?.coding?.[0]?.display ||
      (resource?.id ? `DocumentReference-${resource.id}` : 'document');
    attachments = content
      .filter((c) => c?.attachment)
      .map((c, i) =>
        resolveAttachment(
          c.attachment,
          entries,
          resource,
          content.length > 1 ? `${baseName} (${i + 1})` : baseName
        )
      );
  }

  // Per-attachment UI state, keyed by index
  let busy: Record<number, boolean> = {};
  let errors: Record<number, string> = {};

  async function download(item: ResolvedAttachment, index: number) {
    errors[index] = '';
    try {
      if (item.source.kind === 'local') {
        saveBlob(localBlob(item.source.data, item.contentType), item.filename);
      } else if (item.source.kind === 'remote') {
        busy[index] = true;
        const { blob, contentType } = await fetchRemoteBlob(item.source.url, item.contentType);
        saveBlob(blob, buildFilename(item.title, contentType));
      }
    } catch (e: any) {
      console.error(e);
      errors[index] =
        item.source.kind === 'remote'
          ? `Unable to retrieve content (${e?.message ?? e}). The server may not allow access from this viewer; try opening the link directly.`
          : `Unable to decode content: ${e?.message ?? e}`;
    } finally {
      busy[index] = false;
    }
  }

  function view(item: ResolvedAttachment, index: number) {
    errors[index] = '';
    try {
      if (item.source.kind === 'local') {
        openBlob(localBlob(item.source.data, item.contentType));
      }
    } catch (e: any) {
      console.error(e);
      errors[index] = `Unable to decode content: ${e?.message ?? e}`;
    }
  }
</script>

{#if attachments.length > 0}
  <b>Attachments:</b>
  <ul class="list-unstyled ms-2 mb-1">
    {#each attachments as item, index}
      <li class="attachment py-1">
        <Icon name="file-earmark" />
        <span class="attachment-title">{item.title}</span>
        <span class="text-muted small">
          ({item.contentType}{item.size !== undefined ? `, ${formatBytes(item.size)}` : ''}{item.binaryReference
            ? ', Binary resource'
            : ''})
        </span>
        {#if item.source.kind === 'unavailable'}
          <div class="text-muted small fst-italic">{item.source.reason}</div>
        {:else}
          <span class="attachment-actions ms-1">
            <Button
              size="sm"
              color="primary"
              outline
              disabled={busy[index]}
              title={`Download as ${item.filename}`}
              on:click={() => download(item, index)}
            >
              <Icon name="download" />
              {busy[index] ? 'Downloading...' : `Download .${extensionForMimeType(item.contentType)}`}
            </Button>
            {#if item.source.kind === 'local' && isViewableInBrowser(item.contentType)}
              <Button size="sm" color="secondary" outline on:click={() => view(item, index)}>
                <Icon name="box-arrow-up-right" /> View
              </Button>
            {/if}
            {#if item.source.kind === 'remote'}
              <a
                class="btn btn-sm btn-link"
                href={item.source.url}
                target="_blank"
                rel="noopener noreferrer">Open link</a
              >
            {/if}
          </span>
          {#if errors[index]}
            <div class="text-danger small">{errors[index]}</div>
          {/if}
        {/if}
      </li>
    {/each}
  </ul>
{/if}

<style>
  .attachment-title {
    font-weight: 500;
    word-break: break-word;
  }
  .attachment-actions {
    white-space: nowrap;
  }
</style>
