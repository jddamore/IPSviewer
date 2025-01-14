<script lang="ts">
  import { Badge } from 'sveltestrap';
  import type { DiagnosticReport } from 'fhir/r4';

  export let resource: DiagnosticReport; // Define a prop to pass the data to the component
</script>

{#if resource.code}
  {#if resource.code.coding}
    <Badge color="primary">{resource.code.coding[0].system} : {resource.code.coding[0].code}</Badge>
    <br />
    {#if resource.code.coding[0].display}
      <strong>{resource.code.coding[0].display}</strong><br>
    {:else if resource.code.text}
      <strong>{resource.code.text}</strong><br>
    {/if}
  {:else if resource.code.text}
    <strong>{resource.code.text}</strong><br>
  {/if}
{/if}
{#if resource.effectivePeriod?.start}
  Effective {resource.effectivePeriod.start}{resource.effectivePeriod.end
    ? ` - ${resource.effectivePeriod.end}`
    : ''}
{:else if resource.effectiveDateTime}
    Date: {resource.effectiveDateTime.split("T")[0]}
{/if}
<br>
{#if resource.result}
    <table class="table table-bordered table-sm">
        <thead>
        <tr><th colspan="5">Result(s)</th></tr>
        </thead>
        {#each resource.result as result}
            {#if result.display}
            <tr>
                <td>{result.display}</td>
            </tr>
            {/if}
        {/each}
    </table>
{/if}
