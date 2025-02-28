<script lang="ts">
  import { formatDate } from '$lib/utils/util';
    import { Badge } from 'sveltestrap';
    import type { Observation } from "fhir/r4";
    import type { ResourceTemplateParams } from '$lib/utils/types';
    
    export let content: ResourceTemplateParams<Observation>; // Define a prop to pass the data to the component
    let resource: Observation = content.resource;
  </script>

  {#if resource.code.coding?.[0].code}
    {#if resource.code.coding[0].code === "74165-2"}
        <strong>Employment Status</strong>
        {#if resource.valueCodeableConcept?.coding?.[0].display}
            <br>{resource.valueCodeableConcept?.coding?.[0].display}
        {/if}
        <br>
        {#if resource.effectivePeriod?.start}
            {#if resource.effectivePeriod.end}
                From {formatDate(resource.effectivePeriod.start)} - {formatDate(resource.effectivePeriod.end)}
            {:else}
                Since {formatDate(resource.effectivePeriod.start)}
            {/if}
        {:else if resource.effectiveDateTime}
            Since {formatDate(resource.effectiveDateTime)}
        {/if}
    {:else if resource.code.coding[0].code === "87510-4"}
        <strong>Retirement Date</strong>
        {#if resource.valueDateTime}
            <br>{resource.valueDateTime}
        {/if}
        <br>
    {:else if resource.code.coding[0].code === "87511-2"}
        <strong>Combat Zone Period</strong>
        {#if resource.valuePeriod?.start}
            <br>
            {#if resource.valuePeriod.end}
                From {formatDate(resource.valuePeriod.start)} - {formatDate(resource.valuePeriod.end)}
            {:else}
                Since {formatDate(resource.valuePeriod.start)}
            {/if}
        {/if}
    {:else if resource.code.coding[0].code === "11341-5"}
        <strong>Job History</strong>
        {#if resource.effectivePeriod?.start}
            {#if resource.effectivePeriod.end}
                From {formatDate(resource.effectivePeriod.start)} - {formatDate(resource.effectivePeriod.end)}
            {:else}
                Since {formatDate(resource.effectivePeriod.start)}
            {/if}
        {:else if resource.effectiveDateTime}
            Since {formatDate(resource.effectiveDateTime)}
        {/if}
        {#if resource.valueCodeableConcept}
            {#if resource.valueCodeableConcept.coding}
                {#each resource.valueCodeableConcept.coding as coding}
                    <Badge color="primary">{coding.system} : {coding.code}</Badge>
                    <br />
                    {#if coding.display}
                        {coding.display}
                    {/if}
                {/each}
            {:else if resource.valueCodeableConcept.text}
                {resource.valueCodeableConcept.text}
            {/if}
        {/if}
        {#if resource.component}
            <br>
            {#each resource.component as component}
                <br>
                {#if component.valueCodeableConcept}
                    {#if component.valueCodeableConcept.coding}
                        {#each component.valueCodeableConcept.coding as coding}
                            <Badge color="primary">{coding.system} : {coding.code}</Badge>
                            <br />
                            {#if coding.display}
                                {coding.display}
                            {/if}
                        {/each}
                    {:else if component.valueCodeableConcept.text}
                        {component.valueCodeableConcept.text}
                    {/if}
                {/if}
                {#if component.valueQuantity && component.code?.coding}
                    {component.valueQuantity.value}{
                        component.valueQuantity.unit ?? ""
                    }{component.code.coding[0].code === "74160-3"
                        ?"/week"
                        : (component.code.coding[0].code === "87512-0"
                            ? "/day"
                            : "")}
                {/if}
                {#if component.valueString && component.code?.coding}
                    {component.code.coding[0].code === "87729-0"
                        ? "Hazard:"
                        : ""
                    }{component.valueString}
                {/if}
            {/each}
        {/if}
    <!-- {:else if resource.code.coding[0].code === "21843-8"} -->
        
    {/if}
  {/if}
  