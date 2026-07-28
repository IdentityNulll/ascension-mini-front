import { useMemo, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2, FiArrowUp, FiArrowDown, FiInfo } from 'react-icons/fi';
import {
  useGetCategoriesQuery, useCreateCategoryMutation, useUpdateCategoryMutation,
  useDeleteCategoryMutation, useReorderCategoriesMutation, useGetQuestsQuery,
} from '../../app/api';
import { PageHeader, Spinner } from '../../components/misc';
import Button from '../../components/Button';
import ConfirmDialog from '../../components/ConfirmDialog';
import { Input } from '../../components/Field';
import ColorPicker, { SWATCHES } from '../../components/ColorPicker';

export default function SettingsPage() {
  const { data: categories = [], isLoading } = useGetCategoriesQuery();
  const { data: quests = [] } = useGetQuestsQuery();
  const [createCat] = useCreateCategoryMutation();
  const [updateCat] = useUpdateCategoryMutation();
  const [deleteCat, { isLoading: deleting }] = useDeleteCategoryMutation();
  const [reorderCat] = useReorderCategoriesMutation();

  const [name, setName] = useState('');
  const [color, setColor] = useState(SWATCHES[0]);
  const [confirm, setConfirm] = useState(null);

  const questCount = useMemo(() => {
    const m = {};
    for (const q of quests) m[q.categoryId] = (m[q.categoryId] || 0) + 1;
    return m;
  }, [quests]);

  const add = async () => {
    if (!name.trim()) return;
    try {
      await createCat({ name: name.trim(), color }).unwrap();
      setName('');
      toast.success('Category added');
    } catch (e) {
      toast.error(e.message || 'Failed');
    }
  };

  const move = async (index, dir) => {
    const next = index + dir;
    if (next < 0 || next >= categories.length) return;
    const ids = categories.map((c) => c._id);
    [ids[index], ids[next]] = [ids[next], ids[index]];
    await reorderCat(ids);
  };

  const onDelete = async () => {
    try {
      await deleteCat(confirm._id).unwrap();
      toast.success('Category deleted');
      setConfirm(null);
    } catch (e) {
      toast.error(e.message || 'Failed');
      setConfirm(null);
    }
  };

  if (isLoading) return <Spinner />;

  return (
    <div className="max-w-3xl">
      <PageHeader title="Settings" description="Manage categories and configuration." />

      <div className="panel mb-4">
        <div className="px-4 h-11 flex items-center border-b border-line">
          <h2 className="text-xs font-semibold text-ink">Categories</h2>
        </div>

        {/* Add row */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-line bg-surface-subtle">
          <Input
            placeholder="New category name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && add()}
            className="!w-56"
          />
          <ColorPicker value={color} onChange={setColor} />
          <Button variant="primary" icon={FiPlus} onClick={add} className="ml-auto">Add</Button>
        </div>

        {/* List */}
        <table className="data-table">
          <thead>
            <tr>
              <th className="w-10" />
              <th>Category</th>
              <th className="text-right">Quests</th>
              <th className="text-right w-28">Order</th>
              <th className="text-right w-16" />
            </tr>
          </thead>
          <tbody>
            {categories.map((c, i) => (
              <CategoryRow
                key={c._id}
                category={c}
                count={questCount[c._id] || 0}
                isFirst={i === 0}
                isLast={i === categories.length - 1}
                onColor={(color) => updateCat({ id: c._id, name: c.name, color })}
                onRename={(name) => updateCat({ id: c._id, name, color: c.color })}
                onMoveUp={() => move(i, -1)}
                onMoveDown={() => move(i, 1)}
                onDelete={() => setConfirm(c)}
              />
            ))}
            {categories.length === 0 && (
              <tr><td colSpan={5} className="text-center text-ink-muted py-6">No categories yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="panel p-4">
        <div className="flex items-start gap-2">
          <FiInfo className="text-accent text-[16px] mt-0.5 shrink-0" />
          <div className="text-sm text-ink-muted space-y-1">
            <p className="text-ink font-medium">About reminders & data</p>
            <p>A daily reminder checks each evening whether you&apos;ve logged your quests and metrics. Adjust the time via <code className="text-2xs bg-surface-raised px-1 py-0.5 rounded">REMINDER_HOUR</code>/<code className="text-2xs bg-surface-raised px-1 py-0.5 rounded">REMINDER_MINUTE</code> in the server&apos;s <code className="text-2xs bg-surface-raised px-1 py-0.5 rounded">.env</code>.</p>
            <p>Quests, rewards, and metrics are added and edited from their own pages.</p>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={onDelete}
        loading={deleting}
        title="Delete category"
        message={`Delete "${confirm?.name}"? Categories with quests can't be deleted until those quests are moved or removed.`}
      />
    </div>
  );
}

/** One category row — controlled name input so the table always matches data. */
function CategoryRow({ category, count, isFirst, isLast, onColor, onRename, onMoveUp, onMoveDown, onDelete }) {
  const [name, setName] = useState(category.name);
  // Keep the input in sync when the underlying data changes (e.g. after reorder).
  useEffect(() => { setName(category.name); }, [category.name]);

  const commit = () => {
    const v = name.trim();
    if (v && v !== category.name) onRename(v);
    else if (!v) setName(category.name);
  };

  return (
    <tr>
      <td>
        <ColorPicker value={category.color} onChange={onColor} />
      </td>
      <td>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
          className="w-full bg-transparent outline-none font-medium text-ink focus:bg-accent-soft rounded px-1 -mx-1"
        />
      </td>
      <td className="text-right tabular text-ink-muted">{count}</td>
      <td className="text-right whitespace-nowrap">
        <button className="btn btn-ghost btn-icon" onClick={onMoveUp} disabled={isFirst} aria-label="Move up">
          <FiArrowUp className="text-[14px]" />
        </button>
        <button className="btn btn-ghost btn-icon" onClick={onMoveDown} disabled={isLast} aria-label="Move down">
          <FiArrowDown className="text-[14px]" />
        </button>
      </td>
      <td className="text-right">
        <button className="btn btn-ghost btn-icon text-danger" onClick={onDelete} aria-label="Delete">
          <FiTrash2 className="text-[14px]" />
        </button>
      </td>
    </tr>
  );
}
