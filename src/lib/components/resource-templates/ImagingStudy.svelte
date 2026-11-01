<script lang="ts">
  import { Badge } from 'sveltestrap';
  import type {
    BundleEntry,
    CodeableConcept,
    Coding,
    Endpoint,
    ImagingStudy,
    ImagingStudySeries,
    Reference
  } from 'fhir/r4';
  import type { ResourceTemplateParams } from '$lib/utils/types';
  import { formatDate, getEntry } from '$lib/utils/util';

  export let content: ResourceTemplateParams<ImagingStudy>; // Define a prop to pass the data to the component

  let resource: ImagingStudy = content.resource;

  // Common DICOM modality codes (http://dicom.nema.org/resources/ontology/DCM)
  const MODALITY_NAMES: Record<string, string> = {
    AR: 'Autorefraction',
    BMD: 'Bone Densitometry',
    CR: 'Computed Radiography',
    CT: 'Computed Tomography',
    DOC: 'Document',
    DX: 'Digital Radiography',
    ECG: 'Electrocardiography',
    ES: 'Endoscopy',
    GM: 'General Microscopy',
    IO: 'Intra-oral Radiography',
    IVUS: 'Intravascular Ultrasound',
    KO: 'Key Object Selection',
    MG: 'Mammography',
    MR: 'Magnetic Resonance',
    NM: 'Nuclear Medicine',
    OCT: 'Optical Coherence Tomography',
    OP: 'Ophthalmic Photography',
    OT: 'Other',
    PR: 'Presentation State',
    PT: 'Positron Emission Tomography (PET)',
    PX: 'Panoramic X-Ray',
    RF: 'Radiofluoroscopy',
    RG: 'Radiographic Imaging',
    RTIMAGE: 'RT Image',
    SEG: 'Segmentation',
    SM: 'Slide Microscopy',
    SR: 'Structured Report',
    US: 'Ultrasound',
    XA: 'X-Ray Angiography',
    XC: 'External-camera Photography'
  };

  // R4 uses Coding for modality; R5 uses CodeableConcept. Accept either.
  function modalityCoding(modality: Coding | CodeableConcept | undefined): Coding | undefined {
    if (!modality) return undefined;
    return 'coding' in modality ? modality.coding?.[0] : (modality as Coding);
  }

  function modalityLabel(modality: Coding | CodeableConcept | undefined): string {
    const coding = modalityCoding(modality);
    if (!coding?.code && !coding?.display) {
      return (modality as CodeableConcept)?.text ?? '';
    }
    const name = coding.display ?? (coding.code ? MODALITY_NAMES[coding.code.toUpperCase()] : undefined);
    if (coding.code && name && name !== coding.code) {
      return `${coding.code} (${name})`;
    }
    return coding.code ?? name ?? '';
  }

  function conceptLabel(concept: CodeableConcept | Coding | undefined): string {
    if (!concept) return '';
    if ('coding' in concept || 'text' in concept) {
      const cc = concept as CodeableConcept;
      return cc.text ?? cc.coding?.[0]?.display ?? cc.coding?.[0]?.code ?? '';
    }
    const coding = concept as Coding;
    return coding.display ?? coding.code ?? '';
  }

  function stripOid(uid: string | undefined): string {
    return (uid ?? '').replace(/^urn:oid:/i, '');
  }

  function resolveReference<T>(reference: Reference | undefined): T | undefined {
    if (!reference?.reference) return undefined;
    if (reference.reference.startsWith('#')) {
      const id = reference.reference.slice(1);
      return resource.contained?.find((r) => r.id === id) as T | undefined;
    }
    return getEntry(content.entries as BundleEntry[], reference.reference) as T | undefined;
  }

  function referenceLabel(reference: Reference | undefined): string {
    if (!reference) return '';
    if (reference.display) return reference.display;
    const target = resolveReference<any>(reference);
    if (target?.name) {
      // Practitioner/Organization/Location style names
      const name = Array.isArray(target.name) ? target.name[0] : target.name;
      if (typeof name === 'string') return name;
      if (name?.text) return name.text;
      const given = name?.given?.join(' ') ?? '';
      return [name?.prefix?.join(' '), given, name?.family].filter(Boolean).join(' ');
    }
    return reference.reference ?? '';
  }

  let studyUid: string | undefined;
  let accessionNumber: string | undefined;
  let modalities: string[] = [];
  let series: ImagingStudySeries[] = [];
  let seriesCount: number | undefined;
  let instanceCount: number | undefined;
  let endpoints: { name: string; address?: string }[] = [];

  $: {
    if (resource) {
      studyUid = stripOid(
        resource.identifier?.find((i) => i.system === 'urn:dicom:uid')?.value
      ) || undefined;
      accessionNumber = resource.identifier?.find((i) =>
        i.type?.coding?.some((c) => c.code === 'ACSN')
      )?.value;

      series = resource.series ?? [];
      const studyModalities = (resource.modality ?? []).map((m) => modalityLabel(m));
      const seriesModalities = series.map((s) => modalityLabel(s.modality));
      // De-duplicate, preferring study level modality list and falling back to series
      modalities = [...new Set((studyModalities.length ? studyModalities : seriesModalities).filter(Boolean))];

      seriesCount = resource.numberOfSeries ?? (series.length || undefined);
      instanceCount =
        resource.numberOfInstances ??
        (series.length
          ? series.reduce(
              (total, s) => total + (s.numberOfInstances ?? s.instance?.length ?? 0),
              0
            ) || undefined
          : undefined);

      endpoints = (resource.endpoint ?? []).map((ref) => {
        const endpoint = resolveReference<Endpoint>(ref);
        return {
          name: ref.display ?? endpoint?.name ?? endpoint?.connectionType?.display ?? 'Endpoint',
          address: endpoint?.address
        };
      });
    }
  }
</script>

{#each modalities as modality}
  <Badge color="primary" class="me-1">{modality}</Badge>
{/each}
{#if resource.status}
  <Badge color="secondary">{resource.status}</Badge>
{/if}
<br />
{#if resource.description}
  <strong>{resource.description}</strong><br />
{:else if resource.procedureCode?.length}
  <strong>{conceptLabel(resource.procedureCode[0])}</strong><br />
{:else}
  <strong>Imaging Study</strong><br />
{/if}
{#if resource.started}
  Started: {formatDate(resource.started)}<br />
{/if}
{#if seriesCount !== undefined || instanceCount !== undefined}
  {#if seriesCount !== undefined}Series: {seriesCount}{/if}{#if seriesCount !== undefined && instanceCount !== undefined},
  {/if}{#if instanceCount !== undefined}Instances: {instanceCount}{/if}<br />
{/if}
{#if resource.procedureCode?.length && resource.description}
  Procedure: {resource.procedureCode.map(conceptLabel).filter(Boolean).join(', ')}<br />
{/if}
{#if resource.reasonCode?.length}
  Reason: {resource.reasonCode.map(conceptLabel).filter(Boolean).join(', ')}<br />
{/if}
{#if resource.referrer}
  Referrer: {referenceLabel(resource.referrer)}<br />
{/if}
{#if resource.interpreter?.length}
  Interpreter: {resource.interpreter.map(referenceLabel).filter(Boolean).join(', ')}<br />
{/if}
{#if resource.location}
  Location: {referenceLabel(resource.location)}<br />
{/if}
{#if accessionNumber}
  Accession number: {accessionNumber}<br />
{/if}
{#if studyUid}
  Study Instance UID: <span class="uid">{studyUid}</span><br />
{/if}
{#each endpoints as endpoint}
  Endpoint: {endpoint.name}{#if endpoint.address}: <span class="uid">{endpoint.address}</span>{/if}<br />
{/each}
{#if resource.note?.length}
  {#each resource.note as note}
    {#if note.text}<i>{note.text}</i><br />{/if}
  {/each}
{/if}
{#if series.length > 0}
  <table class="table table-bordered table-sm mt-1 mb-0 series-table">
    <thead>
      <tr>
        <th>#</th>
        <th>Modality</th>
        <th>Description</th>
        <th>Body site</th>
        <th>Instances</th>
      </tr>
    </thead>
    <tbody>
      {#each series as s}
        <tr>
          <td>{s.number ?? ''}</td>
          <td>{modalityLabel(s.modality)}</td>
          <td>{s.description ?? ''}</td>
          <td>
            {conceptLabel(s.bodySite)}{#if s.laterality}{conceptLabel(s.bodySite) ? ', ' : ''}{conceptLabel(
                s.laterality
              )}{/if}
          </td>
          <td>{s.numberOfInstances ?? s.instance?.length ?? ''}</td>
        </tr>
      {/each}
    </tbody>
  </table>
{/if}

<style>
  /* Keep the header blue when nested in another table's tbody (e.g. inside a DiagnosticReport),
     where the section-wide zebra striping would otherwise paint the header row white */
  :global(.ips-section) table.series-table > thead > tr {
    background-color: #0c63e4;
  }
  .uid {
    font-family: monospace;
    word-break: break-all;
  }
</style>
