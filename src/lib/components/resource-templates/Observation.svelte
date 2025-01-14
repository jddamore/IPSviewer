<script lang="ts">
  import { Badge } from 'sveltestrap';
  import type { Observation } from "fhir/r4";
  import type { ResourceTemplateParams } from '$lib/utils/types';
  
  export let content: ResourceTemplateParams<Observation>; // Define a prop to pass the data to the component

  let resource: Observation = content.resource;
</script>

{#if resource.category?.[0].coding}
  <Badge color="primary">{resource.category[0].coding[0].code}</Badge><br>
{/if}
{#if resource.code}
  {#if resource.code.coding}
    <Badge color="primary">{resource.code.coding[0].system} : {resource.code.coding[0].code}</Badge>
    <br />
    {#if resource.code.coding[0].display}
      <strong>{resource.code.coding[0].display}: </strong>
    {:else if resource.code.text}
      <strong>{resource.code.text}: </strong>
    {/if}
  {:else if resource.code.text}
    <strong>{resource.code.text}: </strong>
  {/if}
{/if}
{#if resource.valueCodeableConcept?.coding?.[0].display}
  <strong>{resource.valueCodeableConcept.coding[0].display}</strong><br>
{/if}
{#if resource.valueQuantity}
  <strong>{resource.valueQuantity.value ?? ""} {resource.valueQuantity.unit ?? ""}</strong><br>
{/if}
{#if resource.valueString}
  <strong>{resource.valueString ?? ""}</strong><br>
{/if}
{#if resource.note}
 {#each resource.note as note}
  {#if note.text}
    Note: {note.text}<br>
  {/if}
 {/each}
{/if}
{#if !(resource.valueCodeableConcept || resource.valueQuantity || resource.valueString)}
<br>
{/if}
Date: {resource.effectiveDateTime ? `${resource.effectiveDateTime.split("T")[0]}` : ''}
