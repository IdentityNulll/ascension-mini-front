import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import { Field, Input, Select } from '../../components/Field';
import { useCreateMetricMutation, useUpdateMetricMutation } from '../../app/api';

const TYPES = [
  { value: 'number', label: 'Number', hint: 'e.g. Water (liters), Weight (kg)' },
  { value: 'time', label: 'Time', hint: 'e.g. Sleep (hours), Screen Time' },
  { value: 'rating', label: 'Rating', hint: 'e.g. Mood /10, Focus /10' },
  { value: 'boolean', label: 'Yes / No', hint: 'e.g. Journaled, Meditated' },
  { value: 'text', label: 'Text', hint: 'e.g. a short daily note' },
];

export default function MetricModal({ open, onClose, metric }) {
  const isEdit = Boolean(metric);
  const [create, { isLoading: creating }] = useCreateMetricMutation();
  const [update, { isLoading: updating }] = useUpdateMetricMutation();
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();
  const type = watch('type');

  useEffect(() => {
    if (open) reset({ name: metric?.name || '', type: metric?.type || 'number', unit: metric?.unit || '', active: metric?.active ?? true });
  }, [open, metric, reset]);

  const onSubmit = async (values) => {
    try {
      if (isEdit) await update({ id: metric._id, ...values }).unwrap();
      else await create(values).unwrap();
      toast.success(isEdit ? 'Metric updated' : 'Metric added');
      onClose();
    } catch (e) {
      toast.error(e.message || 'Something went wrong');
    }
  };

  const hint = TYPES.find((t) => t.value === type)?.hint;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit metric' : 'New metric'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit(onSubmit)} disabled={creating || updating}>
            {isEdit ? 'Save changes' : 'Add metric'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Field label="Metric name" error={errors.name?.message}>
          <Input placeholder="e.g. Screen Time" {...register('name', { required: 'Name is required' })} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Type" hint={hint}>
            <Select {...register('type', { required: true })}>
              {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </Select>
          </Field>
          <Field label="Unit" hint="Optional (hours, kg, /10, L)">
            <Input placeholder="hours" disabled={type === 'boolean' || type === 'text'} {...register('unit')} />
          </Field>
        </div>
        <label className="flex items-center gap-2 text-sm text-ink-muted mt-1">
          <input type="checkbox" {...register('active')} className="accent-accent" />
          Active
        </label>
      </form>
    </Modal>
  );
}
