<!-- Submit data view w/ input box, "try a sample" button, link to sample list, clear, and submit buttons -->
<!-- Simple checks view -->
<!-- Link to validation -->
<script lang="ts">
  import {
    Button,
    Card,
    CardBody,
    CardHeader,
    Col,
    FormGroup,
    Icon,
    Input,
    Label,
    Row
  } from "sveltestrap";
  import { onMount } from "svelte";
  import type { Bundle } from "fhir/r4";
  import IpsContent from "$lib/components/viewer/IPSContent.svelte";

  export let bundle: Bundle | undefined;
  export let mode: string;

  let demoContent: string;

  onMount (() => {

  });

  $: {
    if (!bundle) {
      demoContent = "";
    } else {
      demoContent = JSON.stringify(bundle, null, 2);
    }
  }

  let textInput: string;
  $: textInput = demoContent;

  let checksResult: CheckResult | undefined;
  let error: string[] = [];
  let valid: boolean = true;
  let invalid: boolean = false;
  $: {
    if (textInput) {
      try {
        checksResult = checks(JSON.parse(textInput));
        if (checksResult.errors && checksResult.errors.length) {
          checksResult.errors.forEach(element => {
            setInputError(element);
          });
        } else {
          clearInputErrors();
        }
      } catch (e: any) {
        setInputError(e.message);
      }
    }
  }

  function setInputError(message: string) {
    valid = false;
    invalid = true;
    error.push(message);
  }

  function clearInputErrors() {
    valid = true;
    invalid = false;
    error = [];
  }

  async function loadSample() {
    let sample = await fetch('/samples/sample.json').then(function(response) {
        if (!response.ok) {
          // make the promise be rejected if we didn't get a 2xx response
          throw new Error("Unable to fetch IPS", {cause: response});
        } else {
          return response;
        }
      }).then(function(response) {
        if (!response.ok) {
          // make the promise be rejected if we didn't get a 2xx response
          throw new Error("Unable to fetch IPS", {cause: response});
        } else {
          return response.text();
        }
      }).then((text) => {
        return JSON.stringify(JSON.parse(text), null, 2);
      }).catch(function (e) {
        console.log("error", e);
      });
    if (sample) {
      textInput = sample;
      submit();
    }
  }

  function clear() {
    textInput = "";
  }

  let submitted = false;
  function submit() {
    try {
      bundle = JSON.parse(textInput);
      clearInputErrors();
      submitted = true;
      setTimeout(() => submitted = false, 2000);
    } catch (e: any) {
      setInputError(e.message);
    }
  }

  interface CheckResult {
    data: ValidationResult[];
    errors: string[];
  }
  interface ValidationResult {
    display?: string;
    entries?: number;
    entriesColor?: string;
    narrative?: string;
    narrativeColor?: string;
  };
  function checks(ips: Bundle) {
    let composition = ips.entry?.[0];
    let data = {
      data: [] as ValidationResult[],
      errors: [] as string[]
    };
    if (composition?.resource?.resourceType === "Composition" && composition.resource.section) {
      let sections = {
        allergies: false,
        medications: false,
        problems: false
      };
      for (let i = 0; i < composition.resource.section.length; i++) {
        let section = composition.resource.section[i]
        let newData = {} as ValidationResult;
        newData.display = section.title;
        if (section.code?.coding?.[0]?.code == "48765-2") sections.allergies = true;
        if (section.code?.coding?.[0]?.code == "10160-0") sections.medications = true;
        if (section.code?.coding?.[0]?.code == "11450-4") sections.problems = true;
        if (section.entry) {
          newData.entries =   section.entry.length;
          newData.entriesColor = "green";
        } else {
          newData.entries = 0;
          newData.entriesColor = "red";
        }
        if (section.text && section.text.div) {
          newData.narrative = "✓"
          newData.narrativeColor = "green";
        } else {
          newData.narrative = "✗"
          newData.narrativeColor = "red";
        }
        data.data.push(newData);
      }
      if (!sections.allergies) data.errors.push("Missing required allergies section");
      if (!sections.medications) data.errors.push("Missing required medications section");
      if (!sections.problems) data.errors.push("Missing required problems section");
    }
    return data;
  }

</script>
<Row class="px-3">
  <Col style="min-width: min-content">
    <Row>
      <h3>Submit Data</h3>
      <p>This is for test data only. <span class="text-danger"><strong>Please do not submit PHI.</strong></span></p>
      <FormGroup>
        <Label>Paste your IPS JSON here:</Label>
        <Input rows={8} type="textarea" bind:value={textInput} {valid} {invalid} feedback={error} class="pr-10"/>
      </FormGroup>
    </Row>
    <Row>
      <Col class="d-flex justify-content-start align-items-center">
        <Button class="m-1" color="danger" on:click={clear}>Clear</Button>
        <Button class="m-1" color="primary" on:click={submit}>Submit</Button>
        {#if submitted}
          <Icon name="check" class="text-success fs-5"/>
        {/if}
      </Col>
      <Col class="d-flex justify-content-end align-items-center">
        <Button color="success" on:click={loadSample} style="min-width:max-content; margin-right: 10px">Try a Sample</Button>
        <a href="https://github.com/jddamore/IPSviewer/tree/main/samples" class="m-1" target="_blank" rel="noreferrer">Repository of IPS Samples</a>
      </Col>
    </Row>
  </Col>
  <Col class="col-4 d-flex align-items-center" style="width: fit-content; min-width:min-content max-width:fit-content">
    {#if checksResult}
      <Card class="mt-4">
        <CardHeader>
          <span class="title"><b>Simple Data Checks</b> (not complete FHIR validation)</span>
        </CardHeader>
        <CardBody id="checks-body">
            <table class="checksTable">
              <colgroup>
                <col span="1" style="width: 50%;">
                <col span="1" style="width: 25%;">
                <col span="1" style="width: 25%;">
            </colgroup>
              <thead>
                <th>Section</th>
                <th class="tdCenter">Entries</th>
                <th class="tdCenter">Narrative</th>
              </thead>
              {#each checksResult.data as result}
              <tr>
                <td>{result.display}</td>
                <td class="tdCenter" style="color:{result.entriesColor}">{result.entries}</td>
                <td class="tdCenter" style="color:{result.narrativeColor}">{result.narrative}</td>
              </tr>
              {/each}
            </table>
            <ul class="list-group">
              {#each checksResult.errors as error}
              <li style="color:red">
                  {error}
              </li>
              {/each}
          </ul>  
        </CardBody>
      </Card>
    {/if}
  </Col>
</Row>

{#if bundle}
<Row>
  <IpsContent {bundle} {mode} />
</Row>
{/if}

<style>
  :global(textarea.form-control.is-valid, textarea.form-control.is-invalid) {
    background-position: top calc(.375em + .1875rem) right 1.5rem !important;
  }
</style>