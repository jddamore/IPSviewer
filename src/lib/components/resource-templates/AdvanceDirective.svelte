<script lang="ts">
  import { base64toBlob, formatDate } from '$lib/utils/util';
  import type { DocumentReferencePOLST, ResourceTemplateParams } from '$lib/utils/types';
  
  export let content: ResourceTemplateParams<DocumentReferencePOLST>; // Define a prop to pass the data to the component

  let resource: DocumentReferencePOLST = content.resource;

  /** Determine if any extension has the revoked status
  let isRevoked = false;
  if (resource.extension) {
    isRevoked = resource.extension.some(
      ext => ext.url === 'http://hl7.org/fhir/us/pacio-adi/StructureDefinition/adi-document-revoke-status-extension' && ext.valueCoding.code === 'cancelled'
    );
  }
*/

  // Determine if any extension has the revoked status reactively
  let isRevoked = false;

  // Reactive declaration to update isRevoked when resource.extension changes
  $: {
    if (resource.extension) {
      isRevoked = resource.extension.some(
        ext => ext.url === 'http://hl7.org/fhir/us/pacio-adi/StructureDefinition/adi-document-revoke-status-extension'
        && ext.valueCoding?.code === 'cancelled'
      );
    }
  }

</script>

<div class:is-revoked={isRevoked}>

<!--
Type: {resource.resourceType}
<br />
Text:
{#if resource.text && resource.text.div}
  {resource.text.div}
{:else}
  <i>No text provided in resource</i>
{/if}
<br />
-->

{#if resource.category}
  <b>Category:</b>
  {resource.category?.[0].coding?.[0].display} (LOINC {resource.category?.[0].coding?.[0].code})
  <br />
{/if}
{#if resource.type?.coding}
  <b>Type:</b>
  <!-- 42348-3 is for "Advance Directive"; per cthon, it's presence here is redundant w/ category above. -->
  {#if resource.type?.coding?.[0]}
    {resource.type?.coding?.[0].display} (LOINC {resource.type?.coding?.[0].code})
  {/if}
  {#if resource.type?.coding?.[1]}
    {resource.type?.coding?.[1].display} (LOINC {resource.type?.coding?.[1].code})
  {/if}
  <br />
{/if}
{#if resource.description}
  <b>Description:</b> {resource.description}
  <br />
{/if}
{#if resource.author?.[0].display}
  <b>Author:</b> {resource.author[0].display}
  <br />
{/if}
{#if resource.identifier?.[0].system == 'https://mydirectives.com/standards/terminology/namingSystem/setId'}
  <b>setId:</b> {resource.identifier[0].value}
  <br />
{/if}
{#if resource.extension?.[0].url == 'http://hl7.org/fhir/us/ccda/StructureDefinition/VersionNumber'}
  <!-- As of the July '24 this is now a unix time stamp --> 
  <b>Version number:</b> {resource.extension[0].valueInteger}
  <br />
{/if}
<!-- This is the date that the DocumentReference resource was created, not of interest.
<b>Date:</b>
{#if resource.date}
  {resource.date}
{/if}
<br />
-->

{#if resource.status}
  <b>Status:</b> {resource.status}
  <br />
{/if}

<!-- Revoke Status -->
{#if resource.extension}
  {#each resource.extension as ext}
    {#if ext.url == 'http://hl7.org/fhir/us/pacio-adi/StructureDefinition/adi-document-revoke-status-extension'}
      <b>Revoke Status:</b> {ext.valueCoding?.code}
      <br />
    {/if}
  {/each}
{/if}

{#if resource.docStatus}
<b>docStatus:</b> {resource.docStatus}
<br />
{/if}
{#if resource.description}
  {resource.description}
  <br/>
{/if}

{#if resource.isPolst && (resource.isCpr || resource.isComfortTreatments || resource.isAdditionalTx || resource.isMedicallyAssisted)}
  <br/>
  <b>POLST Details:</b>
    <ul>
      {#if resource.isCpr}
        <ol>
          <b>
            {#if resource.doNotPerformCpr}
              This includes an order to NOT perform CPR.
            {:else}
              This includes an order to perform CPR.
            {/if}
          </b>
        </ol>
      {/if}

      {#if resource.isComfortTreatments}
        <ol>
          {#if resource.doNotPerformComfortTreatments}
            <b>This includes an order to NOT perform treatments:</b> {@html resource.detailComfortTreatments}
          {:else}
            <b>This includes an order to perform {resource.typeComfortTreatments ? `${resource.typeComfortTreatments.toLowerCase()}` : 'treatments'}:</b> {@html resource.detailComfortTreatments}
          {/if}
        </ol>
      {/if}

      {#if resource.isAdditionalTx}
        <ol>
          {#if resource.doNotPerformAdditionalTx}
            <b>This includes an order to NOT perform additional treatments:</b> {@html resource.detailAdditionalTx}
          {:else}
            <b>This includes an order to perform additional treatments:</b> {@html resource.detailAdditionalTx}
          {/if}
        </ol>
      {/if}

      {#if resource.isMedicallyAssisted}
        <ol>
          {#if resource.doNotPerformMedicallyAssisted}
            <b>This includes an order to NOT perform medically assisted nutrition:</b> {@html resource.detailMedicallyAssisted}
          {:else}
            <b>This includes an order to perform medically assisted nutrition:</b> {@html resource.detailMedicallyAssisted}
          {/if}
        </ol>
      {/if}
</ul>
{/if}

{#if resource.content}
<!-- FIXME This iteration not ideal - should iterate whether pdf present or not, as created & pdfSignedDate (ill-named) actually refer to the larger context of the DR, not the pdf... as it stands the Personal Advance Care Plan Document won't show created/signed (bug), tho we don't care so much about that one in IPS. 
-->
  {#if resource.content[0].attachment.creation}
    <b>Created:</b> {formatDate(resource.content[0].attachment.creation)}
    <br/>
  {/if}
  {#if resource.pdfSignedDate}
    <b>Digitally signed:</b> {formatDate(resource.pdfSignedDate)}
    <br/>
  {/if}
  {#each resource.content as content}
    {#if content.attachment.contentType === "application/pdf" && content.attachment.data}
      <b>PDF present:</b>
      {#await base64toBlob(content.attachment.data, content.attachment.contentType)}
        Loading PDF...
      {:then url}
        <a href={url} target="_blank" rel="noopener noreferrer">View</a>
      {/await}
    {/if}
  {/each}
{/if}

</div>

<style>
  .is-revoked {
    background-color: #f0f0f0; /* Light gray background */
    padding: 10px;
    border-radius: 5px;
    background-image: 
      linear-gradient(135deg, rgba(255,255,255,0.5) 25%, transparent 25%),
      linear-gradient(225deg, rgba(255,255,255,0.5) 25%, transparent 25%),
      linear-gradient(45deg, rgba(255,255,255,0.5) 25%, transparent 25%),
      linear-gradient(315deg, rgba(255,255,255,0.5) 25%, transparent 25%);
    background-size: 40px 40px; /* Adjusts the size of the pattern */
    background-position: 15px 15px; /* Adjusts the offset of the pattern */
    opacity: 0.95; /* Slight transparency for a more subtle effect */
  }
</style>
