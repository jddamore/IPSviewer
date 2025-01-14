<script lang="ts">
    import type { Practitioner } from "fhir/r4";

    export let resource: Practitioner; // Define a prop to pass the data to the component
</script>
  
{#if resource.name}
    <strong>
        {#if resource.name[0]}
            {#if resource.name[0].prefix
                || resource.name[0].given
                || resource.name[0].family}
                {resource.name[0].prefix ?? ""}
                {resource.name[0].given ? resource.name[0].given.join(' ') : ""}
                {resource.name[0].family ?? ""}
            {:else if resource.name[0].text}
                {resource.name[0].text}
            {/if}
        <!-- TODO: This doesn't pass type checking, but may be necessary for some example data
        {:else}
            {resource.name.prefix ?? ""}
            {resource.name.given ? resource.name.given.join(' ') : ""}
            {resource.name.family ?? ""}
        -->
        {/if}
    </strong>
    <br>
{/if}
{#if resource.gender}
    Gender: {resource.gender ?? ""}<br>
{/if}
{#if resource.address}
  <table class="table table-bordered table-sm">
      <thead>
          <tr>
          <th scope="col">Use</th>
          <th scope="col">Address</th>
          </tr>
          <tr></tr>
      </thead>
      {#each resource.address as address}
          <tr>
          <td>{address.use ?? ""}</td>
          <td>
            {#if address.line}
                {#each address.line as line}
                    {line}<br />
                {/each}
            {/if}
            {address.city ?? "[Unknown City]"}{
                address.state
                    ? `, ${address.state}`
                    : ''
            }{address.country
                ? `, ${address.country}`
                : ''}
            {address.postalCode ?? ""}
          </td>
          </tr>
      {/each}
  </table>
{/if}
  