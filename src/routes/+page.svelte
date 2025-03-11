<script lang="ts">
  import { page } from "$app/stores";
  import {
    Col,
    TabContent,
    TabPane,
    Row,
  } from 'sveltestrap';
  import * as shlClient from '$lib/utils/shlClient.js';
  import { verify } from '$lib/utils/shcDecoder.js';
  import type { Bundle, Composition, Patient } from 'fhir/r4';
  
  import IPSContent from '$lib/components/viewer/IPSContent.svelte';
  import Demo from '$lib/components/viewer/Demo.svelte';
  
  import { SHOW_VIEWER_DEMO } from "$lib/config";
  import { type Writable } from "svelte/store";
  import { getContext } from 'svelte';

  let shlContents: Bundle[] = [];

  let loading: boolean;
  const shl = $page.url.hash.match(/shlink:\/.*/)?.[0];
  $: {
    if (shl) {
      try {
        loading = true;
        retrieve().then(() => loading = false);
      } catch (e) {
        console.error(e);
        setError("There was a problem loading this SMART Health Link. Please ensure the link is active before trying again.");
      }
    }
  }

  let displayMode: Writable<string> = getContext("displayMode");

  // Status display logic
  let status = "Retrieving contents...";
  let showStatus = true;

  $: {
    if (shlContents.length > 0) {
      setStatus("");
    }
  }
  function setStatus(message:string) {
    status = message;
    showStatus = message !== "";
  }
  // End status display logic

  // Error display and handling logic
  let showError = false;
  let errorMessage = "";

  function setError(message:string) {
    errorMessage = message;
    showError = message !== "";
  }
  // End error display and handling logic

  // Retrieving SHL
  async function retrieve(){
    const recipient = "WA Verify+ IPS Viewer";

    let passcode;
    const needPasscode = shlClient.flag({ shl }).includes('P');
    if (needPasscode) {
        passcode = prompt("Enter passcode for SMART Health Link");
    }
    let retrieveResult;
    try {
        retrieveResult = await shlClient.retrieve({
            shl,
            passcode,
            recipient
        });
    } catch (e) {
        // Retrieval succeeded, but there was an error parsing files, etc.
        console.log(e);
        throw Error("Content parsing error");
    }

    if (retrieveResult.error) {
        let errorMsg = "";
        if (retrieveResult.status) {
            if (retrieveResult.status === 404) {
                // Couldn't find the shl, or it's been deactivated
                const managerLink = `<a href="${new URL(import.meta.url).origin}/view/${shlClient.id({ shl })}">Manage or reactivate it here</a>`;
                errorMsg = `<p>The requested SHL does not exist or has been deactivated.</p><p>Are you the owner of this link? ${managerLink}</p>`;
            } else if (retrieveResult.status === 401) {
                // Failed the password requirement
                while (retrieveResult.status === 401) {
                    passcode = prompt(`Enter passcode for SMART Health Link ${retrieveResult.error.remainingAttempts !== undefined ? "\nAttempts remaining: "+retrieveResult.error.remainingAttempts : ""}`);
                    try {
                        retrieveResult = await shlClient.retrieve({
                            shl,
                            passcode,
                            recipient
                        });
                    } catch (e) {
                        // Retrieval succeeded, but there was an error parsing files etc.
                        console.log(e);
                        throw Error("Content parsing error");
                    }
                }
                if (retrieveResult.error) {
                    const managerLink = `<a href="${new URL(import.meta.url).origin}/view/${shlClient.id({ shl })}">Manage or reactivate it here</a>`;
                    errorMsg = `<p>The requested SHL has been deactivated due to too many failed password attempts.</p><p>Are you the owner of this link? ${managerLink}</p>`;
                }
            } else {
                errorMsg = retrieveResult.error;
            }
        }
        setError(errorMsg);
        return;
    }

    shlContents = [];
    if (retrieveResult.shcs) {
      const decoded = await Promise.all(retrieveResult.shcs.map(verify));
      const data = decoded.map((e) => e.fhirBundle);
      shlContents.concat(data);
    }
    if (retrieveResult.jsons) {
      shlContents.concat(retrieveResult.jsons);
    }
}
  // End retrieving SHL

  function getTabLabel(ipsContent: Bundle) {
    let tabName = "";
    let date = "";
    let name = "";

    if (ipsContent.entry) {
      for (const entry of ipsContent.entry) {
        if (entry.resource?.resourceType === "Patient") {
          const patient = entry.resource as Patient;
          if (patient.name?.[0].given?.[0]) {
            name = patient.name?.[0].given?.[0];
          }
          break;
        }
      }
      const composition = ipsContent.entry[0].resource as Composition;
      if (composition.date) {
        date = `(${composition.date.split('T')[0]})`;
      }
    }
    tabName = name ? `${name}'s Summary` : 'Your Summary';

    if (date) {
      tabName += ` ${date}`;
    }

    return tabName;
  }
  
</script>

<Row class="d-flex justify-content-start mx-0 pb-4">
  <Col class="d-flex justify-content-start align-items-center">
    
  </Col>
</Row>
{#if showError}
  <Row class="text-danger">
    {@html errorMessage}
  </Row>
{:else if loading}
  <Row id="ips-loader" class="mx-2">
    <Row>
      {@html status}
    </Row>
    <span class="loader"></span>
  </Row>
{:else if shlContents.length > 1 || SHOW_VIEWER_DEMO}
  <!-- Multiple tab/demo view -->
  <TabContent>
    {#each shlContents as contents, index}
      <TabPane class={`ips${index}`} tabId={`ips${index}`} active={index === 0} style="padding-top:10px">
        <span class="smart-tab" slot="tab">{getTabLabel(contents)}</span>
        <IPSContent bundle={contents} mode={$displayMode} />
      </TabPane>
    {/each}
    {#if SHOW_VIEWER_DEMO}
      <TabPane tabId="demo" active={shlContents.length === 0} style="padding-top:10px">
        <span class="demo-tab" slot="tab">IPS Demo</span>
        <Demo bundle={shlContents[0]} mode={$displayMode} />
      </TabPane>
    {/if}
  </TabContent>
{:else}
  <!-- Single tab view -->
  <IPSContent bundle={shlContents[0]} mode={$displayMode} />
{/if}

<style lang="css">
  :global(.loader) {
    width: 100%;
    height: 150px;
    margin: 40px;
    display: block;
    position: relative;
    background: #FFF;
    box-sizing: border-box;
  }
  :global(.loader::after) {
    content: '';  
    width: calc(100% - 30px);
    height: calc(100% - 30px);
    top: 15px;
    left: 15px;
    position: absolute;
    background-image: linear-gradient(100deg, transparent, rgba(255, 255, 255, 0.5) 50%, transparent 80%),
    linear-gradient(#DDD 56px, transparent 0), /* box 1 */
    linear-gradient(#DDD 24px, transparent 0), /* box 2 */
    linear-gradient(#DDD 18px, transparent 0), /* box 3 */
    linear-gradient(#DDD 66px, transparent 0); /* box 4 */
    background-repeat: no-repeat;
    background-size: 75px 130px, /* wave */
            55px 56px, /* box 1 */
            160px 30px, /* box 2 */
            220px 20px, /* box 3 */
            290px 56px; /* box 4 */
    background-position: 0% 0, /* box 1 */
              0px 0px, /* box 1 */
              70px 5px, /* box 1 */
              70px 38px, /* box 1 */
              0px 66px; /* box 1 */
    box-sizing: border-box;
    animation: animloader 1s linear infinite;
  }
  @keyframes -global-animloader {
    0% {
      background-position: 0% 0, 0 0, 70px 5px, 70px 38px, 0px 66px;
    }
    100% {
      background-position: 150% 0, 0 0, 70px 5px, 70px 38px, 0px 66px;
    }
  }
</style>