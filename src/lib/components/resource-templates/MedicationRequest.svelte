<script lang="ts">
  import { Badge } from 'sveltestrap';
  import type { BundleEntry, Medication, MedicationRequest, Resource } from 'fhir/r4';
  import type { ResourceTemplateParams } from '$lib/utils/types';
  import Dosage from '$lib/components/resource-templates/Dosage.svelte';
  import MedicationTemplate from '$lib/components/resource-templates/Medication.svelte';
  import { getEntry } from '$lib/utils/util';

  export let content: ResourceTemplateParams<MedicationRequest>; // Define a prop to pass the data to the component

  let resource: MedicationRequest = content.resource;

  let medication: Medication | undefined;

  $: {
    if (resource) {
      if (resource.medicationReference) {
        if (resource.contained?.[0]?.resourceType === 'Medication') {
          // If the medication is contained in the resource
          medication = resource.contained[0];
        } else if (resource.medicationReference?.reference) {
          // If the medication is referenced
          medication = getEntry(content.entries as BundleEntry[], resource.medicationReference.reference) as Medication;
        }
      }
    }
  }
</script>

<Badge color="secondary">{resource.intent ? resource.intent : ''}</Badge>
<Badge color={resource.status === 'stopped' ? 'secondary' : 'primary'}
  >{resource.status ? `${resource.status}` : ''}</Badge
>
<br />
{#if resource.medicationCodeableConcept}
  {#if resource.medicationCodeableConcept.coding}
    {#if resource.medicationCodeableConcept.coding[0].system && resource.medicationCodeableConcept.coding[0].code}
      <Badge color="primary"
        >{resource.medicationCodeableConcept.coding[0].system} : {resource.medicationCodeableConcept
          .coding[0].code}</Badge
      >
      <br />
    {/if}
    {#if resource.medicationCodeableConcept.coding[0].display}
      <strong>{resource.medicationCodeableConcept.coding[0].display}</strong><br />
    {:else if resource.medicationCodeableConcept.text}
      <strong>{resource.medicationCodeableConcept.text}</strong><br />
    {/if}
  {:else if resource.medicationCodeableConcept.text}
    <strong>{resource.medicationCodeableConcept.text}</strong><br />
  {/if}
{/if}

{#if medication}
  <MedicationTemplate content={{ resource: medication, entries: content.entries }} />
{:else if resource.medicationReference?.display}
  <strong>{resource.medicationReference?.display}</strong>
  <br>
{/if}

{#if resource.dispenseRequest?.validityPeriod}
  Valid: {resource.dispenseRequest?.validityPeriod.start}{resource.dispenseRequest
    ?.validityPeriod.end
    ? ` - ${resource.dispenseRequest?.validityPeriod.end}`
    : ''}
  <br />
{/if}

<Dosage dosage={resource.dosageInstruction?.[0]} />
