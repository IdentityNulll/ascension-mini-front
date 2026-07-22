import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import { Field, Input } from '../../components/Field';
import { useCreateShopItemMutation, useUpdateShopItemMutation } from '../../app/api';

export default function ShopItemModal({ open, onClose, item }) {
  const isEdit = Boolean(item);
  const [create, { isLoading: creating }] = useCreateShopItemMutation();
  const [update, { isLoading: updating }] = useUpdateShopItemMutation();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (open) reset({ name: item?.name || '', xpCost: item?.xpCost ?? 60, active: item?.active ?? true });
  }, [open, item, reset]);

  const onSubmit = async (values) => {
    const payload = { ...values, xpCost: Number(values.xpCost) };
    try {
      if (isEdit) await update({ id: item._id, ...payload }).unwrap();
      else await create(payload).unwrap();
      toast.success(isEdit ? 'Item updated' : 'Item added');
      onClose();
    } catch (e) {
      toast.error(e.message || 'Something went wrong');
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit reward' : 'New reward'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit(onSubmit)} disabled={creating || updating}>
            {isEdit ? 'Save changes' : 'Add reward'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Field label="Reward name" error={errors.name?.message}>
          <Input placeholder="e.g. Movie Night" {...register('name', { required: 'Name is required' })} />
        </Field>
        <Field label="XP cost" error={errors.xpCost?.message}>
          <Input type="number" min="0" step="1" {...register('xpCost', { required: 'Required', min: { value: 0, message: '≥ 0' } })} />
        </Field>
        <label className="flex items-center gap-2 text-sm text-ink-muted mt-1">
          <input type="checkbox" {...register('active')} className="accent-accent" />
          Active
        </label>
      </form>
    </Modal>
  );
}
