<script lang="ts">
  import { Badge } from 'sveltestrap';
  import type { Encounter } from 'fhir/r4';
  import type { ResourceTemplateParams } from '$lib/utils/types';
  
  export let content: ResourceTemplateParams<Encounter>; // Define a prop to pass the data to the component

  let resource: Encounter = content.resource;
</script>

{#if resource.period?.start}
Effective {resource.period.start}{resource.period.end
    ? ` - ${resource.period.end}`
    : ''}
{/if}
<br>
{#if resource.status}
  Status: {resource.status}
{/if}
{#if resource.reasonCode}
  {#if resource.reasonCode[0].coding}
    <Badge color="primary">{resource.reasonCode[0].coding[0].system} : {resource.reasonCode[0].coding[0].code}</Badge>
    <br />
    {#if resource.reasonCode[0].coding[0].display}
      <strong>{resource.reasonCode[0].coding[0].display}: </strong>
    {:else if resource.reasonCode[0].text}
      <strong>{resource.reasonCode[0].text}: </strong>
    {/if}
  {:else if resource.reasonCode[0].text}
    <strong>{resource.reasonCode[0].text}: </strong>
  {/if}
{/if}
