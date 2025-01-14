import type { BundleEntry, DocumentReference, Resource } from 'fhir/r4';

export interface SHCFile {
  verifiableCredential: string[];
}

export interface ResourceTemplateParams<T> {
  resource: T;
  entries?: Array<BundleEntry> | Array<Resource> | undefined;
}

export interface DocumentReferencePOLST extends DocumentReference {
  pdfSignedDate?: string;
  
  isPolst?: boolean;

  isCpr?: boolean;
  doNotPerformCpr?: boolean;

  isComfortTreatments?: boolean;
  doNotPerformComfortTreatments?: boolean;
  typeComfortTreatments?: string;
  detailComfortTreatments?: string;

  isAdditionalTx?: boolean;
  doNotPerformAdditionalTx?: boolean;
  detailAdditionalTx?: string;

  isMedicallyAssisted?: boolean;
  doNotPerformMedicallyAssisted?: boolean;
  detailMedicallyAssisted?: string;
}

export type DocumentReferenceAD = DocumentReferencePOLST | DocumentReference;
