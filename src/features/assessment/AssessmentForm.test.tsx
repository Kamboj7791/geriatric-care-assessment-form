import { render, screen, userEvent } from '@test-utils';
import { AssessmentForm } from './AssessmentForm';
import { sampleAssessment } from './sampleAssessment';
import type { Assessment } from './schema';

describe('AssessmentForm', () => {
  it('saves the parsed sample patient', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn<(assessment: Assessment) => Promise<void>>().mockResolvedValue();
    render(<AssessmentForm onSave={onSave} />);

    await user.click(screen.getByRole('button', { name: 'Load sample patient' }));

    expect(screen.getByLabelText('Medical record number')).toHaveValue('MRN-004821');
    expect(screen.getByLabelText('Patient name')).toHaveValue('Sushila Deshpande');
    expect(screen.getByLabelText('Date of birth')).toHaveValue('March 12, 1949');
    expect(screen.getByLabelText('Assessment date')).toHaveValue('August 7, 2026');
    expect(screen.getByRole('combobox', { name: 'Mobility' })).toHaveValue('Cane');
    expect(screen.getByLabelText('Barthel Index')).toHaveValue('80');
    expect(screen.getByLabelText('Regular medications')).toHaveValue('3');
    expect(screen.getByLabelText('Pharmacist review requested')).not.toBeChecked();
    expect(screen.getByLabelText('Next review date')).toHaveValue('September 4, 2026');
    expect(screen.getByLabelText('Patient or representative has given consent')).toBeChecked();

    await user.click(screen.getByRole('button', { name: 'Save assessment' }));

    expect(await screen.findByText('Assessment saved')).toBeInTheDocument();
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith(sampleAssessment);
  });
});
