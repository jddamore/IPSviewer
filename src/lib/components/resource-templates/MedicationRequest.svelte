<script lang="ts">
  import { Badge } from 'sveltestrap';
  import type { MedicationRequest } from "fhir/r4";
  import Dosage from '$lib/components/resource-templates/Dosage.svelte';
  
  export let resource: MedicationRequest; // Define a prop to pass the data to the component
</script>

<Badge color="secondary">{resource.intent ? resource.intent : ''}</Badge>
<Badge color={resource.status === "stopped" ? "secondary" : "primary"}>{resource.status ? `${resource.status}` : ''}</Badge>
<br>
{#if resource.medicationCodeableConcept}
    {#if resource.medicationCodeableConcept.coding}
        {#if resource.medicationCodeableConcept.coding[0].system && resource.medicationCodeableConcept.coding[0].code}
            <Badge color="primary">{resource.medicationCodeableConcept.coding[0].system} : {resource.medicationCodeableConcept.coding[0].code}</Badge>
            <br>
        {/if}
        {#if resource.medicationCodeableConcept.coding[0].display}
            <strong>{resource.medicationCodeableConcept.coding[0].display}</strong><br>
        {:else if resource.medicationCodeableConcept.text}
            <strong>{resource.medicationCodeableConcept.text}</strong><br>
        {/if}
    {:else if resource.medicationCodeableConcept.text}
        <strong>{resource.medicationCodeableConcept.text}</strong><br>
    {/if}
{/if}
{#if resource.dispenseRequest?.validityPeriod}
    Valid from {resource.dispenseRequest?.validityPeriod.start}{resource.dispenseRequest?.validityPeriod.end
    ? ` - ${resource.dispenseRequest?.validityPeriod.end}`
    : ''}
    <br>
{/if}

<Dosage dosage={resource.dosageInstruction?.[0]} />