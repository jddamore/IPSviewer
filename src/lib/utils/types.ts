import type { DocumentReference } from 'fhir/r4';

export interface SHCFile {
  verifiableCredential: string[];
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
