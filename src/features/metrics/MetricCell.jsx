import { FiCheck, FiX, FiMinus } from 'react-icons/fi';
import EditableCell from '../../components/EditableCell';

/**
 * A metric cell whose editor adapts to the metric type:
 *  number / time / rating -> numeric EditableCell
 *  text                   -> text EditableCell
 *  boolean                -> click cycles null -> true -> false -> null
 */
export default function MetricCell({ metric, value, onCommit, isToday }) {
  if (metric.type === 'boolean') {
    const cycle = () => {
      const next = value === true ? false : value === false ? null : true;
      onCommit(next);
    };
    const icon =
      value === true ? <FiCheck className="text-success" /> :
      value === false ? <FiX className="text-danger" /> :
      <FiMinus className="text-ink-faint" />;
    return (
      <td
        onClick={cycle}
        className={`px-3 py-1.5 border-b border-r border-line-strong text-center cursor-pointer hover:bg-accent-soft ${isToday ? 'bg-accent-soft/40' : ''}`}
        title="Click to toggle"
      >
        <span className="inline-flex items-center justify-center">{icon}</span>
      </td>
    );
  }

  const isNumeric = metric.type === 'number' || metric.type === 'time' || metric.type === 'rating';
  return (
    <EditableCell
      value={value}
      onCommit={onCommit}
      type={isNumeric ? 'number' : 'text'}
      align={isNumeric ? 'right' : 'left'}
      step={metric.type === 'rating' ? '1' : 'any'}
      min={metric.type === 'rating' ? '0' : '0'}
      highlight={isToday}
    />
  );
}
