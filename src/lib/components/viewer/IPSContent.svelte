<script lang="ts">
  import {
    Accordion,
    AccordionItem,
    Card,
    CardBody,
    Col,
    Row,
  } from 'sveltestrap';
  import type {
    Bundle,
    Composition,
    CompositionSection,
    Resource
  } from "fhir/r4";

  export let content: Bundle;
  export let mode: string;

  import AdvanceDirective from '$lib/components/resource-templates/AdvanceDirective.svelte';
  import AllergyIntolerance from '$lib/components/resource-templates/AllergyIntolerance.svelte';
  import Condition from '$lib/components/resource-templates/Condition.svelte';
  import DiagnosticReport from '$lib/components/resource-templates/DiagnosticReport.svelte';
  import Encounter from '$lib/components/resource-templates/Encounter.svelte';
  import Immunization from '$lib/components/resource-templates/Immunization.svelte';
  import Location from '$lib/components/resource-templates/Location.svelte';
  import Medication from '$lib/components/resource-templates/Medication.svelte';
  import MedicationRequest from '$lib/components/resource-templates/MedicationRequest.svelte';
  import MedicationStatement from '$lib/components/resource-templates/MedicationStatement.svelte';
  import Observation from '$lib/components/resource-templates/Observation.svelte';
  import Organization from '$lib/components/resource-templates/Organization.svelte';
  import Patient from '$lib/components/resource-templates/Patient.svelte';
  import Practitioner from '$lib/components/resource-templates/Practitioner.svelte';
  import Procedure from '$lib/components/resource-templates/Procedure.svelte';
  import OccupationalData from '$lib/components/resource-templates/OccupationalData.svelte';

  const components: Record<string, any> = {
    "AllergyIntolerance": AllergyIntolerance,
    "Condition": Condition,
    "Consent": AdvanceDirective,
    "DiagnosticReport": DiagnosticReport,
    "DocumentReference": AdvanceDirective,
    "Encounter": Encounter,
    "Immunization": Immunization,
    "Location": Location,
    "Medication": Medication,
    "MedicationRequest": MedicationRequest,
    "MedicationStatement": MedicationStatement,
    "Observation": Observation,
    "Organization": Organization,
    "Patient": Patient,
    "Practitioner": Practitioner,
    "Procedure": Procedure,
    "Occupational Data": OccupationalData,
    "Advance Directives": AdvanceDirective
  };

  interface IpsContent {
    section: CompositionSection;
    entries: Resource[];
    useText: boolean;
  }

  let ipsContent: Record<string, IpsContent> = {};
  $: {
    if (content) {
      ipsContent = getIpsContent(content);
    }
  }

  function getIpsContent(ips: Bundle) {
    let content: Record<string, IpsContent> = {};
    // let entries = Object.fromEntries(ips.entry?.map((entry) => [entry.id, entry.resource]));
    let compositions = ips.entry?.filter((entry) => entry.resource?.resourceType === 'Composition');
    if (!compositions || !compositions[0]) {
      return content;
    }
    let composition = compositions[0].resource as Composition;
    composition.section?.forEach((section) => {
      let title = (section.title ?? section.code?.coding?.[0].display) ?? "[Untitled section]";
      let entries = section.entry?.map((entry) => {
          if (entry.reference) {
            return getEntry(ips, entry.reference) as Resource;
          }
        }).filter((entry) => entry !== undefined) ?? [];
      let useText = entries.filter((entry) => entry.resourceType in components).length === 0;

      let sectionContent = {
        section: section,
        entries: entries,
        useText: useText
      };
      content[title] = sectionContent;
    });

    return content;
  }

  // For machine-readable content, use the reference in the Composition.section.entry to retrieve resource from Bundle
  function getEntry(ips: Bundle, fullUrl: string) {
    var result;
    ips.entry?.forEach(function (entry) {
      if (entry.fullUrl?.includes(fullUrl)) {
        console.log(`match ${fullUrl}`);
        result = entry.resource;
      } else {
      // Attempt to match based on resource and uuid
        let newMatch = fullUrl
        if (entry.resource && entry.resource.resourceType) {
          // remove the resource from reference
          newMatch = newMatch.replace(entry.resource.resourceType, '');
          // remove slash
          newMatch = newMatch.replace(/\//g, '');
          // console.log(newMatch); 
        }
        if (entry.fullUrl?.includes(newMatch)) {
          console.log(`match uuid ${newMatch}`);
          result = entry.resource;
        }
      }
    });
    if (!result) {
      console.log(`missing reference ${fullUrl}`);
      result = {};
    }
    return result;
  };

  let showInfo = false;
  let infoMessage = "";

  function showInfoMessage(message:string) {
    infoMessage = message;
    showInfo = true;
  }

  function hideInfoMessage() {
    showInfo = false;
    infoMessage = "";
  }
</script>

{#if showInfo}
  <Row class="text-info">{infoMessage}</Row>
{/if}
{#each Object.entries(ipsContent) as [title, content]}
<Row class="mx-0">
  <!--wrap in accordion with title-->
  <Accordion class="mt-3">
    <AccordionItem active class="ips-section">
      <h6 slot="header" class="my-2">{title}</h6>
      {#if content.useText || mode === "text"}
        {@html content.section.text?.div}
      {:else}
        <Card style="width: 100%; max-width: 100%" class="mb-2">
            {#each content.entries as resource, index}
              <CardBody class={index > 0 ? "border-top" : ""}>
                <Row style="overflow:hidden">
                  <Col>
                    {#if mode === "app" && resource.resourceType in components}
                      <svelte:component
                        this={components[resource.resourceType]}
                        content={{resource: resource, entries: content.entries}}
                      />
                    {:else}
                      {#if mode === "app"}
                        {showInfoMessage(`Unsupported sections displayed using composition narratives`)};
                      {/if}
                    {/if}
                  </Col>
                </Row>
              </CardBody>
            {/each}
          </Card>
        {/if}
    </AccordionItem>
  </Accordion>
</Row>
{/each}

<style>
  /* Table styling */
  :global(.ips-section table) {
    border-collapse: collapse !important;
    width: 100% !important;
  }

  :global(.ips-section th, td) {
    border: 1px solid lightgray !important;
    padding: 0 7px !important;
    text-align: center !important;
  }

  :global(.ips-section thead) {
    background-color: #0c63e4;
    color: white;
  }

  /* Alternating table row coloring */
  :global(.ips-section tbody tr:nth-child(odd)) {
    background-color: #fff;
  }
  :global(.ips-section tbody tr:nth-child(even)) {
    background-color: #e7f1ff;
  }
  
  /* Sticky table header */
  :global(.ips-section th) {
    background: #0c63e4;
    position: sticky;
    top: -17px;
  }

  /* First column of generated table is usually most important */
  :global(.ips-section td:first-child) {
    font-weight: bold;
  }

  /* Limit height for section content window */
  :global(.ips-section > .accordion-collapse > .accordion-body) {
    overflow: auto !important;
    max-height: 40rem !important;
  }

</style>