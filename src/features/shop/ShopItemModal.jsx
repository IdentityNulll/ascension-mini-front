import { useForm, Controller } from 'react-hook-form';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import NumberInput from '../../components/NumberInput';
import Toggle from '../../components/Toggle';
import { Field, Input } from '../../components/Field';
import { useCreateShopItemMutation, useUpdateShopItemMutation } from '../../app/api';

export default function ShopItemModal({ open, onClose, item }) {
  const isEdit = Boolean(item);
  const [create, { isLoading: creating }] = useCreateShopItemMutation();
  const [update, { isLoading: updating }] = useUpdateShopItemMutation();
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm();

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
          <Controller
            name="xpCost"
            control={control}
            rules={{ required: 'Required', min: { value: 0, message: '≥ 0' } }}
            render={({ field }) => (
              <NumberInput value={field.value} onChange={field.onChange} min={0} step={5} className="w-40" />
            )}
          />
        </Field>
        <Controller
          name="active"
          control={control}
          render={({ field }) => <Toggle checked={field.value} onChange={field.onChange} label="Active" />}
        />
      </form>
    </Modal>
  );
}
