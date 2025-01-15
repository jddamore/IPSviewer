<script lang="ts">
  import type { Location } from "fhir/r4";
  import type { ResourceTemplateParams } from '$lib/utils/types';
  
  export let content: ResourceTemplateParams<Location>; // Define a prop to pass the data to the component

  let resource: Location = content.resource;
</script>
  
<strong>{resource.name ?? ""}</strong>
<br />
{#if resource.telecom}
  <table class="table table-bordered table-sm">
      <thead>
          <tr><th colspan="3">Contact Information</th></tr>
      </thead>
        <tr>
          {#each resource.telecom as telecom}
            <td>{telecom.system ?? ""}</td>
            <td>{telecom.use ?? ""}</td>
            <td>{telecom.value ?? ""}</td>
          {/each}
        </tr>
  </table>
{/if}
{#if resource.address}
    {#if resource.address.line}
      {#if resource.address.line.length > 0}
        {#each resource.address.line as line}
          {#if line !== ""}
            {line}<br />
          {/if}
        {/each}
      {:else}
        {resource.address.line}
      {/if}
    {/if}
    {resource.address.city ?? ""
    }{resource.address.state
      ? `, ${resource.address.state}`
      : ''
    }{resource.address.country
      ? `, ${resource.address.country}`
      : ''}
    {resource.address.postalCode ?? ""}
{/if}
  