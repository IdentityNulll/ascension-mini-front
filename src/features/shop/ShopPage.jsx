import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiShoppingCart, FiRotateCcw } from 'react-icons/fi';
import dayjs from '../../lib/dayjs';
import { selectMonth } from '../../app/monthSlice';
import {
  useGetShopItemsQuery, useGetPurchasesQuery, useBuyMutation,
  useDeleteShopItemMutation, useDeletePurchaseMutation, useGetBalanceQuery,
} from '../../app/api';
import { PageHeader, StatCard, EmptyState, Spinner } from '../../components/misc';
import Button from '../../components/Button';
import ConfirmDialog from '../../components/ConfirmDialog';
import ShopItemModal from './ShopItemModal';
import { xp } from '../../lib/format';

export default function ShopPage() {
  const month = useSelector(selectMonth);
  const today = dayjs().format('YYYY-MM-DD');
  const { data: items = [], isLoading } = useGetShopItemsQuery();
  const { data: purchases = [] } = useGetPurchasesQuery(month);
  const { data: balance } = useGetBalanceQuery();
  const [buy, { isLoading: buying }] = useBuyMutation();
  const [deleteItem, { isLoading: deleting }] = useDeleteShopItemMutation();
  const [deletePurchase] = useDeletePurchaseMutation();

  const [modalItem, setModalItem] = useState(undefined);
  const [confirm, setConfirm] = useState(null);

  const byItem = useMemo(() => {
    const m = {};
    for (const p of purchases) {
      const key = String(p.shopItemId);
      if (!m[key]) m[key] = { month: 0, today: 0, xp: 0 };
      m[key].month += 1;
      m[key].xp += p.xpSpent;
      if (p.date === today) m[key].today += 1;
    }
    return m;
  }, [purchases, today]);

  const spentToday = useMemo(
    () => purchases.filter((p) => p.date === today).reduce((s, p) => s + p.xpSpent, 0),
    [purchases, today]
  );
  const spentMonth = useMemo(() => purchases.reduce((s, p) => s + p.xpSpent, 0), [purchases]);
  const itemName = useMemo(() => Object.fromEntries(items.map((i) => [i._id, i.name])), [items]);

  const onBuy = async (item) => {
    try {
      await buy({ shopItemId: item._id, date: today }).unwrap();
      toast.success(`Bought ${item.name} — ${xp(item.xpCost)} XP`);
    } catch (e) {
      toast.error(e.message || 'Not enough XP');
    }
  };

  const onUndo = async (p) => {
    try {
      await deletePurchase(p._id).unwrap();
      toast.success('Purchase refunded');
    } catch (e) {
      toast.error(e.message || 'Failed');
    }
  };

  const onDeleteItem = async () => {
    try {
      await deleteItem(confirm._id).unwrap();
      toast.success('Reward removed');
      setConfirm(null);
    } catch (e) {
      toast.error(e.message || 'Failed');
    }
  };

  if (isLoading) return <Spinner />;

  return (
    <div>
      <PageHeader
        title="Shop"
        description="Spend earned XP on rewards. Purchases are recorded and deducted from your balance."
        actions={<Button variant="primary" icon={FiPlus} onClick={() => setModalItem(null)}>New reward</Button>}
      />

      <div className="grid grid-cols-3 gap-3 mb-4">
        <StatCard label="Spent today" value={xp(spentToday)} />
        <StatCard label="Spent this month" value={xp(spentMonth)} />
        <StatCard label="Remaining XP" value={xp(balance?.remaining ?? 0)} accent />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Rewards */}
        <div className="lg:col-span-2 panel overflow-hidden">
          <div className="px-3 h-10 flex items-center border-b border-line">
            <h2 className="text-xs font-semibold text-ink">Rewards</h2>
          </div>
          {items.length === 0 ? (
            <EmptyState
              title="No rewards yet"
              message="Add a reward you can buy with XP."
              action={<Button variant="primary" icon={FiPlus} onClick={() => setModalItem(null)}>New reward</Button>}
            />
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Reward</th>
                  <th className="text-right">XP cost</th>
                  <th className="text-right">Today</th>
                  <th className="text-right">This month</th>
                  <th className="text-right w-40">Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const stat = byItem[item._id] || { today: 0, month: 0 };
                  const affordable = (balance?.remaining ?? 0) >= item.xpCost;
                  return (
                    <tr key={item._id}>
                      <td>
                        <span className="font-medium text-ink">{item.name}</span>
                        {!item.active && <span className="badge bg-surface-raised text-ink-faint ml-2">inactive</span>}
                      </td>
                      <td className="text-right tabular text-ink-muted">{xp(item.xpCost)}</td>
                      <td className="text-right tabular">{stat.today || <span className="text-ink-faint">0</span>}</td>
                      <td className="text-right tabular">{stat.month || <span className="text-ink-faint">0</span>}</td>
                      <td className="text-right whitespace-nowrap">
                        <Button
                          variant="primary"
                          size="sm"
                          icon={FiShoppingCart}
                          onClick={() => onBuy(item)}
                          disabled={buying || !affordable}
                          title={affordable ? 'Buy for today' : 'Not enough XP'}
                        >
                          Buy
                        </Button>
                        <button className="btn btn-ghost btn-icon" onClick={() => setModalItem(item)} aria-label="Edit">
                          <FiEdit2 className="text-[14px]" />
                        </button>
                        <button className="btn btn-ghost btn-icon text-danger" onClick={() => setConfirm(item)} aria-label="Delete">
                          <FiTrash2 className="text-[14px]" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Purchase history */}
        <div className="panel overflow-hidden">
          <div className="px-3 h-10 flex items-center justify-between border-b border-line">
            <h2 className="text-xs font-semibold text-ink">Purchase history</h2>
            <span className="text-2xs text-ink-faint">{purchases.length} this month</span>
          </div>
          <div className="max-h-[420px] overflow-auto scroll-thin">
            {purchases.length === 0 ? (
              <p className="px-3 py-8 text-center text-xs text-ink-muted">No purchases this month.</p>
            ) : (
              <table className="data-table">
                <tbody>
                  {purchases.map((p) => (
                    <tr key={p._id} className="group">
                      <td className="text-ink-muted tabular whitespace-nowrap">{dayjs(p.date).format('MMM D')}</td>
                      <td className="text-ink">{itemName[p.shopItemId] || 'Removed reward'}</td>
                      <td className="text-right tabular text-danger">−{xp(p.xpSpent)}</td>
                      <td className="text-right w-8">
                        <button
                          className="btn btn-ghost btn-icon opacity-0 group-hover:opacity-100"
                          onClick={() => onUndo(p)}
                          title="Refund"
                          aria-label="Refund"
                        >
                          <FiRotateCcw className="text-[13px]" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <ShopItemModal open={modalItem !== undefined} item={modalItem || undefined} onClose={() => setModalItem(undefined)} />
      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={onDeleteItem}
        loading={deleting}
        title="Delete reward"
        message={`Remove "${confirm?.name}"? Past purchase history is kept.`}
      />
    </div>
  );
}
