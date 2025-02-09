<script lang="ts">
  import { Badge } from 'sveltestrap';
  import type { Goal } from 'fhir/r4';
  import type { ResourceTemplateParams } from '$lib/utils/types';

  export let content: ResourceTemplateParams<Goal>;

  let resource: Goal = content.resource;

  // Helper function to format dates as "DD-MMM-YYYY"
  function formatDate(dateStr: string): string {
    return dateStr.split("T")[0];
    // be consistent with how dates are rendered in the IPSViewer.
    // We may come back and use this function throughout
    // const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
    // const date = new Date(dateStr);
    // return date.toLocaleDateString('en-GB', options);
  }

  // Extract start and due dates
  let startDate = resource.startDate
    ? formatDate(resource.startDate)
    : resource.startCodeableConcept && resource.startCodeableConcept.text
    ? resource.startCodeableConcept.text
    : '??';

  // Get first available due date or duration from targets
  let dueDate = '??';
  if (resource.target && resource.target.length > 0) {
    const target = resource.target[0];
    if (target.dueDate) {
      dueDate = formatDate(target.dueDate);
    } else if (target.dueDuration) {
      dueDate = `in ${target.dueDuration.value} ${target.dueDuration.unit}`;
    }
  }
</script>

<!-- Display resource type and lifecycle status -->
<Badge color="primary">
  {`${resource.resourceType} (${resource.lifecycleStatus})`}
</Badge>

<!-- Display priority if available -->
<Badge color="primary">
  priority: 
  {#if resource.priority}
    {#if resource.priority.text}
      {resource.priority.text}
    {:else if resource.priority.coding}
      {#each resource.priority.coding as code}
        {code.system} : {code.code}
        {#if code.display}
          ({code.display})
        {/if}
      {/each}
    {/if}
  {:else}
    No available
  {/if}
</Badge>

<!-- Display achievementStatus if available -->
<Badge color="primary">
  Achievement:
  {#if resource.achievementStatus}
    {#if resource.achievementStatus.text}
      {resource.achievementStatus.text}
    {:else if resource.achievementStatus.coding}
      {#each resource.achievementStatus.coding as status}
        {status.system} : {status.code}
        {#if status.display}
          ({status.display})
        {/if}
      {/each}
    {/if}
  {:else}
    Not available
  {/if}
</Badge>

<br />

<!-- Display description --> 
{#if resource.description}
  {#if resource.description.text}
    <strong>{resource.description.text}</strong>
  {:else if resource.description.coding}
    {#each resource.description.coding as code}
      {code.system} : {code.code}
      {#if code.display}
        <strong>({code.display})</strong>
      {/if}
    {/each}
  {/if}
{:else}
  <em>No Description Provided</em>
{/if}

<!-- Display timeline -->
<br />
{#if startDate === '??' && dueDate === '??'}
  <em>No timeline available.</em>
{:else}
  <strong>Timeline:</strong> {startDate} ➔ {dueDate}
{/if}