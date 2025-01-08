<script lang="ts">
  import { Badge } from 'sveltestrap';
  import type { MedicationStatement } from "fhir/r4";
  import Dosage from '$lib/components/resource-templates/Dosage.svelte';
  
  export let resource: MedicationStatement; // Define a prop to pass the data to the component
</script>
{#if resource.status}
<Badge color={resource.status === "unknown" ? "secondary" : "primary"}>{resource.status}</Badge>
<br>
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
    <strong>{resource.medicationCodeableConcept.text}</strong><br>
  {/if}
  {#if resource.medicationCodeableConcept.coding}  
    <Badge color="primary">{resource.medicationCodeableConcept.coding[0].system} : {resource.medicationCodeableConcept?.coding[0].code}</Badge>
    <br>
    {#if resource.medicationCodeableConcept.coding[0].display}
      <strong>{resource.medicationCodeableConcept.coding[0].display}</strong><br>
    {:else if resource.medicationCodeableConcept.text}
      <strong>{resource.medicationCodeableConcept.text}</strong><br>
    {/if}
  {:else if resource.medicationCodeableConcept.text}
    <strong>{resource.medicationCodeableConcept.text}</strong><br>
  {/if}
{/if}

{#if resource.medicationReference?.display}
  <strong>{resource.medicationReference?.display}</strong>
  <br>
{/if}

{#if resource.reasonReference?.[0].display}
  {resource.reasonReference?.[0].display}<br>
{/if}

{#if resource.effectivePeriod?.start}
  Effective {resource.effectivePeriod.start}{resource.effectivePeriod.end
    ? ` - ${resource.effectivePeriod.end}`
    : ''}
{:else if resource.effectiveDateTime}
  {resource.effectiveDateTime ? `Effective date: ${resource.effectiveDateTime.split("T")[0]}` : ''}
{/if}

<Dosage dosage={resource.dosage?.[0]} />