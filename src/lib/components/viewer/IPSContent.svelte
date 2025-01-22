<script lang="ts">
  import {
    Accordion,
    AccordionItem,
    Button,
    ButtonGroup,
    Card,
    CardBody,
    Col,
    Icon,
    Offcanvas,
    Row,
  } from 'sveltestrap';
  import type {
    Bundle,
    Composition,
    CompositionSection,
    Resource
  } from "fhir/r4";
  import { download } from '$lib/utils/util.js';

  export let bundle: Bundle;
  export let mode: string;

  import AdvanceDirective from '$lib/components/resource-templates/AdvanceDirective.svelte';
  import AllergyIntolerance from '$lib/components/resource-templates/AllergyIntolerance.svelte';
  import Condition from '$lib/components/resource-templates/Condition.svelte';
  import Consent from '$lib/components/resource-templates/Consent.svelte';
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
    "Consent": Consent,
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
    if (bundle) {
      ipsContent = getIpsContent(bundle);
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

  let json = "";
  let resourceType = "";
  let isOpen = false;
  function setJson(resource:any) {
      json = JSON.stringify(resource, null, 2);
      resourceType = resource.resourceType;
      isOpen = true;
  }
  function toggle() {
      isOpen = !isOpen;
  }
</script>

<Offcanvas
    {isOpen}
    {toggle}
    scroll={false}
    header={resourceType + " JSON"}
    placement="end"
    title={resourceType + " JSON"}
    style="display: flex;  overflow-y:hidden; height: 100dvh;"
>
    <Row class="d-flex" style="height: 100%">
            <Row class="d-flex pe-0" style="height:calc(100% - 50px)">
                <Col class="d-flex pe-0" style="height:100%">
                    <div class="d-flex pe-0 pb-0 code-container">
                        <pre class="code"><code>{json}</code></pre>
                    </div>
                </Col>
            </Row>
            <Row class="d-flex pe-0" style="height:50px">
                <Col class="d-flex justify-content-start align-items-end" style="padding-top: 1rem">
                    <ButtonGroup>
                        <Button
                            size="sm"
                            color="primary"
                            on:click={() => navigator.clipboard.writeText(json)}
                        ><Icon name="clipboard" /> Copy</Button>
                        <Button
                            size="sm"
                            outline
                            color="secondary"
                            on:click={() => download(resourceType + ".json", json)}
                        ><Icon name="download" /> Download</Button>
                      </ButtonGroup>
                </Col>
            </Row>
    </Row>
</Offcanvas>

{#if showInfo}
  <Row class="text-info">{infoMessage}</Row>
{/if}
{#each Object.entries(ipsContent) as [title, sectionContent]}
<Row class="mx-0">
  <!--wrap in accordion with title-->
  <Accordion class="mt-3">
    <AccordionItem active class="ips-section">
      <h6 slot="header" class="my-2">{title}</h6>
      {#if sectionContent.useText || mode === "text"}
        {@html sectionContent.section.text?.div}
      {:else}
        <Card style="width: 100%; max-width: 100%" class="mb-2">
            {#each sectionContent.entries as resource, index}
              <CardBody class={index > 0 ? "border-top" : ""}>
                <Row style="overflow:hidden">
                  <Col>
                    {#if mode === "app" && resource.resourceType in components}
                      <svelte:component
                        this={components[resource.resourceType]}
                        content={{resource: resource, entries: bundle.entry}}
                      />
                    {:else}
                      {#if mode === "app"}
                        {showInfoMessage(`Unsupported sections displayed using composition narratives`)};
                      {/if}
                    {/if}
                  </Col>
                  <Col class="d-flex justify-content-end align-items-start" style="max-width:max-content">
                    <Button
                        size="sm"
                        color="secondary"
                        on:click={() => setJson(resource)}
                    >
                        View <Icon name="braces"/>
                    </Button>
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

  :global(.ips-section th) {
    border: 1px solid lightgray !important;
    padding: 0 7px !important;
    text-align: center !important;
  }

  :global(.ips-section td) {
    margin-left: 2em !important;
  }

  :global(.ips-section thead) {
    background-color: #0c63e4;
    color: white;
  }

  /* Alternating table row coloring */
  :global(.ips-section tbody tr:nth-child(odd)) {
    background-color: #fff;
    border: 1px solid lightgray;
  }
  :global(.ips-section tbody tr:nth-child(even)) {
    background-color: #e7f1ff;
    border: 1px solid lightgray;
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
    max-height: 50rem !important;
  }

  .code {
        overflow:auto;
        margin: 0;
        padding: 10px;
    }
    .code-container {
        background-color: #f5f5f5;
        border-radius: 10px;
        border: 1px solid rgb(200, 200, 200);
        overflow: hidden;
    }
    :global(div.offcanvas-body) {
        overflow-y: hidden !important;
    }
</style>