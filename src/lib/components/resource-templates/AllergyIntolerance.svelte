<script lang="ts">
  import { formatDate } from '$lib/utils/util';
  import { Badge } from 'sveltestrap';
  import type { AllergyIntolerance } from 'fhir/r4';
  import type { ResourceTemplateParams } from '$lib/utils/types';
  
  export let content: ResourceTemplateParams<AllergyIntolerance>; // Define a prop to pass the data to the component

  let resource: AllergyIntolerance = content.resource;

  function badgeColor(criticality: string) {
    if (criticality) {
      if (criticality == 'high') {
        return 'danger';
      } else {
        return 'primary';
      }
    } else {
      return 'secondary';
    }
  }
</script>

{#if resource.clinicalStatus || resource.verificationStatus}
  <Badge color="primary">
    {resource.clinicalStatus?.coding?.[0].code ?? ''}
    {resource.clinicalStatus &&
      resource.verificationStatus
        ? '/'
        : ''}
    {resource.verificationStatus?.coding?.[0].code ?? ''}
  </Badge>
{/if}
<Badge color={badgeColor(resource.criticality ?? '')}>
  {resource.type ? `${resource.type} - ` : ''}
  criticality: {resource.criticality ?? 'unknown'}
</Badge>
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
{resource.onsetDateTime ? `Since ${formatDate(resource.onsetDateTime)}` : ''}
