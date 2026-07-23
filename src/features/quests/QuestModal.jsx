import { useForm, Controller } from 'react-hook-form';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import Select from '../../components/Select';
import NumberInput from '../../components/NumberInput';
import Toggle from '../../components/Toggle';
import { Field, Input } from '../../components/Field';
import {
  useCreateQuestMutation, useUpdateQuestMutation, useGetCategoriesQuery,
} from '../../app/api';

export default function QuestModal({ open, onClose, quest }) {
  const isEdit = Boolean(quest);
  const { data: categories = [] } = useGetCategoriesQuery();
  const [createQuest, { isLoading: creating }] = useCreateQuestMutation();
  const [updateQuest, { isLoading: updating }] = useUpdateQuestMutation();
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm();

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
            <Controller
              name="categoryId"
              control={control}
              rules={{ required: 'Pick a category' }}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onChange={field.onChange}
                  placeholder={categories.length ? 'Select category' : 'Add one in Settings'}
                  options={categories.map((c) => ({
                    value: c._id,
                    label: c.name,
                    icon: <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.color }} />,
                  }))}
                />
              )}
            />
          </Field>
          <Field label="XP per set" error={errors.xpPerSet?.message}>
            <Controller
              name="xpPerSet"
              control={control}
              rules={{ required: 'Required', min: { value: 0, message: '≥ 0' } }}
              render={({ field }) => (
                <NumberInput value={field.value} onChange={field.onChange} min={0} step={1} />
              )}
            />
          </Field>
        </div>
        <Controller
          name="active"
          control={control}
          render={({ field }) => (
            <Toggle checked={field.value} onChange={field.onChange} label="Active" />
          )}
        />
      </form>
    </Modal>
  );
}
