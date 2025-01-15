<script lang="ts">
  import { Badge } from 'sveltestrap';
  import type { Condition } from 'fhir/r4';
  import type { ResourceTemplateParams } from '$lib/utils/types';

  export let content: ResourceTemplateParams<Condition>; // Define a prop to pass the data to the component

  let resource: Condition = content.resource;

  function badgeColor(severity: string) {
    if (severity) {
      if (severity == 'Severe') {
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
<Badge color={badgeColor(resource.severity?.text ?? '')}>severity: {resource.severity?.text ?? 'unknown'}</Badge>
<br>
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
{#if resource.bodySite?.[0]?.coding?.[0]?.display}
  Site: {resource.bodySite[0]?.coding?.[0]?.display}<br>
{/if}
{#if resource.onsetDateTime}
  Since: {resource.onsetDateTime.split("T")[0]}<br>
{/if}
{#if resource.recordedDate}
  Recorded: {resource.recordedDate.split("T")[0]}<br>
{/if}
