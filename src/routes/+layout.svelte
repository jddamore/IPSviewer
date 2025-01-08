<script lang="ts">
  import {
    Container,
    Styles
  } from 'sveltestrap';
  import { setContext } from 'svelte';
  import {writable } from 'svelte/store';

  const MODE_KEY = 'demo_mode';
  let mode = writable('normal');
  window.localStorage[MODE_KEY] ? mode.set(JSON.parse(window.localStorage[MODE_KEY])) : mode.set('normal');

  let isOpen = writable(false);
  setContext('isOpen', isOpen);
  function closeNav() {
    $isOpen = false;
  }

  let navOpening = false;
  document.addEventListener('click', (event) => {
    // Ignore clicks on the navbar toggler
    if (event.target?.className?.includes('navbar-toggler')) return;
    // Ignore clicks on the dropdown toggle menu items
    if (event.target?.className?.includes('nav-link') && event.target?.className?.includes('dropdown-toggle')) {
      navOpening = true;
      setTimeout(() => {
        navOpening = false;
      }, 100);
      return;
    }
    closeNav();
  });
  document.addEventListener('keydown', (event) => {
    closeNav();
  });

  window.addEventListener('scroll', (event) => {
    if (document.querySelector('.navbar-dropdown.show')?.matches(':hover')) return;
    if (document.getElementsByClassName('navbar-collapse collapsing')?.length > 0) return;
    if (navOpening) return;
    closeNav();
  });

  $: {
    if ($mode) window.localStorage[MODE_KEY] = JSON.stringify($mode);
  }

  setContext('mode', mode);

</script>

<Container class="main" fluid>
  <Styles />
  <slot />
</Container>

<style>
  :global(#nav-image) {
    width: 240px;
    -webkit-transition: all 0.06s linear;
    -moz-transition: all 0.06s linear;
    -o-transition: all 0.06s linear;
    transition: all 0.06s linear;
  }
  :global(.nav-text) {
    font-size:medium;
    -webkit-transition: all 0.06s linear;
    -moz-transition: all 0.06s linear;
    -o-transition: all 0.06s linear;
    transition: all 0.06s linear;
  }
  :global(.nav-link.scrolling) {
    padding-top: 0rem !important;
    padding-bottom: 0.25rem !important;
  }
  :global(#nav-image.scrolling) {
    width: 160px !important;
    margin-left: 10px;
  }
  :global(.nav-text.scrolling)  {
    font-size: xx-small;
    color: #000; /* Fallback for older browsers */
    color: rgba(0, 0, 0, 0.0);
  }
  :global(.navbar.scrolling) {
    padding: 0px !important;
  }

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
