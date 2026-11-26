import { useEffect, useMemo, useState } from 'react'
import { CalendarBlank, CheckCircle, Heart, ListChecks, Money, Storefront, Users, Plus, Trash, X, GlobeHemisphereWest } from '@phosphor-icons/react'
import { useI18n } from './i18n'

type Guest = { id: string; name: string; side: string; status: string }
type Expense = { id: string; name: string; amount: number; category: string }
type Task = { id: string; text: string; due: string; done: boolean }
type Vendor = { id: string; name: string; type: string; contact: string }
type Details = { partnerA: string; partnerB: string; date: string; venue: string; budget: number }

const uid = () => Math.random().toString(36).slice(2, 10)
function load<T>(key: string, fallback: T): T { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) as T : fallback } catch { return fallback } }
function save(key: string, v: unknown) { try { localStorage.setItem(key, JSON.stringify(v)) } catch { /* ignore */ } }

export default function App() {
  const { lang, setLang, t } = useI18n('wedding-planner-lang')
  const [tab, setTab] = useState<'overview' | 'guests' | 'budget' | 'tasks' | 'vendors'>('overview')
  const [details, setDetails] = useState<Details>(() => load('wedding-details', { partnerA: '', partnerB: '', date: '', venue: '', budget: 0 }))
  const [detailsDraft, setDetailsDraft] = useState(details)
  const [savedMsg, setSavedMsg] = useState(false)
  const [guests, setGuests] = useState<Guest[]>(() => load('wedding-guests', []))
  const [expenses, setExpenses] = useState<Expense[]>(() => load('wedding-expenses', []))
  const [tasks, setTasks] = useState<Task[]>(() => load('wedding-tasks', []))
  const [vendors, setVendors] = useState<Vendor[]>(() => load('wedding-vendors', []))
  const [guestForm, setGuestForm] = useState({ name: '', side: 'both', status: 'invited' })
  const [guestSearch, setGuestSearch] = useState('')
  const [expForm, setExpForm] = useState({ name: '', amount: '', category: 'venue' })
  const [budgetInput, setBudgetInput] = useState('')
  const [taskForm, setTaskForm] = useState({ text: '', due: '' })
  const [vendorForm, setVendorForm] = useState({ name: '', type: '', contact: '' })

  useEffect(() => save('wedding-guests', guests), [guests])
  useEffect(() => save('wedding-expenses', expenses), [expenses])
  useEffect(() => save('wedding-tasks', tasks), [tasks])
  useEffect(() => save('wedding-vendors', vendors), [vendors])

  const spent = useMemo(() => expenses.reduce((a, e) => a + e.amount, 0), [expenses])
  const daysLeft = useMemo(() => {
    if (!details.date) return null
    const diff = Math.ceil((new Date(details.date + 'T00:00:00').getTime() - Date.now()) / 86400000)
    return diff
  }, [details.date])
  const confirmed = guests.filter((g) => g.status === 'confirmed').length
  const doneTasks = tasks.filter((x) => x.done).length
  const filteredGuests = guests.filter((g) => g.name.toLowerCase().includes(guestSearch.toLowerCase()))

  const saveDetails = () => { setDetails(detailsDraft); save('wedding-details', detailsDraft); setSavedMsg(true); setTimeout(() => setSavedMsg(false), 2000) }

  return (
    <div className="min-h-screen bg-white text-[#181818]">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:start-2 focus:bg-white focus:px-4 focus:py-2 focus:rounded-lg">Skip to content</a>
      <header className="sticky top-4 z-10 mx-auto max-w-6xl px-4">
        <nav className="flex items-center justify-between gap-4 rounded-2xl border border-[#e3e3e3] bg-white/90 px-4 py-3 shadow-sm backdrop-blur" aria-label="Main">
          <span className="title-1 flex items-center gap-2"><Heart size={22} className="text-[#be185d]" weight="fill" />{t('appName')}</span>
          <button type="button" onClick={() => setLang(lang === 'en' ? 'ar' : 'en')} className="button-sm flex items-center gap-2 rounded-xl border border-[#e3e3e3] px-3 py-2 motion-hover hover:bg-[#f5f5f5] active:scale-[0.98]"><GlobeHemisphereWest size={18} />{lang === 'en' ? t('langAr') : t('langEn')}</button>
        </nav>
      </header>
      <main id="main" className="mx-auto max-w-6xl px-4">
        <section className="py-16 md:py-24">
          <p className="caption-2 text-[#be185d]">{t('tagline')}</p>
          <h1 className="heading-1 hero-gradient mt-4 max-w-[680px]">{t('heroTitle')}</h1>
          <p className="body-3 mt-4 max-w-[680px] text-[#555555]">{t('heroSub')}</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <button type="button" onClick={() => { setTab('overview'); document.getElementById('planner')?.scrollIntoView({ behavior: 'smooth' }) }} className="button-md rounded-xl bg-[#be185d] px-3 py-2 text-white motion-hover hover:bg-[#9d174d] active:scale-[0.98]">{t('ctaStart')}</button>
            <button type="button" onClick={() => { setTab('guests'); document.getElementById('planner')?.scrollIntoView({ behavior: 'smooth' }) }} className="button-md rounded-xl border border-[#e3e3e3] px-3 py-2 motion-hover hover:bg-[#f5f5f5] active:scale-[0.98]">{t('ctaOverview')}</button>
          </div>
        </section>

        <section id="planner" className="pb-16">
          <div className="flex flex-wrap gap-2" role="tablist">
            {(['overview', 'guests', 'budget', 'tasks', 'vendors'] as const).map((tb) => (
              <button key={tb} type="button" role="tab" aria-selected={tab === tb} onClick={() => setTab(tb)} className={`button-sm rounded-xl px-3 py-2 motion-hover active:scale-[0.98] ${tab === tb ? 'bg-[#181818] text-white' : 'border border-[#e3e3e3] hover:bg-[#f5f5f5]'}`}>{t(`tab${tb.charAt(0).toUpperCase() + tb.slice(1)}`)}</button>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-[#e3e3e3] p-4 md:p-8">
            {tab === 'overview' && (
              <div>
                <h2 className="heading-5">{t('eventDetails')}</h2>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div><label htmlFor="p-a" className="title-4 block">{t('partnerA')}</label><input id="p-a" value={detailsDraft.partnerA} onChange={(e) => setDetailsDraft({ ...detailsDraft, partnerA: e.target.value })} placeholder={t('partnerAPh')} className="mt-2 w-full rounded-xl border border-[#e3e3e3] p-4 body-3" /></div>
                  <div><label htmlFor="p-b" className="title-4 block">{t('partnerB')}</label><input id="p-b" value={detailsDraft.partnerB} onChange={(e) => setDetailsDraft({ ...detailsDraft, partnerB: e.target.value })} placeholder={t('partnerBPh')} className="mt-2 w-full rounded-xl border border-[#e3e3e3] p-4 body-3" /></div>
                  <div><label htmlFor="w-date" className="title-4 block">{t('weddingDate')}</label><input id="w-date" type="date" value={detailsDraft.date} onChange={(e) => setDetailsDraft({ ...detailsDraft, date: e.target.value })} className="mt-2 w-full rounded-xl border border-[#e3e3e3] p-4 body-3" /></div>
                  <div><label htmlFor="w-venue" className="title-4 block">{t('venue')}</label><input id="w-venue" value={detailsDraft.venue} onChange={(e) => setDetailsDraft({ ...detailsDraft, venue: e.target.value })} placeholder={t('venuePh')} className="mt-2 w-full rounded-xl border border-[#e3e3e3] p-4 body-3" /></div>
                </div>
                <button type="button" onClick={saveDetails} className="button-md mt-4 rounded-xl bg-[#be185d] px-3 py-2 text-white motion-hover hover:bg-[#9d174d] active:scale-[0.98]">{t('saveDetails')}</button>
                {savedMsg && <p className="body-5 mt-2 text-[#be185d]" role="status">{t('saved')}</p>}
                <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
                  <div className="rounded-xl bg-[#fce7f3] p-4"><p className="caption-4 text-[#555555]"><CalendarBlank size={16} className="inline me-1" />{t('daysLeft')}</p><p className="heading-6 mt-2">{daysLeft === null ? '—' : Math.max(0, daysLeft)}</p></div>
                  <div className="rounded-xl bg-[#f5f5f5] p-4"><p className="caption-4 text-[#555555]"><Users size={16} className="inline me-1" />{t('guestsTotal')}</p><p className="heading-6 mt-2">{guests.length} · {confirmed} {t('confirmed')}</p></div>
                  <div className="rounded-xl bg-[#f5f5f5] p-4"><p className="caption-4 text-[#555555]"><Money size={16} className="inline me-1" />{t('spent')}</p><p className="heading-6 mt-2">{spent} / {details.budget || '—'}</p></div>
                  <div className="rounded-xl bg-[#f5f5f5] p-4"><p className="caption-4 text-[#555555]"><ListChecks size={16} className="inline me-1" />{t('tasksDone')}</p><p className="heading-6 mt-2">{doneTasks}/{tasks.length}</p></div>
                </div>
                {details.partnerA && details.partnerB && <p className="title-2 mt-8 text-center">{details.partnerA} ♥ {details.partnerB}{details.date ? ` · ${details.date}` : ''}{details.venue ? ` · ${details.venue}` : ''}</p>}
              </div>
            )}

            {tab === 'guests' && (
              <div>
                <h2 className="heading-5">{t('tabGuests')}</h2>
                <div className="mt-6 grid gap-4 md:grid-cols-[1fr_160px_160px_auto]">
                  <input value={guestForm.name} onChange={(e) => setGuestForm({ ...guestForm, name: e.target.value })} placeholder={t('guestNamePh')} className="rounded-xl border border-[#e3e3e3] p-4 body-3" aria-label={t('guestName')} />
                  <select value={guestForm.side} onChange={(e) => setGuestForm({ ...guestForm, side: e.target.value })} className="rounded-xl border border-[#e3e3e3] p-4 body-3 bg-white" aria-label={t('guestSide')}>
                    {['a', 'b', 'both'].map((s) => <option key={s} value={s}>{t(s === 'a' ? 'sideA' : s === 'b' ? 'sideB' : 'sideBoth')}</option>)}
                  </select>
                  <select value={guestForm.status} onChange={(e) => setGuestForm({ ...guestForm, status: e.target.value })} className="rounded-xl border border-[#e3e3e3] p-4 body-3 bg-white" aria-label={t('guestStatus')}>
                    {['invited', 'confirmed', 'declined'].map((s) => <option key={s} value={s}>{t(`status${s.charAt(0).toUpperCase() + s.slice(1)}`)}</option>)}
                  </select>
                  <button type="button" onClick={() => { if (!guestForm.name.trim()) return; setGuests((p) => [...p, { id: uid(), name: guestForm.name.trim(), side: guestForm.side, status: guestForm.status }]); setGuestForm({ name: '', side: 'both', status: 'invited' }) }} className="button-md flex items-center gap-2 rounded-xl bg-[#be185d] px-3 py-2 text-white motion-hover hover:bg-[#9d174d] active:scale-[0.98]"><Plus size={18} />{t('addGuest')}</button>
                </div>
                <input value={guestSearch} onChange={(e) => setGuestSearch(e.target.value)} placeholder={t('searchGuests')} className="mt-4 w-full rounded-xl border border-[#e3e3e3] p-4 body-3 md:max-w-sm" aria-label={t('searchGuests')} />
                <p className="caption-2 mt-4 text-[#555555]">{guests.length} {t('guestsTotal')} · {confirmed} {t('confirmed')} · {guests.filter((g) => g.status === 'invited').length} {t('pending')} · {guests.filter((g) => g.status === 'declined').length} {t('declined')}</p>
                {filteredGuests.length === 0 ? <p className="body-6 mt-4 rounded-xl bg-[#f5f5f5] p-4 text-[#555555]">{t('noGuests')}</p> : (
                  <ul className="mt-4 space-y-2">{filteredGuests.map((g) => (
                    <li key={g.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#e3e3e3] p-4">
                      <span className="body-3">{g.name} · <span className="caption-4 text-[#555555]">{t(g.side === 'a' ? 'sideA' : g.side === 'b' ? 'sideB' : 'sideBoth')}</span></span>
                      <span className="flex items-center gap-2">
                        <select value={g.status} onChange={(e) => setGuests((p) => p.map((x) => x.id === g.id ? { ...x, status: e.target.value } : x))} className="rounded-xl border border-[#e3e3e3] p-2 body-6 bg-white" aria-label={t('guestStatus')}>
                          {['invited', 'confirmed', 'declined'].map((s) => <option key={s} value={s}>{t(`status${s.charAt(0).toUpperCase() + s.slice(1)}`)}</option>)}
                        </select>
                        <button type="button" onClick={() => setGuests((p) => p.filter((x) => x.id !== g.id))} className="text-red-700" aria-label={t('remove')}><Trash size={18} /></button>
                      </span>
                    </li>))}</ul>
                )}
              </div>
            )}

            {tab === 'budget' && (
              <div>
                <h2 className="heading-5">{t('tabBudget')}</h2>
                <div className="mt-6 flex flex-wrap items-end gap-4">
                  <div><label htmlFor="budget-in" className="title-4 block">{t('setBudget')}</label><input id="budget-in" type="number" min="0" value={budgetInput} onChange={(e) => setBudgetInput(e.target.value)} placeholder={t('budgetPh')} className="mt-2 rounded-xl border border-[#e3e3e3] p-4 body-3" /></div>
                  <button type="button" onClick={() => { const v = Number(budgetInput); if (!v) return; const nd = { ...details, budget: v }; setDetails(nd); save('wedding-details', nd); setBudgetInput('') }} className="button-md rounded-xl bg-[#be185d] px-3 py-2 text-white motion-hover hover:bg-[#9d174d] active:scale-[0.98]">{t('setBudget')}</button>
                </div>
                <div className="mt-6 grid grid-cols-3 gap-4">
                  <div className="rounded-xl bg-[#f5f5f5] p-4"><p className="caption-4 text-[#555555]">{t('budgetTotal')}</p><p className="heading-6 mt-2">{details.budget || '—'}</p></div>
                  <div className="rounded-xl bg-[#f5f5f5] p-4"><p className="caption-4 text-[#555555]">{t('spent')}</p><p className="heading-6 mt-2">{spent}</p></div>
                  <div className="rounded-xl bg-[#fce7f3] p-4"><p className="caption-4 text-[#555555]">{t('remaining')}</p><p className="heading-6 mt-2">{Math.max(0, details.budget - spent)}</p></div>
                </div>
                <div className="mt-6 h-2 w-full rounded-full bg-[#e3e3e3]"><span className="block h-2 rounded-full bg-[#be185d] motion-base" style={{ width: `${details.budget ? Math.min(100, (spent / details.budget) * 100) : 0}%` }} /></div>
                <div className="mt-6 grid gap-4 md:grid-cols-[1fr_160px_160px_auto]">
                  <input value={expForm.name} onChange={(e) => setExpForm({ ...expForm, name: e.target.value })} placeholder={t('expenseNamePh')} className="rounded-xl border border-[#e3e3e3] p-4 body-3" aria-label={t('expenseName')} />
                  <input type="number" min="0" value={expForm.amount} onChange={(e) => setExpForm({ ...expForm, amount: e.target.value })} placeholder={t('expenseAmount')} className="rounded-xl border border-[#e3e3e3] p-4 body-3" aria-label={t('expenseAmount')} />
                  <select value={expForm.category} onChange={(e) => setExpForm({ ...expForm, category: e.target.value })} className="rounded-xl border border-[#e3e3e3] p-4 body-3 bg-white" aria-label={t('expenseCategory')}>
                    {['venue', 'food', 'dress', 'photo', 'music', 'other'].map((c) => <option key={c} value={c}>{t(`cat${c.charAt(0).toUpperCase() + c.slice(1)}`)}</option>)}
                  </select>
                  <button type="button" onClick={() => { if (!expForm.name.trim() || !expForm.amount) return; setExpenses((p) => [...p, { id: uid(), name: expForm.name.trim(), amount: Number(expForm.amount), category: expForm.category }]); setExpForm({ name: '', amount: '', category: 'venue' }) }} className="button-md rounded-xl bg-[#be185d] px-3 py-2 text-white motion-hover hover:bg-[#9d174d] active:scale-[0.98]">{t('addExpense')}</button>
                </div>
                {expenses.length === 0 ? <p className="body-6 mt-6 rounded-xl bg-[#f5f5f5] p-4 text-[#555555]">{t('noExpenses')}</p> : (
                  <ul className="mt-6 space-y-2">{expenses.map((e) => (
                    <li key={e.id} className="flex items-center justify-between gap-4 rounded-xl border border-[#e3e3e3] p-4">
                      <span className="body-3">{e.name} · <span className="caption-4 text-[#555555]">{t(`cat${e.category.charAt(0).toUpperCase() + e.category.slice(1)}`)}</span></span>
                      <span className="flex items-center gap-4"><span className="body-5">{e.amount}</span><button type="button" onClick={() => setExpenses((p) => p.filter((x) => x.id !== e.id))} className="text-red-700" aria-label={t('remove')}><X size={16} /></button></span>
                    </li>))}</ul>
                )}
              </div>
            )}

            {tab === 'tasks' && (
              <div>
                <h2 className="heading-5">{t('tabTasks')}</h2>
                <div className="mt-6 flex flex-wrap gap-2">
                  <input value={taskForm.text} onChange={(e) => setTaskForm({ ...taskForm, text: e.target.value })} placeholder={t('taskPh')} className="min-w-0 flex-1 rounded-xl border border-[#e3e3e3] p-4 body-3" aria-label={t('taskText')} />
                  <input type="date" value={taskForm.due} onChange={(e) => setTaskForm({ ...taskForm, due: e.target.value })} className="rounded-xl border border-[#e3e3e3] p-4 body-3" aria-label={t('taskDue')} />
                  <button type="button" onClick={() => { if (!taskForm.text.trim()) return; setTasks((p) => [...p, { id: uid(), text: taskForm.text.trim(), due: taskForm.due, done: false }]); setTaskForm({ text: '', due: '' }) }} className="button-md flex items-center gap-2 rounded-xl bg-[#be185d] px-3 py-2 text-white motion-hover hover:bg-[#9d174d] active:scale-[0.98]"><Plus size={18} />{t('addTask')}</button>
                </div>
                <p className="caption-2 mt-4 text-[#555555]">{doneTasks}/{tasks.length} · {t('taskDone')}</p>
                {tasks.length === 0 ? <p className="body-6 mt-4 rounded-xl bg-[#f5f5f5] p-4 text-[#555555]">{t('noTasks')}</p> : (
                  <ul className="mt-4 space-y-2">{tasks.map((tk) => (
                    <li key={tk.id}>
                      <label className="flex cursor-pointer items-center gap-4 rounded-xl border border-[#e3e3e3] p-4 motion-hover hover:bg-[#f5f5f5]">
                        <input type="checkbox" checked={tk.done} onChange={() => setTasks((p) => p.map((x) => x.id === tk.id ? { ...x, done: !x.done } : x))} className="h-5 w-5 accent-[#be185d]" />
                        <span className={`body-3 ${tk.done ? 'line-through text-[#555555]' : ''}`}>{tk.text}</span>
                        {tk.due && <span className="caption-4 ms-auto text-[#555555]">{tk.due}</span>}
                        {tk.done && <CheckCircle size={20} className="text-[#be185d]" weight="fill" />}
                        <button type="button" onClick={(e) => { e.preventDefault(); setTasks((p) => p.filter((x) => x.id !== tk.id)) }} className="text-red-700" aria-label={t('remove')}><Trash size={18} /></button>
                      </label>
                    </li>))}</ul>
                )}
              </div>
            )}

            {tab === 'vendors' && (
              <div>
                <h2 className="heading-5">{t('tabVendors')}</h2>
                <div className="mt-6 grid gap-4 md:grid-cols-[1fr_160px_1fr_auto]">
                  <input value={vendorForm.name} onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })} placeholder={t('vendorNamePh')} className="rounded-xl border border-[#e3e3e3] p-4 body-3" aria-label={t('vendorName')} />
                  <input value={vendorForm.type} onChange={(e) => setVendorForm({ ...vendorForm, type: e.target.value })} placeholder={t('vendorType')} className="rounded-xl border border-[#e3e3e3] p-4 body-3" aria-label={t('vendorType')} />
                  <input value={vendorForm.contact} onChange={(e) => setVendorForm({ ...vendorForm, contact: e.target.value })} placeholder={t('vendorContactPh')} className="rounded-xl border border-[#e3e3e3] p-4 body-3" aria-label={t('vendorContact')} />
                  <button type="button" onClick={() => { if (!vendorForm.name.trim()) return; setVendors((p) => [...p, { id: uid(), name: vendorForm.name.trim(), type: vendorForm.type.trim(), contact: vendorForm.contact.trim() }]); setVendorForm({ name: '', type: '', contact: '' }) }} className="button-md flex items-center gap-2 rounded-xl bg-[#be185d] px-3 py-2 text-white motion-hover hover:bg-[#9d174d] active:scale-[0.98]"><Storefront size={18} />{t('addVendor')}</button>
                </div>
                {vendors.length === 0 ? <p className="body-6 mt-6 rounded-xl bg-[#f5f5f5] p-4 text-[#555555]">{t('noVendors')}</p> : (
                  <ul className="mt-6 grid gap-4 md:grid-cols-2">{vendors.map((v) => (
                    <li key={v.id} className="flex items-start justify-between gap-4 rounded-xl border border-[#e3e3e3] p-4">
                      <div><p className="title-3">{v.name}</p><p className="body-6 mt-1 text-[#555555]">{v.type}</p><p className="body-6 mt-1 text-[#555555]" dir="ltr">{v.contact}</p></div>
                      <button type="button" onClick={() => setVendors((p) => p.filter((x) => x.id !== v.id))} className="text-red-700" aria-label={t('remove')}><Trash size={18} /></button>
                    </li>))}</ul>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
      <footer className="border-t border-[#e3e3e3] py-8">
        <p className="caption-2 mx-auto max-w-6xl px-4 text-[#555555]">{t('footerNote')}</p>
      </footer>
    </div>
  )
}
