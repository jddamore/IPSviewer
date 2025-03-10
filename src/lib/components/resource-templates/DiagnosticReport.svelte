<script lang="ts">
  import { Badge } from 'sveltestrap';
  import type { BundleEntry, DiagnosticReport, Observation } from 'fhir/r4';
  import ObservationTemplate from './Observation.svelte';
  import type { ResourceTemplateParams } from '$lib/utils/types';
  import { getEntry, formatDate } from '$lib/utils/util';

  export let content: ResourceTemplateParams<DiagnosticReport>; // Define a prop to pass the data to the component

  let resource: DiagnosticReport = content.resource;

  let results: Observation[] | undefined = [];

  $: {
    if (resource) {
      if (resource.result) {
        for (let result of resource.result) {
          if (result.reference) {
            let resultResource;
            if (resource.contained?.[0]?.resourceType === 'Observation') {
              // If the result observation is contained in the resource
              resultResource = resource.contained[0];
            } else {
              // If the result observation is referenced
              resultResource = getEntry(
                content.entries as BundleEntry[],
                result.reference
              ) as Observation;
            }
            if (resultResource) {
              results.push(resultResource);
            }
          }
        }
      }
    }
  }
</script>

{#if resource.category?.[0].coding}
  <Badge color="primary">{resource.category[0].coding[0].display ?? resource.category[0].coding[0].code}</Badge>
{/if}
{#if resource.code}
  {#if resource.code.coding}
    <Badge color="primary">{resource.code.coding[0].system} : {resource.code.coding[0].code}</Badge>
    <br />
    {#if resource.code.coding[0].display}
      <strong>{resource.code.coding[0].display}</strong>
    {:else if resource.code.text}
      <strong>{resource.code.text}</strong>
    {/if}
  {:else if resource.code.text}
    <br><strong>{resource.code.text}</strong>
  {/if}
{/if}
<br>
{#if resource.effectivePeriod}
  Effective: {resource.effectivePeriod.start 
    ? formatDate(resource.effectivePeriod.start)
    : '??'
  } - {
    resource.effectivePeriod.end
    ? formatDate(resource.effectivePeriod.end)
    : '??'
  }
{:else if resource.effectiveDateTime}
  Date: {formatDate(resource.effectiveDateTime)}
{/if}
<br>
{#if resource.result}
  <table class="table table-bordered table-sm">
    <thead>
      <tr><th>Result(s)</th></tr>
    </thead>
    <tbody>
    {#each results as result}
      <tr>
        <div class="ml-4">
          <ObservationTemplate
            content={{ resource: result, entries: content.entries }}
            contained={resource.effectiveDateTime !== undefined || resource.effectivePeriod !== undefined}
          />
        </div>
      </tr>
    {/each}
    {#each resource.result as result}
      {#if result.display}
        <tr>
          <td>{result.display}</td>
        </tr>
      {/if}
    {/each}
    </tbody>
  </table>
{/if}
