<script lang="ts">
  import { Badge } from 'sveltestrap';
  import type { BundleEntry, Observation } from "fhir/r4";
  import type { ResourceTemplateParams } from '$lib/utils/types';
  import { getEntry } from '$lib/utils/util';
  
  export let content: ResourceTemplateParams<Observation>; // Define a prop to pass the data to the component
  export let contained: Boolean = false;

  let resource: Observation = content.resource;

  let members: Observation[] | undefined = [];

$: {
  if (resource) {
    if (resource.hasMember) {
      for (let member of resource.hasMember) {
        if (member.reference) {
          let memberResource;
          if (resource.contained?.[0]?.resourceType === 'Observation') {
            // If the member observation is contained in the resource
            memberResource = resource.contained[0];
          } else {
            // If the member observation is referenced
            memberResource = getEntry(content.entries as BundleEntry[], member.reference) as Observation;
          }
          if (memberResource) {
            members.push(memberResource);
          }
        }
      }
    }
  }
}
</script>

{#if !contained && resource.category?.[0].coding}
  <Badge color="primary">{resource.category[0].coding[0].code}</Badge>
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
    <br><strong>{resource.code.text}: </strong>
  {/if}
{/if}
{#if resource.valueCodeableConcept?.coding?.[0].display}
  {resource.valueCodeableConcept.coding[0].display}<br>
{/if}
{#if resource.valueQuantity}
  {resource.valueQuantity.value ?? ""} {resource.valueQuantity.unit ?? ""}<br>
{/if}
{#if resource.valueString}
  {resource.valueString ?? ""}<br>
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
{#if members}
  {#each members as member}
    <div class="ms-4"><svelte:self content={{ resource: member, entries: content.entries }} contained={true}/></div>
  {/each}
{/if}
{#if resource.effectiveDateTime}
  Date: {resource.effectiveDateTime.split("T")[0]}
{/if}
