import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import { Field, Input, Select } from '../../components/Field';
import {
  useCreateQuestMutation, useUpdateQuestMutation, useGetCategoriesQuery,
} from '../../app/api';

export default function QuestModal({ open, onClose, quest }) {
  const isEdit = Boolean(quest);
  const { data: categories = [] } = useGetCategoriesQuery();
  const [createQuest, { isLoading: creating }] = useCreateQuestMutation();
  const [updateQuest, { isLoading: updating }] = useUpdateQuestMutation();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (open) {
      reset({
        name: quest?.name || '',
        categoryId: quest?.categoryId || categories[0]?._id || '',
        xpPerSet: quest?.xpPerSet ?? 10,
        active: quest?.active ?? true,
      });
    }
  }, [open, quest, categories, reset]);

  const onSubmit = async (values) => {
    const payload = { ...values, xpPerSet: Number(values.xpPerSet) };
    try {
      if (isEdit) await updateQuest({ id: quest._id, ...payload }).unwrap();
      else await createQuest(payload).unwrap();
      toast.success(isEdit ? 'Quest updated' : 'Quest added');
      onClose();
    } catch (e) {
      toast.error(e.message || 'Something went wrong');
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit quest' : 'New quest'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit(onSubmit)} disabled={creating || updating}>
            {isEdit ? 'Save changes' : 'Add quest'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Field label="Quest name" error={errors.name?.message}>
          <Input placeholder="e.g. 25 Push-ups" {...register('name', { required: 'Name is required' })} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Category" error={errors.categoryId?.message}>
            <Select {...register('categoryId', { required: 'Pick a category' })}>
              {categories.length === 0 && <option value="">No categories — add one in Settings</option>}
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </Select>
          </Field>
          <Field label="XP per set" error={errors.xpPerSet?.message}>
            <Input type="number" min="0" step="1" {...register('xpPerSet', { required: 'Required', min: { value: 0, message: '≥ 0' } })} />
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
