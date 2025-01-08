<script lang="ts">
  import { getContext } from 'svelte';
  import {type Writable} from 'svelte/store';
  import {
    Col,
    Collapse,
    Image,
    Nav,
    Navbar,
    NavbarBrand,
    NavItem,
    NavLink,
    NavbarToggler,
    Row
  } from 'sveltestrap';
  import LanguageMenu from '$lib/components/layout/LanguageMenu.svelte';
  import Banner from '$lib/components/layout/Banner.svelte';
  import { VERSION_STRING } from '$lib/config';

  let mode: Writable<string> = getContext('mode');

  let isOpen = false;
  function handleUpdate(event: any) {
    isOpen = event.detail.isOpen;
  }
  function closeNav() {
    isOpen = false;
  }
</script>

<Navbar color="light" light expand="md" style="border-bottom: 1px solid rgb(204, 204, 204);">
  <NavbarBrand href="https://doh.wa.gov/" target="_blank">
    <Row>
      <Col>
        <Image
          id="nav-image"
          alt="Washington State Department of Health Logo"
          src="/img/doh_logo_doh-black.png"
        />
      </Col>
    </Row>
  </NavbarBrand>
  <NavbarToggler on:click={() => (isOpen = !isOpen)} />
  <Collapse {isOpen} navbar expand="md" on:update={handleUpdate}>
    <Nav class="ms-auto" navbar>
      <NavItem>
        <NavLink href="/home" on:click={closeNav}>Home</NavLink>
      </NavItem>
      <LanguageMenu />
    </Nav>
  </Collapse>
</Navbar>
<Banner title="International Patient Summary Viewer"/>
<Row class="main-row">
  <Col>
    <slot />
  </Col>
</Row>
<Row>
  <Col style="margin-top: 20px; padding: 20px; border-top: 1px solid rgb(204, 204, 204);" >
    <footer>
      This demonstration shows how to create a 
      <a
        target="_blank"
        rel="noreferrer"
        href="https://docs.smarthealthit.org/smart-health-links/user-stories"
      >
        SMART Health Link
      </a>
      for any FHIR
      <a href="https://build.fhir.org/ig/HL7/fhir-ips/" target="_blank" rel="noreferrer">
        International Patient Summary
      </a>
      document. SHLinks can be shared by copy/paste, or by presenting a QR code.
      {#if $mode === "advanced"}
        For more information, view the source code and license at
        <a href="https://github.com/uwcirg/shl-ips" target="_blank" rel="noreferrer">
          https://github.com/uwcirg/shl-ips
        </a>. {VERSION_STRING ? "Site version: " + VERSION_STRING : ""}
      {/if}
    </footer>
  </Col>
</Row>

<style>
  :global(.main-row) {
    flex-grow: 1;
  }

  :global(div.container-fluid.main) {
    min-height: 100%;
    margin-right: auto;
    margin-left: auto;
    max-width: 800px;
    display: flex;
    flex-direction: column;
  }
  :global(html, body) {
    height: 100%;
  }
  :global(.navbar .container-fluid) {
    padding: 0px;
  }
</style>
