<script lang="ts">
  import type { Organization } from "fhir/r4";
  
  export let resource: Organization; // Define a prop to pass the data to the component
</script>

<strong>{resource.name}</strong>
<br />
{#if resource.address}
  {#if resource.address[0].line}
    {#if resource.address[0].line.length > 0}
      {#each resource.address[0].line as line}
        {line}<br />
      {/each}
    {:else}
      {resource.address[0].line}
    {/if}
  {/if}
  {resource.address[0].city
  }{resource.address[0].state
    ? `, ${resource.address[0].state}`
    : ''
  }{resource.address[0].country
    ? `, ${resource.address[0].country}`
    : ''}
  {resource.address[0].postalCode}
{/if}
