import { useForm, Controller } from 'react-hook-form';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import Select from '../../components/Select';
import Toggle from '../../components/Toggle';
import { Field, Input } from '../../components/Field';
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
  const { register, handleSubmit, reset, control, watch, formState: { errors } } = useForm();
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
  const unitless = type === 'boolean' || type === 'text';

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
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onChange={field.onChange} options={TYPES} />
              )}
            />
          </Field>
          <Field label="Unit" hint={unitless ? 'Not used for this type' : 'Optional (hours, kg, /10, L)'}>
            <Input placeholder="hours" disabled={unitless} {...register('unit')} />
          </Field>
        </div>
        <Controller
          name="active"
          control={control}
          render={({ field }) => <Toggle checked={field.value} onChange={field.onChange} label="Active" />}
        />
      </form>
    </Modal>
  );
}
