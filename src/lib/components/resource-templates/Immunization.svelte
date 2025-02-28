<script lang="ts">
  import { formatDate } from '$lib/utils/util';
  import { Badge } from 'sveltestrap';
  import type { Immunization } from 'fhir/r4';
  import type { ResourceTemplateParams } from '$lib/utils/types';
  
  export let content: ResourceTemplateParams<Immunization>; // Define a prop to pass the data to the component

  let resource: Immunization = content.resource;
</script>
{#if resource.vaccineCode}
  {#if resource.vaccineCode.coding}
    <Badge color="primary">{resource.vaccineCode.coding[0].system} : {resource.vaccineCode.coding[0].code}</Badge>
    <br />
    {#if resource.vaccineCode.coding[0].display}
      <strong>{resource.vaccineCode.coding[0].display}</strong><br>
    {:else if resource.vaccineCode.text}
      <strong>{resource.vaccineCode.text}</strong><br>
    {/if}
  {:else if resource.vaccineCode.text}
    <strong>{resource.vaccineCode.text}</strong><br>
  {/if}
{/if}

{#if resource.occurrenceDateTime}
  Date: {formatDate(resource.occurrenceDateTime)}
{:else if resource.occurrenceString}
  Date: {resource.occurrenceString}
{/if}
