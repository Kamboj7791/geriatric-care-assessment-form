import { assessmentSchema } from './schema';

const validAssessment = {
  mrn: 'MRN-004821',
  patientName: 'Sushila Deshpande',
  dateOfBirth: '1949-03-12',
  assessmentDate: '2026-08-07',
  mobility: 'cane',
  barthelIndex: 80,
  medicationCount: 3,
  pharmacistReviewRequested: false,
  followUpDate: '2026-09-04',
  consentObtained: true,
};

describe('assessmentSchema age boundary', () => {
  it('accepts a patient who turns 60 on the assessment date', () => {
    const result = assessmentSchema.safeParse({
      ...validAssessment,
      dateOfBirth: '1966-08-07',
    });

    expect(result.success).toBe(true);
  });

  it('rejects a patient one day short of 60, with the error on dateOfBirth', () => {
    const result = assessmentSchema.safeParse({
      ...validAssessment,
      dateOfBirth: '1966-08-08',
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues).toEqual([
      expect.objectContaining({
        path: ['dateOfBirth'],
        message: 'This pathway is for patients aged 60 and over',
      }),
    ]);
  });
});
