import type { z } from 'zod';
import type { assessmentSchema } from './schema';

type AssessmentInput = z.input<typeof assessmentSchema>;

// Widen each schema input to what its Mantine input can hold before validation:
// NumberInput gives '' when cleared, DateInput and Select give null, checkboxes stay booleans
// (z.literal(true) widens to boolean so consent can start unchecked).
type FormValue<T> = T extends number ? T | string : T extends boolean ? boolean : T | null;

export type AssessmentFormValues = { [K in keyof AssessmentInput]: FormValue<AssessmentInput[K]> };

export const emptyAssessmentFormValues: AssessmentFormValues = {
  mrn: '',
  patientName: '',
  dateOfBirth: null,
  assessmentDate: null,
  mobility: null,
  barthelIndex: '',
  medicationCount: '',
  pharmacistReviewRequested: false,
  followUpDate: null,
  consentObtained: false,
};
