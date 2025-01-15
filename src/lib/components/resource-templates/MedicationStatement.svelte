<script lang="ts">
  import { Badge } from 'sveltestrap';
  import type { BundleEntry, Medication, MedicationStatement } from "fhir/r4";
  import Dosage from '$lib/components/resource-templates/Dosage.svelte';
  import MedicationTemplate from '$lib/components/resource-templates/Medication.svelte';
  import { getEntry } from '$lib/utils/util';
  import type { ResourceTemplateParams } from '$lib/utils/types';

  export let content: ResourceTemplateParams<MedicationStatement>; // Define a prop to pass the data to the component

  let resource: MedicationStatement = content.resource;

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
{#if resource.status}
<Badge color={resource.status === "unknown" ? "secondary" : "primary"}>{resource.status}</Badge>
{/if}

{#if resource.medicationCodeableConcept}
  {#if resource.medicationCodeableConcept.coding}  
    <Badge color="primary">{resource.medicationCodeableConcept.coding[0].system} : {resource.medicationCodeableConcept?.coding[0].code}</Badge>
    <br>
    {#if resource.medicationCodeableConcept.coding[0].display}
      <strong>{resource.medicationCodeableConcept.coding[0].display}</strong><br>
    {:else if resource.medicationCodeableConcept.text}
      <strong>{resource.medicationCodeableConcept.text}</strong><br>
    {/if}
  {:else if resource.medicationCodeableConcept.text}
    {#if resource.status}
      <br>
    {/if}
    <strong>{resource.medicationCodeableConcept.text}</strong><br>
  {/if}
{/if}

{#if medication}
  <MedicationTemplate content={{ resource: medication, entries: content.entries }} />
{:else if resource.medicationReference?.display}
  <strong>{resource.medicationReference?.display}</strong>
  <br>
{/if}

{#if resource.reasonReference?.[0].display}
  {resource.reasonReference?.[0].display}<br>
{/if}

<Dosage dosage={resource.dosage?.[0]} />

{#if resource.effectivePeriod?.start}
  Effective {resource.effectivePeriod.start}{resource.effectivePeriod.end
    ? ` - ${resource.effectivePeriod.end}`
    : ''}
{:else if resource.effectiveDateTime}
  {resource.effectiveDateTime ? `Effective date: ${resource.effectiveDateTime.split("T")[0]}` : ''}
{/if}