<script lang="ts">
  import { Badge} from 'sveltestrap';
  import type { Medication } from "fhir/r4";
  import type { ResourceTemplateParams } from '$lib/utils/types';

  export let content: ResourceTemplateParams<Medication>; // Define a prop to pass the data to the component

  let resource: Medication = content.resource;
  let codingMap = new Map();
</script>

{#if resource.code}
  {#if resource.code.coding}
    <Badge color="primary">{resource.code.coding[0].system} : {resource.code.coding[0].code}</Badge>
    <br />
  {/if}
{/if}
{#if resource.code?.text}
  {(codingMap.set(resource.code.text, 1) && undefined) ?? ""}
  <strong>{resource.code.text}</strong><br>
{/if}
{#if resource.code?.coding}
  {#each resource.code.coding as coding, index}
    {#if !resource.code?.text && index == 0}
      <strong>
        {#if coding.display && !codingMap.get(coding.display)}
          {(codingMap.set(coding.display, 1) && undefined) ?? ""}
          {coding.display}<br>
        {/if}
      </strong>
    {:else}
      {#if coding.display && !codingMap.get(coding.display)}
        {(codingMap.set(coding.display, 1) && undefined) ?? ""}
        {coding.display}<br>
      {/if}
    {/if}
  {/each}
{/if}
{#if resource.ingredient}
  <table class="table table-bordered table-sm">
    <thead>
      <tr><th colspan="5">Composition</th></tr>
      <tr>
        <th scope="col">Ingredient</th>
        <th scope="col">Strength Numerator Qty</th>
        <th scope="col">Unit</th>
        <th scope="col">Strength Denominator Qty</th>
        <th scope="col">Strength Denominator Unit</th>
      </tr>
    </thead>
    <tbody>
    {#each resource.ingredient as ingredient}
      <tr style="text-align: center !important">
        <td>{ingredient.itemCodeableConcept?.coding?.[0].display}</td>
        <td>{ingredient.strength?.numerator?.value}</td>
        <td>{ingredient.strength?.numerator?.unit}</td>
        <td>{ingredient.strength?.denominator?.value}</td>
        <td>{ingredient.strength?.denominator?.unit}</td>
      </tr>
    {/each}
    </tbody>
  </table>
{/if}
