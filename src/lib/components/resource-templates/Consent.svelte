<script lang="ts">
  import { Badge } from 'sveltestrap';
  import type { Consent } from 'fhir/r4';
  import type { ResourceTemplateParams } from '$lib/utils/types';

  export let content: ResourceTemplateParams<Consent>; // Define a prop to pass the data to the component

  let resource: Consent = content.resource;
</script>
{#if resource.text?.div}
  {@html resource.text.div}
  <br>
{/if}
{#if resource.category?.[0]}
  {#if resource.category[0].coding}
    <Badge color="primary">{resource.category[0].coding[0].system} : {resource.category[0].coding[0].code}</Badge>
    <br />
    {#if resource.category[0].coding[0].display}
      <strong>{resource.category[0].coding[0].display}</strong>
    {:else if resource.category[0].text}
      <strong>{resource.category[0].text}</strong>
    {/if}
    <br>
  {:else if resource.category[0].text}
    <strong>{resource.category[0].text}</strong>
    <br>
  {/if}
{/if}
{#if resource.provision?.code?.[0].coding}
  Intent: {resource.provision?.code?.[0].coding[0].display}
{/if}
