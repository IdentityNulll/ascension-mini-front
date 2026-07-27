import { useEffect, useRef, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  FiPlus, FiTrash2, FiArrowUp, FiArrowDown, FiCheck, FiUser, FiInfo,
} from 'react-icons/fi';
import { useGetProfileQuery, useUpdateProfileMutation } from '../../app/api';
import { PageHeader, Spinner } from '../../components/misc';
import Button from '../../components/Button';
import NumberInput from '../../components/NumberInput';
import { Field, Input, Textarea } from '../../components/Field';

const uid = () => `k${Math.random().toString(36).slice(2, 10)}`;

const normalize = (d) => ({
  name: d.name || '',
  pronouns: d.pronouns || '',
  age: d.age ?? '',
  location: d.location || '',
  occupation: d.occupation || '',
  headline: d.headline || '',
  sections: (d.sections || []).map((s) => ({ _k: uid(), title: s.title || '', content: s.content || '' })),
});

const stripKeys = (f) => ({
  name: f.name,
  pronouns: f.pronouns,
  age: f.age === '' ? null : Number(f.age),
  location: f.location,
  occupation: f.occupation,
  headline: f.headline,
  sections: f.sections.map((s) => ({ title: s.title, content: s.content })),
});

export default function ProfilePage() {
  const { data, isLoading } = useGetProfileQuery();
  const [updateProfile] = useUpdateProfileMutation();

  const [form, setForm] = useState(null);
  const savedRef = useRef(null);
  const [status, setStatus] = useState('idle'); // idle | saving | saved | error

  // Initialize local state once from the server.
  useEffect(() => {
    if (data && !form) {
      const f = normalize(data);
      setForm(f);
      savedRef.current = JSON.stringify(stripKeys(f));
    }
  }, [data, form]);

  const dirty = form ? JSON.stringify(stripKeys(form)) !== savedRef.current : false;

  const save = useCallback(
    async (f) => {
      setStatus('saving');
      try {
        const payload = stripKeys(f);
        await updateProfile(payload).unwrap();
        savedRef.current = JSON.stringify(payload);
        setStatus('saved');
      } catch (e) {
        setStatus('error');
        toast.error(e.message || 'Could not save');
      }
    },
    [updateProfile]
  );

  // Debounced autosave.
  useEffect(() => {
    if (!form || !dirty) return undefined;
    const t = setTimeout(() => save(form), 900);
    return () => clearTimeout(t);
  }, [form, dirty, save]);

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    const h = (e) => {
      if (dirty || status === 'saving') {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [dirty, status]);

  const setField = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  const patchSection = (k, patch) =>
    setForm((f) => ({ ...f, sections: f.sections.map((s) => (s._k === k ? { ...s, ...patch } : s)) }));
  const deleteSection = (k) => setForm((f) => ({ ...f, sections: f.sections.filter((s) => s._k !== k) }));
  const addSection = () =>
    setForm((f) => ({ ...f, sections: [...f.sections, { _k: uid(), title: '', content: '' }] }));
  const move = (k, dir) =>
    setForm((f) => {
      const i = f.sections.findIndex((s) => s._k === k);
      const j = i + dir;
      if (j < 0 || j >= f.sections.length) return f;
      const arr = [...f.sections];
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return { ...f, sections: arr };
    });

  if (isLoading || !form) return <Spinner />;

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="About Me"
        description="Everything worth knowing about you. This becomes the foundation your future AI reads."
        actions={
          <div className="flex items-center gap-3">
            <SaveStatus status={status} dirty={dirty} />
            <Button variant="primary" icon={FiCheck} onClick={() => save(form)} disabled={!dirty && status !== 'error'}>
              Save now
            </Button>
          </div>
        }
      />

      <div className="mb-4 flex items-start gap-2 rounded-md border border-accent-border bg-accent-soft px-3 py-2 text-xs text-accent">
        <FiInfo className="mt-0.5 shrink-0 text-[14px]" />
        <span>Changes save automatically as you type. Write freely — the more real it is, the better it works later.</span>
      </div>

      {/* Basics */}
      <section className="panel p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <FiUser className="text-accent text-[16px]" />
          <h2 className="text-sm font-semibold text-ink">Basics</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3">
          <Field label="Name">
            <Input value={form.name} onChange={(e) => setField('name', e.target.value)} placeholder="Your name" />
          </Field>
          <Field label="Pronouns">
            <Input value={form.pronouns} onChange={(e) => setField('pronouns', e.target.value)} placeholder="e.g. he/him, she/her, they/them" />
          </Field>
          <Field label="Age">
            <NumberInput value={form.age} onChange={(v) => setField('age', v)} min={0} max={130} className="w-32" />
          </Field>
          <Field label="Location">
            <Input value={form.location} onChange={(e) => setField('location', e.target.value)} placeholder="City / country" />
          </Field>
          <div className="sm:col-span-2">
            <Field label="What you do">
              <Input value={form.occupation} onChange={(e) => setField('occupation', e.target.value)} placeholder="Student, developer, etc." />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="One-line summary" hint="A quick headline the assistant sees first.">
              <Textarea rows={2} value={form.headline} onChange={(e) => setField('headline', e.target.value)} placeholder="e.g. 19, trying to rebuild my discipline and become a self-taught developer." />
            </Field>
          </div>
        </div>
      </section>

      {/* Sections */}
      <div className="space-y-3">
        {form.sections.map((s, i) => (
          <section key={s._k} className="panel p-4">
            <div className="flex items-center gap-2 mb-2">
              <input
                value={s.title}
                onChange={(e) => patchSection(s._k, { title: e.target.value })}
                placeholder="Section title (e.g. Goals, Health, Story so far)"
                className="flex-1 bg-transparent outline-none text-sm font-semibold text-ink placeholder:text-ink-faint placeholder:font-normal focus:bg-accent-soft rounded px-1.5 -mx-1.5 py-0.5"
              />
              <div className="flex items-center shrink-0">
                <button className="btn btn-ghost btn-icon" onClick={() => move(s._k, -1)} disabled={i === 0} aria-label="Move up">
                  <FiArrowUp className="text-[14px]" />
                </button>
                <button className="btn btn-ghost btn-icon" onClick={() => move(s._k, 1)} disabled={i === form.sections.length - 1} aria-label="Move down">
                  <FiArrowDown className="text-[14px]" />
                </button>
                <button className="btn btn-ghost btn-icon text-danger" onClick={() => deleteSection(s._k)} aria-label="Delete section">
                  <FiTrash2 className="text-[14px]" />
                </button>
              </div>
            </div>
            <Textarea
              rows={5}
              value={s.content}
              onChange={(e) => patchSection(s._k, { content: e.target.value })}
              placeholder="Write everything relevant here…"
            />
          </section>
        ))}
      </div>

      <div className="mt-3">
        <Button variant="secondary" icon={FiPlus} onClick={addSection}>Add section</Button>
      </div>
    </div>
  );
}

function SaveStatus({ status, dirty }) {
  let text = '';
  let cls = 'text-ink-faint';
  if (status === 'saving') { text = 'Saving…'; cls = 'text-ink-muted'; }
  else if (dirty) { text = 'Unsaved changes'; cls = 'text-amber-600'; }
  else if (status === 'saved') { text = 'All changes saved'; cls = 'text-success'; }
  else if (status === 'error') { text = 'Save failed'; cls = 'text-danger'; }
  if (!text) return null;
  return <span className={`text-2xs font-medium ${cls}`}>{text}</span>;
}
