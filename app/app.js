// GroupBuy: a working group-buying app for one housing society.
// State lives in localStorage; neighbours joining is simulated so prices move while you watch.

const STORE = 'groupbuy:v2';
const HOUR = 3600e3, DAY = 24 * HOUR;

/* ---------------- Catalogue ---------------- */
// tiers: [flats needed, price per unit]. Photos are licensed stand-ins (see credits.html).
const PRODUCTS = [
  { id: 'mango', name: 'Alphonso mangoes', pack: 'Box of 12', unit: 'box', cat: 'fruit', origin: 'Devgad, Ratnagiri', from: 'An orchard in Devgad', img: 'f10183180', big: true, mrp: 1450, tiers: [[1, 1280], [20, 1160], [50, 1040]], lead: 2,
    about: 'GI-tagged Devgad Alphonso, picked mature and ripened in hay, never with carbide. Each box holds 12 fruit of 250 to 280 g.' },
  { id: 'basmati', name: 'Aged basmati rice', pack: '10 kg bag', unit: 'bag', cat: 'staples', origin: 'Karnal, Haryana', from: 'A rice mill in Karnal', img: 'f41139818', big: true, mrp: 1390, tiers: [[1, 1290], [20, 1180], [40, 1090]], lead: 2,
    about: '1121 basmati aged for 18 months, long grain that stays separate. Milled in Karnal and sealed in a woven bag.' },
  { id: 'toor', name: 'Unpolished toor dal', pack: '5 kg pack', unit: 'pack', cat: 'dal', origin: 'Latur, Maharashtra', from: 'A dal mill in Latur', img: 'f70613833', big: true, mrp: 905, tiers: [[1, 820], [15, 745], [35, 680]], lead: 2,
    about: 'Split pigeon peas with no oil, water or colour polish. Cooks soft in three whistles.' },
  { id: 'moong', name: 'Whole green moong', pack: '2 kg pack', unit: 'pack', cat: 'dal', origin: 'Nagaur, Rajasthan', from: 'Farmers in Nagaur', img: 'f97530683', big: true, mrp: 340, tiers: [[1, 300], [15, 270], [30, 245]], lead: 3,
    about: 'Small, glossy moong from the dry belt around Nagaur. Sprouts in a day.' },
  { id: 'ghee', name: 'A2 cow ghee', pack: '1 litre jar', unit: 'jar', cat: 'oils', origin: 'Rajkot, Gujarat', from: 'A Gir cow farm near Rajkot', img: 'f102569465', big: true, mrp: 1650, tiers: [[1, 1490], [12, 1360], [30, 1240]], lead: 3,
    about: 'Bilona ghee churned from curd of Gir cows. Granular, golden, in a glass jar.' },
  { id: 'atta', name: 'Sharbati chakki atta', pack: '10 kg bag', unit: 'bag', cat: 'staples', origin: 'Sehore, Madhya Pradesh', from: 'A chakki in Sehore', img: 'f19998799', big: true, mrp: 620, tiers: [[1, 560], [20, 510], [50, 465]], lead: 2,
    about: 'MP Sharbati wheat stone-ground the week it ships. Soft rotis that stay soft.' },
  { id: 'mustard', name: 'Kachi ghani mustard oil', pack: '5 litre can', unit: 'can', cat: 'oils', origin: 'Bharatpur, Rajasthan', from: 'A wood press in Bharatpur', img: 'f17426295', big: true, mrp: 1050, tiers: [[1, 940], [15, 870], [40, 795]], lead: 3,
    about: 'Cold-pressed in a wooden kolhu, filtered once, with the full pungency kept in.' },
  { id: 'onion', name: 'Nashik red onions', pack: '10 kg sack', unit: 'sack', cat: 'veg', origin: 'Lasalgaon, Nashik', from: 'Lasalgaon market', img: 'f134968592', big: true, mrp: 420, tiers: [[1, 360], [25, 320], [60, 285]], lead: 1,
    about: 'Rabi onions, dry-skinned and cured, bought at the Lasalgaon auction the day before dispatch.' },
  { id: 'tomato', name: 'Farm tomatoes', pack: '5 kg crate', unit: 'crate', cat: 'veg', origin: 'Kolar, Karnataka', from: 'Growers in Kolar', img: 'f190540617', big: true, mrp: 240, tiers: [[1, 210], [20, 180], [45, 160]], lead: 1,
    about: 'Picked half-ripe the evening before, so they turn red on your counter, not in a truck.' },
  { id: 'chilli', name: 'Green chillies', pack: '1 kg bag', unit: 'bag', cat: 'veg', origin: 'Chikkaballapur, Karnataka', from: 'A farm in Chikkaballapur', img: 'f102113126', big: true, mrp: 120, tiers: [[1, 100], [15, 85], [30, 75]], lead: 1,
    about: 'Medium-hot, thin-skinned chillies picked the morning they ship.' },
  { id: 'banana', name: 'Raw nendran bananas', pack: '3 kg hand', unit: 'hand', cat: 'fruit', origin: 'Thrissur, Kerala', from: 'Growers in Thrissur', img: 'f103665830', big: true, mrp: 270, tiers: [[1, 240], [15, 215], [30, 190]], lead: 2,
    about: 'For chips, avial and steaming. They ripen in four to five days if you keep them.' },
  { id: 'coconut', name: 'Tiptur coconuts', pack: 'Bag of 10', unit: 'bag', cat: 'fruit', origin: 'Tiptur, Karnataka', from: 'A grove in Tiptur', img: 'f114753360', big: true, mrp: 450, tiers: [[1, 400], [20, 360], [40, 320]], lead: 1,
    about: 'Mature coconuts with thick white flesh, about 450 g each with the husk off.' },
  { id: 'jaggery', name: 'Kolhapuri jaggery', pack: '2 kg block', unit: 'block', cat: 'pantry', origin: 'Kolhapur, Maharashtra', from: 'A gurhal in Kolhapur', img: 'f82026022', big: true, mrp: 260, tiers: [[1, 230], [15, 205], [30, 185]], lead: 3,
    about: 'Boiled in open pans with no chemical clarifier. Dark, crumbly and deep in flavour.' },
  { id: 'tea', name: 'Assam orthodox tea', pack: '1 kg pouch', unit: 'pouch', cat: 'pantry', origin: 'Dibrugarh, Assam', from: 'A tea estate in Dibrugarh', img: 'f22906482', big: true, mrp: 1200, tiers: [[1, 1080], [12, 980], [30, 890]], lead: 4,
    about: 'Second-flush whole leaf, malty and strong enough for milk tea. Packed at the estate.' },
  { id: 'cashew', name: 'W320 cashews', pack: '1 kg pack', unit: 'pack', cat: 'pantry', origin: 'Panruti, Tamil Nadu', from: 'A processor in Panruti', img: 'f110448899', big: true, mrp: 1150, tiers: [[1, 1040], [15, 950], [35, 870]], lead: 3,
    about: 'Whole white cashews, 320 to the pound, vacuum-packed in 500 g pouches.' },
  { id: 'turmeric', name: 'Lakadong turmeric', pack: '500 g jar', unit: 'jar', cat: 'pantry', origin: 'Jaintia Hills, Meghalaya', from: 'A farmer group in Lakadong', img: 'f163464684', big: true, mrp: 340, tiers: [[1, 300], [15, 270], [30, 240]], lead: 4,
    about: 'High-curcumin turmeric from the Jaintia Hills, sun-dried and ground in small lots.' },
  { id: 'honey', name: 'Wild forest honey', pack: '1 kg jar', unit: 'jar', cat: 'pantry', origin: 'Nilgiris, Tamil Nadu', from: 'Honey hunters in the Nilgiris', img: 'f186766788', big: false, mrp: 780, tiers: [[1, 700], [12, 640], [30, 580]], lead: 4,
    about: 'Raw, unheated multiflora honey collected from wild combs after the monsoon.' },
  { id: 'spices', name: 'Kerala whole spice set', pack: '6 × 100 g', unit: 'set', cat: 'pantry', origin: 'Idukki, Kerala', from: 'Growers in Idukki', img: 'f106327066', big: false, mrp: 690, tiers: [[1, 620], [15, 560], [30, 510]], lead: 4,
    about: 'Cardamom, pepper, cloves, cinnamon, nutmeg and star anise, from this season’s crop.' },
];
const PBY = Object.fromEntries(PRODUCTS.map(p => [p.id, p]));
const CATS = [
  { id: 'all', name: 'All' }, { id: 'fruit', name: 'Fruit' }, { id: 'veg', name: 'Vegetables' },
  { id: 'staples', name: 'Rice and atta' }, { id: 'dal', name: 'Dal' }, { id: 'oils', name: 'Oil and ghee' }, { id: 'pantry', name: 'Pantry' },
];

/* ---------------- Helpers ---------------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const inrF = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const inr = n => inrF.format(Math.round(n));
const intF = new Intl.NumberFormat('en-IN');
const plural = (n, one, many = one + 's') => `${intF.format(n)} ${n === 1 ? one : many}`;
const dayF = new Intl.DateTimeFormat('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
const wdF = new Intl.DateTimeFormat('en-IN', { weekday: 'short' });
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

function hourLabel(d) {
  const h = d.getHours(), m = d.getMinutes();
  if (h === 12 && m === 0) return 'noon';
  const hh = h % 12 || 12;
  return `${hh}${m ? ':' + String(m).padStart(2, '0') : ''} ${h < 12 ? 'am' : 'pm'}`;
}
function dayLabel(t) {
  const d = new Date(t), now = new Date();
  const a = new Date(now); a.setHours(0, 0, 0, 0);
  const b = new Date(d); b.setHours(0, 0, 0, 0);
  const diff = Math.round((b - a) / DAY);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  return dayF.format(d).replace(',', '');
}
const whenLabel = t => `${dayLabel(t)}, ${hourLabel(new Date(t))}`;
function deliveryLabel(g) {
  const d = new Date(g.closes + PBY[g.pid].lead * DAY); d.setHours(7, 0, 0, 0);
  return `${dayLabel(+d)}, 7 to 9 am`;
}
function left(ms) {
  if (ms <= 0) return 'Closed';
  const m = Math.floor(ms / 60e3), h = Math.floor(m / 60), d = Math.floor(h / 24);
  if (d >= 2) return `${d}d ${h % 24}h left`;
  if (h >= 1) return `${h}h ${String(m % 60).padStart(2, '0')}m left`;
  return `${Math.max(1, m)}m left`;
}
function clock(ms) {
  if (ms <= 0) return '00:00:00';
  const s = Math.floor(ms / 1000), h = Math.floor(s / 3600);
  return `${String(h).padStart(2, '0')}:${String(Math.floor(s / 60) % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}
function ago(t) {
  const s = (Date.now() - t) / 1000;
  if (s < 45) return 'now';
  if (s < 3600) return `${Math.round(s / 60)}m`;
  if (s < 86400) return `${Math.round(s / 3600)}h`;
  return wdF.format(new Date(t));
}
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const pickR = (r, a) => a[Math.floor(r() * a.length)];
function randFlat(r, taken) {
  for (let i = 0; i < 200; i++) {
    const f = `${pickR(r, 'ABCDEF')}-${1 + Math.floor(r() * 18)}${String(1 + Math.floor(r() * 4)).padStart(2, '0')}`;
    if (!taken.has(f)) return f;
  }
  return `G-${Math.floor(r() * 9000) + 100}`;
}
const tower = f => (f || '?')[0];

/* ---------------- Pricing ---------------- */
const count = g => g.members.length;
const tierIdx = (p, n) => { let i = 0; p.tiers.forEach(([min], k) => { if (n >= min) i = k; }); return i; };
const priceAt = (p, n) => p.tiers[tierIdx(p, Math.max(1, n))][1];
const priceNow = g => priceAt(PBY[g.pid], count(g));
const nextTier = (p, n) => p.tiers.find(([min]) => min > n) || null;
const topTier = p => p.tiers[p.tiers.length - 1];
const minFill = p => p.tiers[1][0]; // a group ships once it reaches its first drop; below that the UPI block is released
const pctOff = (p, price) => Math.round((1 - price / p.mrp) * 100);
const units = (p, q) => plural(q, p.unit, p.unit === 'box' ? 'boxes' : p.unit === 'hand' ? 'hands' : p.unit + 's');

/* ---------------- State ---------------- */
let S;
function seed() {
  const r = rng(20261112), now = Date.now();
  const spec = [
    ['mango', 46, 5.2, 'A-1503', 'Ordered from this orchard last May. Every box ripened within the week, not one bad fruit.'],
    ['basmati', 31, 30, 'A-702', 'Same mill as Diwali. Bags come sealed, so share them with family if 10 kg is a lot.', true],
    ['onion', 41, 20, 'E-203', ''],
    ['tomato', 19, 3.4, 'F-302', 'Crates come to the clubhouse by 8 am, pick up before office.'],
    ['coconut', 14, 8, 'F-1104', ''],
    ['atta', 22, 44, 'D-404', 'Fresh grind. Keep it in a steel dabba and it lasts two months.'],
    ['cashew', 27, 26, 'C-901', ''],
    ['mustard', 33, 50, 'A-1006', 'Strong, the real thing. Heat it till it smokes before you cook.'],
    ['toor', 18, 52, 'D-1101', ''],
    ['jaggery', 12, 75, 'B-208', ''],
    ['ghee', 9, 70, 'C-305', 'I have bought from this farm for two years. Smells like home-made.'],
    ['tea', 6, 96, 'E-1601', ''],
  ];
  const groups = spec.map(([pid, n, hrs, by, note, mine], i) => {
    const opened = now - (12 + r() * 60) * HOUR;
    const taken = new Set(['B-1204', by]);
    const members = [{ f: by, q: 1 + Math.floor(r() * 2), t: opened }];
    for (let k = 1; k < n; k++) {
      const f = randFlat(r, taken); taken.add(f);
      members.push({ f, q: r() < .72 ? 1 : r() < .7 ? 2 : 3, t: opened + (now - opened) * Math.pow(k / n, .8) - r() * HOUR * .5 });
    }
    members.sort((a, b) => a.t - b.t);
    if (mine) { const at = now - 9 * HOUR; members.splice(members.findIndex(m => m.t > at), 0, { f: 'B-1204', q: 1, t: at, me: true }); members.pop(); }
    const g = { id: 'g' + (i + 1), pid, by, opened, closes: new Date(now + hrs * HOUR + HOUR / 2).setMinutes(0, 0, 0), note, status: 'open', members, events: [], seed: true };
    g.events = buildEvents(g);
    return g;
  });
  const bas = groups.find(g => g.pid === 'basmati');
  const myLine = bas.members.find(m => m.me);
  const nAt = bas.members.indexOf(myLine) + 1;
  return {
    v: 2, seq: 1, me: { flat: 'B-1204', name: '', pay: 'gpay', upi: '' },
    groups, basket: [],
    orders: [{ id: 'GB-48207', at: myLine.t, items: [{ gid: bas.id, q: 1, price: priceAt(PBY.basmati, nAt) }], method: 'Google Pay', flat: 'B-1204' }],
    ui: { cat: 'all', q: '', sort: 'closing' },
  };
}
function buildEvents(g) {
  const p = PBY[g.pid], ev = [{ t: g.opened, type: 'open', f: g.by }];
  g.members.forEach((m, i) => {
    if (i > 0) ev.push({ t: m.t, type: 'join', f: m.f, q: m.q, me: m.me });
    const ti = p.tiers.findIndex(([min]) => min === i + 1);
    if (ti > 0) ev.push({ t: m.t + 1, type: 'drop', price: p.tiers[ti][1], n: i + 1 });
  });
  return ev;
}
function load() {
  try { S = JSON.parse(localStorage.getItem(STORE)); } catch { S = null; }
  if (!S || S.v !== 2) S = seed();
  // seeded groups roll forward a day at a time so the demo never runs dry
  const now = Date.now();
  S.groups.forEach(g => {
    if (g.seed && g.status === 'open' && g.closes < now + HOUR) g.closes += Math.ceil((now + HOUR - g.closes) / DAY) * DAY;
  });
  S.ui ||= { cat: 'all', q: '', sort: 'closing' };
  save();
}
function save() { try { localStorage.setItem(STORE, JSON.stringify(S)); } catch {} }
const G = id => S.groups.find(g => g.id === id);
const myLine = g => g.members.find(m => m.me);
const inBasket = gid => S.basket.find(b => b.gid === gid);
const openGroups = () => S.groups.filter(g => g.status === 'open');

/* ---------------- Icons ---------------- */
const I = {
  clock: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><circle cx="8" cy="8" r="6"/><path d="M8 4.8V8l2.2 1.4"/></svg>',
  arrow: '<svg class="arr" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.5 8h10M8.5 4l4 4-4 4"/></svg>',
  back: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13.5 8h-10M7.5 4l-4 4 4 4"/></svg>',
  plus: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M8 3v10M3 8h10"/></svg>',
  minus: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M3 8h10"/></svg>',
  close: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8"/></svg>',
  search: '<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><circle cx="8" cy="8" r="5.5"/><path d="m12.2 12.2 3.6 3.6"/></svg>',
  chev: '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 5.5 7 9l3.5-3.5"/></svg>',
  down: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 5h3.5l3 6.5L12.5 8H17"/><path d="M14.5 5.5 17 8l-2.5 2.5"/></svg>',
  lock: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="7" width="10" height="7" rx="2"/><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2"/></svg>',
  gate: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 21V8l9-5 9 5v13"/><path d="M8 21v-8h8v8M12 13v8"/></svg>',
  check: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3.5 8.5 3 3 6-7"/></svg>',
  people: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><circle cx="6" cy="5.5" r="2.3"/><path d="M1.8 13c.5-2.2 2.2-3.4 4.2-3.4s3.7 1.2 4.2 3.4"/><path d="M10.5 3.4a2.3 2.3 0 0 1 0 4.4M12 9.8c1.2.4 2 1.6 2.3 3.2"/></svg>',
};
const avatar = (f, me) => `<span class="av${me ? ' av--me' : ''}" data-t="${esc(tower(f))}" aria-hidden="true">${esc(f)}</span>`;

function photo(p, sizes = '(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 33vw', eager = false) {
  const base = `assets/img/photo-${p.img}`;
  const srcset = p.big ? `${base}-500.jpg 500w, ${base}-960.jpg 960w` : `${base}-500.jpg 500w`;
  return `<img src="${base}-500.jpg" srcset="${srcset}" sizes="${sizes}" width="960" height="720" alt="${esc(p.name)}, ${esc(p.pack.toLowerCase())}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" data-source="stand-in">`;
}

/* ---------------- Visual parts ---------------- */
function tierBar(g) {
  const p = PBY[g.pid], n = count(g), top = topTier(p)[0];
  const x = v => Math.min(100, v / top * 100);
  const ticks = p.tiers.slice(1).map(([min]) => `<span class="tiers__tick${n >= min ? ' hit' : ''}" style="left:${x(min)}%"></span>`).join('');
  const labels = p.tiers.map(([min, pr], i) => {
    const cls = [i === 0 ? 'first' : '', x(min) >= 99 ? 'last' : '', tierIdx(p, n) === i ? 'hit' : ''].join(' ').trim();
    return `<span class="${cls}" style="${i ? `left:${x(min)}%` : ''}">${inr(pr)}${i ? ` <span class="sr">at ${min} flats</span>` : ''}</span>`;
  }).join('');
  return `<div class="tiers__track" role="img" aria-label="${n} of ${top} flats joined"><div class="tiers__fill" style="width:${x(n)}%"></div>${ticks}</div><div class="tiers__labels" aria-hidden="true">${labels}</div>`;
}

function stair(g, opts = {}) {
  const p = PBY[g.pid], n = opts.n ?? count(g);
  const W = innerWidth < 640 ? 360 : 480, H = 224, T = 62, B = 30;
  const top = topTier(p)[0], xmax = Math.ceil(top * 1.18);
  const pr = p.tiers.map(t => t[1]), ymax = pr[0], ymin = pr[pr.length - 1];
  const X = v => Math.min(W, v / xmax * W), Y = v => T + (ymax - v) / (ymax - ymin || 1) * (H - T - B - 18);
  let d = `M0 ${Y(pr[0])}`;
  p.tiers.forEach(([min, price], i) => { if (i) d += ` H${X(min)} V${Y(price)}`; });
  d += ` H${W}`;
  const base = H - B;
  const area = `${d} V${base} H0 Z`;
  const cid = 'c' + Math.random().toString(36).slice(2, 8);
  const xn = X(Math.max(1, n)), yn = Y(priceAt(p, n));
  const labels = p.tiers.map(([min, price], i) => {
    const xs = i ? X(min) : 0, reached = n >= min;
    return `<text class="s-price${reached ? '' : ' dim'}" x="${xs + (i ? 8 : 0)}" y="${Y(price) - 10}">${inr(price)}</text>
      ${i ? `<line class="s-grid" x1="${xs}" x2="${xs}" y1="${Y(price)}" y2="${base}"/><text class="s-at" x="${xs}" y="${H - 8}" text-anchor="middle">${min}</text>` : `<text class="s-at" x="0" y="${H - 8}">1 flat</text>`}`;
  }).join('');
  const pill = opts.label ?? `${n} flats now`;
  const pw = pill.length * 7.4 + 20, px = Math.max(0, Math.min(W - pw, xn - pw / 2));
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Price by group size: ${p.tiers.map(([m, v]) => `${inr(v)} from ${m} ${m === 1 ? 'flat' : 'flats'}`).join(', ')}. ${n} joined, ${inr(priceAt(p, n))} each now.">
    <defs><clipPath id="${cid}"><rect x="0" y="0" width="${xn}" height="${H}"/></clipPath></defs>
    <line class="s-grid" x1="0" x2="${W}" y1="${base}" y2="${base}"/>
    <path class="s-area" d="${area}"/>
    <path class="s-area-done" d="${area}" clip-path="url(#${cid})"/>
    <path class="s-line" d="${d}"/>
    <path class="s-line-done" d="${d}" clip-path="url(#${cid})"/>
    ${labels}
    <line class="s-now" x1="${xn}" x2="${xn}" y1="30" y2="${base}"/>
    <rect class="s-you-bg" x="${px}" y="6" width="${pw}" height="24" rx="12"/>
    <text class="s-you" x="${px + pw / 2}" y="22" text-anchor="middle">${esc(pill)}</text>
    ${reduced ? '' : `<circle class="s-dot-ring" cx="${xn}" cy="${yn}" r="7"/>`}
    <circle class="s-dot" cx="${xn}" cy="${yn}" r="7"/>
  </svg>`;
}

function nextLine(g) {
  const p = PBY[g.pid], n = count(g), nt = nextTier(p, n);
  if (n < minFill(p)) { const need = minFill(p) - n; return `<span><b>${need}</b> more ${need === 1 ? 'flat' : 'flats'} and it ships, with every ${esc(p.unit)} at <b>${inr(p.tiers[1][1])}</b></span>`; }
  if (!nt) return `<span>Top price reached. More flats still welcome at ${inr(topTier(p)[1])}.</span>`;
  const need = nt[0] - n;
  return `<span><b>${need}</b> more ${need === 1 ? 'flat' : 'flats'} and every ${esc(p.unit)} drops to <b>${inr(nt[1])}</b></span>`;
}

function card(g) {
  const p = PBY[g.pid], mine = myLine(g), bk = inBasket(g.id);
  return `<a class="card" href="#/g/${g.id}">
    <div class="card__photo">${photo(p)}
      <span class="tag">${I.clock}<span data-b="left" data-g="${g.id}">${left(g.closes - Date.now())}</span></span>
      ${mine ? `<span class="tag tag--you tag--right">${I.check}You're in</span>` : bk ? `<span class="tag tag--right">In basket</span>` : ''}
    </div>
    <div>
      <div class="card__name">${esc(p.name)}</div>
      <div class="card__sub">${esc(p.pack)} · ${esc(p.origin)}</div>
    </div>
    <div data-b="pricebox" data-g="${g.id}">${priceBox(g)}</div>
    <div class="tiers" data-b="tiers" data-g="${g.id}">${tierBar(g)}</div>
    <div class="meta" data-b="meta" data-g="${g.id}">${metaLine(g)}</div>
  </a>`;
}
function priceBox(g) {
  const p = PBY[g.pid], pr = priceNow(g);
  return `<div class="price"><b>${inr(pr)}</b><s aria-label="Shop price ${inr(p.mrp)}">${inr(p.mrp)}</s><span class="off">${pctOff(p, pr)}% off</span></div>`;
}
function metaLine(g) {
  const p = PBY[g.pid], n = count(g), nt = nextTier(p, n);
  const rest = n < minFill(p) ? `${minFill(p) - n} more and it ships` : nt ? `${nt[0] - n} more for ${inr(nt[1])}` : 'Top price reached';
  return `<span><b>${n}</b> ${n === 1 ? 'flat' : 'flats'} in</span><span>${rest}</span>`;
}

/* ---------------- Live binders ---------------- */
let fresh = null; // { gid, f } of the newest join, for highlight
const BIND = {
  pricebox: (el, g) => { const old = el.textContent; el.innerHTML = priceBox(g); if (old && old !== el.textContent) $('.price', el).classList.add('flash'); },
  tiers: (el, g) => { const fill = $('.tiers__fill', el); const w = fill?.style.width; el.innerHTML = tierBar(g); const nf = $('.tiers__fill', el); if (w && !reduced) { const target = nf.style.width; nf.style.width = w; requestAnimationFrame(() => requestAnimationFrame(() => { nf.style.width = target; })); } },
  meta: (el, g) => { el.innerHTML = metaLine(g); },
  stair: (el, g) => { el.innerHTML = stair(g); },
  next: (el, g) => { const nt = nextTier(PBY[g.pid], count(g)); el.classList.toggle('next--top', !nt); $('[data-next-text]', el).innerHTML = nextLine(g); },
  count: (el, g) => { el.textContent = count(g); },
  price: (el, g) => { const v = inr(priceNow(g)); if (el.textContent !== v) { el.textContent = v; el.closest('.panel__price')?.classList.add('flash'); } },
  off: (el, g) => { el.textContent = `${pctOff(PBY[g.pid], priceNow(g))}% off`; },
  per: (el, g) => { el.innerHTML = perLine(g); },
  flats: (el, g) => { el.innerHTML = flatsWall(g); },
  feed: (el, g) => { el.innerHTML = feedList(g); },
  join: (el, g) => {
    // patch in place when only the price moved, so a button under the pointer is never swapped out
    const sig = joinSig(g);
    if (el.dataset.sig === sig) {
      const tmp = document.createElement('div'); tmp.innerHTML = joinBlock(g);
      [['[data-join]'], ['.fine span'], ['.inbox span']].forEach(([s]) => { const a = $(s, el), b = $(s, tmp); if (a && b && a.innerHTML !== b.innerHTML) a.innerHTML = b.innerHTML; });
    } else { el.innerHTML = joinBlock(g); el.dataset.sig = sig; }
  },
  mine: (el, g) => { el.innerHTML = mineCells(g); },
  left: (el, g) => { el.textContent = left(g.closes - Date.now()); },
  clock: (el, g) => { el.textContent = g.status === 'open' ? clock(g.closes - Date.now()) : 'Closed'; },
};
function bind(gid, only) {
  const g = G(gid); if (!g) return;
  $$(`[data-b][data-g="${gid}"]`).forEach(el => {
    const b = el.dataset.b;
    if (only && !only.includes(b)) return;
    BIND[b]?.(el, g);
  });
  bindGlobal();
}
function bindGlobal() {
  const og = openGroups();
  const set = (k, v) => $$(`[data-stat="${k}"]`).forEach(el => { el.textContent = v; });
  set('open', og.length);
  set('flats', intF.format(new Set(og.flatMap(g => g.members.map(m => m.f))).size));
  set('saved', inr(og.reduce((s, g) => s + g.members.reduce((a, m) => a + m.q, 0) * (PBY[g.pid].mrp - priceNow(g)), 0)));
  const n = S.basket.reduce((a, b) => a + 1, 0);
  $$('[data-basket-count]').forEach(el => { el.textContent = n; el.toggleAttribute('data-zero', !n); if (el.classList.contains('tcount')) el.hidden = !n; });
  $$('[data-me]').forEach(el => { el.textContent = S.me.flat; });
}

/* ---------------- Group detail parts ---------------- */
function perLine(g) {
  const p = PBY[g.pid];
  return `a ${esc(p.unit)} at ${plural(count(g), 'flat')}, shop price ${inr(p.mrp)}`;
}
function flatsWall(g) {
  const by = {};
  g.members.forEach(m => { (by[tower(m.f)] ||= []).push(m); });
  return Object.keys(by).sort().map(t => `<div class="tower"><div class="tower__name">Tower ${esc(t)}</div><div class="flats">${
    by[t].sort((a, b) => a.f.localeCompare(b.f, 'en', { numeric: true })).map(m => `<span class="flat${m.me ? ' me' : ''}${fresh && fresh.gid === g.id && fresh.f === m.f ? ' new' : ''}">${esc(m.f)}<i>×${m.q}</i></span>`).join('')
  }</div></div>`).join('');
}
function feedList(g) {
  const p = PBY[g.pid];
  return g.events.slice(-7).reverse().map((e, i) => {
    const isNew = i === 0 && fresh && fresh.gid === g.id && Date.now() - e.t < 4000;
    if (e.type === 'drop') return `<li class="drop${isNew ? ' new' : ''}"><span class="av" aria-hidden="true">${I.down}</span><span>Price dropped to ${inr(e.price)} at ${e.n} flats</span><time>${ago(e.t)}</time></li>`;
    if (e.type === 'open') return `<li><span class="av" data-t="${esc(tower(e.f))}" aria-hidden="true">${esc(e.f)}</span><span>${e.f === S.me.flat && g.by === S.me.flat ? 'You' : 'Flat ' + esc(e.f)} started the group buy</span><time>${ago(e.t)}</time></li>`;
    if (e.type === 'close') return `<li><span class="av" aria-hidden="true">${I.lock}</span><span>${e.unfilled ? `Closed at ${e.n} flats without filling, every block released` : `Closed at ${inr(e.price)} with ${e.n} flats`}</span><time>${ago(e.t)}</time></li>`;
    return `<li class="${isNew ? 'new' : ''}">${avatar(e.f, e.me)}<span>${e.me ? 'You' : 'Flat ' + esc(e.f)} joined with ${units(p, e.q)}</span><time>${ago(e.t)}</time></li>`;
  }).join('');
}
let qtyDraft = {};
const joinSig = g => `${g.status}|${!!myLine(g)}|${inBasket(g.id)?.q ?? 0}|${qtyDraft[g.id] ?? 0}`;
function joinBlock(g) {
  const p = PBY[g.pid], mine = myLine(g), bk = inBasket(g.id), pr = priceNow(g);
  if (g.status !== 'open') {
    return `<div class="closed-banner">${g.unfilled ? `This group closed at ${plural(count(g), 'flat')}, short of the ${minFill(p)} it needed. Every UPI block was released and nothing was charged.` : `This group closed at ${inr(pr)} with ${plural(count(g), 'flat')}. Delivery ${esc(deliveryLabel(g))}.`}</div>
      <div class="share"><a class="btn btn--primary" href="#/start/${p.id}">Start a new ${esc(p.name.toLowerCase())} group${I.arrow}</a></div>`;
  }
  if (mine) {
    const ord = S.orders.find(o => o.items.some(i => i.gid === g.id && !i.left));
    const it = ord?.items.find(i => i.gid === g.id);
    const blocked = it ? it.price * it.q : pr * mine.q;
    const pay = pr * mine.q;
    return `<div class="inbox">
      <b>You're in with ${units(p, mine.q)}, flat ${esc(mine.f)}</b>
      <span>${inr(blocked)} is blocked on your UPI. At today's price you pay ${inr(pay)}${blocked > pay ? `, and ${inr(blocked - pay)} goes back` : ''}.</span>
      <div class="row"><span class="muted">Change of plan? Leave before it closes.</span><button class="btn btn--ghost" type="button" data-leave="${g.id}">Leave this group</button></div>
    </div>`;
  }
  const q = qtyDraft[g.id] ?? bk?.q ?? 1;
  return `<div class="buy">
      <div class="stepper" role="group" aria-label="How many ${esc(p.unit)}s">
        <button type="button" data-qty="-1" aria-label="One less" ${q <= 1 ? 'disabled' : ''}>${I.minus}</button>
        <output aria-live="polite">${q}</output>
        <button type="button" data-qty="1" aria-label="One more" ${q >= 6 ? 'disabled' : ''}>${I.plus}</button>
      </div>
      <button class="btn btn--primary btn--lg" type="button" data-join="${g.id}">${bk ? (bk.q === q ? `${I.check}In your basket` : `Update basket to ${q}`) : `Join for ${inr(pr * q)}`}</button>
    </div>
    ${bk ? `<div class="share"><a class="btn btn--ink" href="#/checkout">Go to checkout${I.arrow}</a></div>` : ''}
    <p class="fine">${I.lock}<span>UPI blocks ${inr(pr * q)} when you check out. You pay the price the group reaches when it closes, never more. If it reaches fewer than ${minFill(p)} flats, nothing is charged.</span></p>`;
}

/* ---------------- Views ---------------- */
const VIEW = $('#view');

function viewDiscover() {
  const og = openGroups();
  const ui = S.ui;
  const near = og.filter(g => nextTier(PBY[g.pid], count(g))).sort((a, b) => {
    const na = nextTier(PBY[a.pid], count(a))[0] - count(a), nb = nextTier(PBY[b.pid], count(b))[0] - count(b);
    return na - nb || a.closes - b.closes;
  })[0];
  const running = new Set(og.map(g => g.pid));
  const idle = PRODUCTS.filter(p => !running.has(p.id));
  const last = og.flatMap(g => g.events.filter(e => e.type === 'join').map(e => ({ ...e, g }))).sort((a, b) => b.t - a.t)[0];
  VIEW.innerHTML = `<div class="view"><div class="wrap">
    <div class="disc-head">
      <div>
        <span class="eyebrow"><span class="live-dot" aria-hidden="true"></span>Lakeside Habitat · 412 flats</span>
        <h1>Group buys open in your society</h1>
      </div>
      <div class="stats" aria-label="This week in your society">
        <div class="stat"><b data-stat="open">0</b><span>open groups</span></div>
        <div class="stat"><b data-stat="flats">0</b><span>flats buying</span></div>
        <div class="stat"><b data-stat="saved">₹0</b><span>saved so far</span></div>
      </div>
    </div>
    <div class="ticker" aria-live="off">
      <span class="ticker__label">Live</span>
      <span class="ticker__msg" data-ticker>${last ? tickerText(last) : 'Waiting for the first neighbour'}</span>
      <time data-ticker-time>${last ? ago(last.t) : ''}</time>
    </div>
    ${near ? featureBlock(near) : ''}
    <div class="filters">
      <h2 id="all-h">All group buys</h2>
      <div class="tools">
        <label class="search"><span class="sr">Search group buys</span>${I.search}<input type="search" placeholder="Mangoes, dal, ghee" value="${esc(ui.q)}" data-q autocomplete="off"></label>
        <label class="select"><span class="sr">Sort by</span><select data-sort>
          ${[['closing', 'Closing soonest'], ['nearly', 'Nearest price drop'], ['saving', 'Biggest saving'], ['popular', 'Most flats']].map(([v, l]) => `<option value="${v}"${ui.sort === v ? ' selected' : ''}>${l}</option>`).join('')}
        </select>${I.chev}</label>
      </div>
    </div>
    <div class="chips" role="group" aria-label="Filter by aisle">
      ${CATS.map(c => { const k = c.id === 'all' ? og.length : og.filter(g => PBY[g.pid].cat === c.id).length; return `<button class="chip" type="button" data-cat="${c.id}" aria-pressed="${ui.cat === c.id}">${c.name}<em>${k}</em></button>`; }).join('')}
    </div>
    <div data-results></div>
    ${idle.length ? `<section class="starts" aria-labelledby="starts-h">
      <div class="starts__head"><div><h2 id="starts-h">No group yet for these</h2><p>Start one, share it in your tower's WhatsApp group, and the price drops as neighbours join.</p></div><a class="btn btn--ghost" href="#/start">Start a group${I.arrow}</a></div>
      <div class="starts__list">${idle.map(p => `<a class="srow" href="#/start/${p.id}">${photo(p, '64px')}<span><span class="srow__name">${esc(p.name)}</span><span class="srow__sub"> · ${esc(p.pack)}</span><br><span class="srow__sub">From ${inr(p.tiers[0][1])}, down to ${inr(topTier(p)[1])} at ${topTier(p)[0]} flats</span></span><span class="srow__go">Start${I.arrow}</span></a>`).join('')}</div>
    </section>` : ''}
  </div></div>`;
  renderResults();
  bindGlobal();
  $('[data-q]').addEventListener('input', e => { ui.q = e.target.value; save(); renderResults(); });
  $('[data-sort]').addEventListener('change', e => { ui.sort = e.target.value; save(); renderResults(); });
  $$('[data-cat]').forEach(b => b.addEventListener('click', () => { ui.cat = b.dataset.cat; save(); $$('[data-cat]').forEach(x => x.setAttribute('aria-pressed', x === b)); renderResults(); }));
}
function featureBlock(g) {
  const p = PBY[g.pid];
  return `<a class="feature" href="#/g/${g.id}" aria-label="${esc(p.name)}: closest to its next price drop">
    <div class="feature__photo">${photo(p, '(max-width: 860px) 100vw, 42vw', true)}</div>
    <div class="feature__body">
      <div class="feature__top"><span class="eyebrow">Closest to a price drop</span><span class="tag" style="position:static">${I.clock}<span data-b="left" data-g="${g.id}">${left(g.closes - Date.now())}</span></span></div>
      <div><h2>${esc(p.name)}, ${esc(p.pack.toLowerCase())}</h2><p class="feature__call" data-b="next" data-g="${g.id}"><span data-next-text>${nextLine(g)}</span></p></div>
      <div class="stair" data-b="stair" data-g="${g.id}">${stair(g)}</div>
      <div class="feature__foot"><div data-b="pricebox" data-g="${g.id}">${priceBox(g)}</div><span class="btn btn--primary">See the group${I.arrow}</span></div>
    </div>
  </a>`;
}
function tickerText(e) {
  const p = PBY[e.g.pid];
  return `<b>${esc(e.f)}</b> joined ${esc(p.name.toLowerCase())} with ${units(p, e.q)} · ${count(e.g)} flats in, ${inr(priceNow(e.g))} a ${esc(p.unit)}`;
}
function renderResults() {
  const box = $('[data-results]'); if (!box) return;
  const ui = S.ui, q = ui.q.trim().toLowerCase();
  let list = openGroups().filter(g => {
    const p = PBY[g.pid];
    return (ui.cat === 'all' || p.cat === ui.cat) && (!q || `${p.name} ${p.pack} ${p.origin} ${p.cat}`.toLowerCase().includes(q));
  });
  const toNext = g => { const nt = nextTier(PBY[g.pid], count(g)); return nt ? nt[0] - count(g) : 999; };
  const sorts = {
    closing: (a, b) => a.closes - b.closes,
    nearly: (a, b) => toNext(a) - toNext(b),
    saving: (a, b) => pctOff(PBY[b.pid], priceNow(b)) - pctOff(PBY[a.pid], priceNow(a)),
    popular: (a, b) => count(b) - count(a),
  };
  list.sort(sorts[ui.sort] || sorts.closing);
  box.innerHTML = list.length
    ? `<div class="grid">${list.map(card).join('')}</div>`
    : `<div class="empty"><h3>No open group for “${esc(ui.q || CATS.find(c => c.id === ui.cat)?.name)}”</h3><p>Start one and your neighbours will see it here.</p><a class="btn btn--primary" href="#/start">Start a group${I.arrow}</a></div>`;
}

function viewGroup(id) {
  const g = G(id);
  if (!g || g.status === 'draft') return go('#/');
  const p = PBY[g.pid];
  VIEW.innerHTML = `<div class="view"><div class="wrap">
    <a class="back" href="#/">${I.back}All group buys</a>
    <div class="detail">
      <div>
        <div class="hero-photo">${photo(p, '(max-width: 1000px) 100vw, 58vw', true)}</div>
        <dl class="facts">
          <div><dt>From</dt><dd>${esc(p.from)}</dd></div>
          <div><dt>Delivery</dt><dd>${esc(deliveryLabel(g))}</dd></div>
          <div><dt>Started by</dt><dd>${g.by === S.me.flat && myLine(g) && g.members[0].me ? 'You' : 'Flat ' + esc(g.by)}</dd></div>
        </dl>
        <p class="about">${esc(p.about)}</p>
        ${g.note ? `<div class="note">${avatar(g.by, g.members[0]?.me)}<div><p>${esc(g.note)}</p><small>Flat ${esc(g.by)}, who started this group</small></div></div>` : ''}
        <section class="block" aria-labelledby="who-h">
          <div class="block__head"><h2 id="who-h">Flats in this group</h2><span class="muted mono"><span data-b="count" data-g="${g.id}">${count(g)}</span> joined</span></div>
          <div class="towers" data-b="flats" data-g="${g.id}">${flatsWall(g)}</div>
        </section>
        <section class="block" aria-labelledby="feed-h">
          <div class="block__head"><h2 id="feed-h">What happened</h2></div>
          <ul class="feed" data-b="feed" data-g="${g.id}">${feedList(g)}</ul>
        </section>
      </div>
      <aside class="panel" aria-labelledby="g-h">
        <h1 id="g-h">${esc(p.name)}</h1>
        <p class="panel__sub">${esc(p.pack)} · ${esc(p.origin)}</p>
        <div class="panel__price"><b data-b="price" data-g="${g.id}">${inr(priceNow(g))}</b><s>${inr(p.mrp)}</s><span class="off" data-b="off" data-g="${g.id}">${pctOff(p, priceNow(g))}% off</span></div>
        <p class="panel__per" data-b="per" data-g="${g.id}">${perLine(g)}</p>
        <div class="stair" data-b="stair" data-g="${g.id}">${stair(g)}</div>
        ${g.status === 'open' ? `<div class="next" data-b="next" data-g="${g.id}">${I.people.replace('viewBox', 'width="20" height="20" viewBox')}<span data-next-text>${nextLine(g)}</span></div>` : ''}
        <dl class="clock">
          <div><dt>Closes ${esc(whenLabel(g.closes))}</dt><dd data-b="clock" data-g="${g.id}">${clock(g.closes - Date.now())}</dd></div>
          <div><dt>At your gate</dt><dd>${esc(deliveryLabel(g).replace(', 7 to 9 am', ''))}</dd></div>
        </dl>
        <div data-b="join" data-g="${g.id}">${joinBlock(g)}</div>
        <div class="share">
          <a class="btn btn--ghost" href="https://wa.me/?text=${encodeURIComponent(`${p.name}, ${p.pack.toLowerCase()} at ${inr(priceNow(g))}. ${count(g)} flats in Lakeside Habitat have joined, join before ${whenLabel(g.closes)}: ${location.href}`)}" target="_blank" rel="noopener"><img src="assets/icons/whatsapp.svg" alt="" width="18" height="18">Share on WhatsApp</a>
          <button class="btn btn--ghost" type="button" data-copy>Copy link</button>
        </div>
      </aside>
    </div>
  </div></div>`;
  wireJoin(g.id);
  $('[data-copy]').addEventListener('click', async e => {
    try { await navigator.clipboard.writeText(location.href); e.target.textContent = 'Link copied'; } catch { e.target.textContent = 'Copy failed'; }
    setTimeout(() => { e.target.textContent = 'Copy link'; }, 2000);
  });
  bindGlobal();
}
function wireJoin(gid) {
  const host = $(`[data-b="join"][data-g="${gid}"]`);
  host.addEventListener('click', e => {
    const g = G(gid), p = PBY[g.pid];
    const qb = e.target.closest('[data-qty]');
    if (qb) {
      const cur = qtyDraft[gid] ?? inBasket(gid)?.q ?? 1;
      qtyDraft[gid] = Math.max(1, Math.min(6, cur + +qb.dataset.qty));
      host.innerHTML = joinBlock(g);
      $(`[data-qty="${qb.dataset.qty}"]`, host)?.focus();
      if ($(`[data-qty="${qb.dataset.qty}"]`, host)?.disabled) $('[data-join]', host)?.focus();
      return;
    }
    if (e.target.closest('[data-join]')) {
      const q = qtyDraft[gid] ?? inBasket(gid)?.q ?? 1;
      const bk = inBasket(gid);
      if (bk && bk.q === q) { openBasket(); return; }
      if (bk) bk.q = q; else S.basket.push({ gid, q });
      delete qtyDraft[gid];
      save(); bindGlobal(); host.innerHTML = joinBlock(g);
      bumpBasket();
      toast({ icon: I.check, title: `${p.name} added`, sub: `${units(p, q)} at ${inr(priceNow(g))}. Check out to lock your place.`, href: '#/checkout', cta: 'Check out' });
      $('[data-join]', host)?.focus();
      return;
    }
    const lb = e.target.closest('[data-leave]');
    if (lb) {
      if (!confirm(`Leave the ${p.name.toLowerCase()} group? The amount blocked on your UPI is released.`)) return;
      leaveGroup(g);
      host.innerHTML = joinBlock(g);
      bind(gid);
      $('[data-join]', host)?.focus();
    }
  });
}
function leaveGroup(g) {
  const p = PBY[g.pid], i = g.members.findIndex(m => m.me);
  if (i < 0) return;
  const m = g.members[i];
  g.members.splice(i, 1);
  g.events = g.events.filter(e => !e.me);
  S.orders.forEach(o => o.items.forEach(it => { if (it.gid === g.id) it.left = true; }));
  save();
  toast({ icon: I.check, title: `You left ${p.name.toLowerCase()}`, sub: 'The UPI block is released within a few minutes.' });
}

/* Start a group */
function closeOptions() {
  const now = new Date(), opts = [];
  const tonight = new Date(now); tonight.setHours(21, 0, 0, 0);
  if (tonight - now > 2 * HOUR) opts.push(+tonight);
  const tm = new Date(tonight); tm.setDate(tm.getDate() + 1); opts.push(+tm);
  const sat = new Date(now); sat.setDate(sat.getDate() + (((6 - sat.getDay()) + 7) % 7 || 7)); sat.setHours(12, 0, 0, 0);
  if (sat - tm > 6 * HOUR) opts.push(+sat); else { const d = new Date(tonight); d.setDate(d.getDate() + 3); opts.push(+d); }
  if (opts.length < 3) { const d = new Date(tonight); d.setDate(d.getDate() + 4); opts.push(+d); }
  return opts.slice(0, 3);
}
function viewStart(pid) {
  const og = openGroups(), running = Object.fromEntries(og.map(g => [g.pid, g]));
  const first = PBY[pid] ? pid : PRODUCTS.find(p => !running[p.id])?.id || PRODUCTS[0].id;
  const opts = closeOptions();
  const st = { pid: first, closes: opts[1] ?? opts[0], q: 1, note: '' };
  VIEW.innerHTML = `<div class="view"><div class="wrap">
    <a class="back" href="#/">${I.back}All group buys</a>
    <form class="start" novalidate data-start>
      <div>
        <h1>Start a group buy for your society</h1>
        <p class="start__lead">Pick what to buy and when it closes. You check out first, then share the link, and every flat that joins lowers the price for everyone.</p>
        <fieldset class="step" style="border:0;padding:0;margin-inline:0">
          <legend class="step__label"><span class="step__n">1</span>What to buy</legend>
          <p class="step__hint">Prices come from the supplier and drop at each group size.</p>
          <div class="pick">${PRODUCTS.map(p => `<label>
            <input type="radio" name="pid" value="${p.id}"${p.id === first ? ' checked' : ''}>
            ${photo(p, '(max-width: 640px) 50vw, 200px')}
            ${running[p.id] ? '<span class="ran">Running</span>' : ''}
            <span>${esc(p.name)}</span><small>${esc(p.pack)} · from ${inr(p.tiers[0][1])}</small>
          </label>`).join('')}</div>
          <p class="step__hint" data-running-hint hidden></p>
        </fieldset>
        <fieldset class="step" style="border:0;padding:0;margin-inline:0">
          <legend class="step__label"><span class="step__n">2</span>When it closes</legend>
          <p class="step__hint">Neighbours can join until then. Delivery follows a day or more after, by product.</p>
          <div class="seg">${opts.map((t, i) => `<label><input type="radio" name="closes" value="${t}"${t === st.closes ? ' checked' : ''}><span><b>${esc(dayLabel(t))}</b><small>${esc(hourLabel(new Date(t)))}</small></span></label>`).join('')}</div>
        </fieldset>
        <fieldset class="step" style="border:0;padding:0;margin-inline:0">
          <legend class="step__label"><span class="step__n">3</span>Your order</legend>
          <div class="field" style="margin-left:40px">
            <span class="help" id="q-help">How many for your flat</span>
            <div class="stepper" role="group" aria-describedby="q-help" style="width:max-content">
              <button type="button" data-sq="-1" aria-label="One less" disabled>${I.minus}</button><output data-sq-out aria-live="polite">1</output><button type="button" data-sq="1" aria-label="One more">${I.plus}</button>
            </div>
          </div>
        </fieldset>
        <fieldset class="step" style="border:0;padding:0;margin-inline:0">
          <legend class="step__label"><span class="step__n">4</span>A note for neighbours</legend>
          <div class="field" style="margin-left:40px">
            <label for="note">Why you are buying it, or a tip for pickup (optional)</label>
            <textarea id="note" name="note" maxlength="140" placeholder="Same orchard as last year, the boxes were excellent."></textarea>
            <span class="help" data-note-count>0 of 140</span>
          </div>
        </fieldset>
      </div>
      <aside class="preview" aria-labelledby="pv-h">
        <p class="preview__label" id="pv-h">What neighbours will see</p>
        <div data-preview></div>
        <button class="btn btn--primary btn--lg btn--block" type="submit">Check out and open the group${I.arrow}</button>
        <p class="fine">${I.lock}<span>The group goes live once your UPI block goes through. Neighbours see your flat number, never your name.</span></p>
      </aside>
    </form>
  </div></div>`;
  const form = $('[data-start]');
  const draw = () => {
    const p = PBY[st.pid];
    const fake = { id: 'preview', pid: st.pid, members: [{ f: S.me.flat, q: st.q, me: true }], closes: st.closes, status: 'open' };
    $('[data-preview]').innerHTML = `<div class="card">
        <div class="card__photo">${photo(p, '(max-width: 1000px) 100vw, 36vw')}<span class="tag">${I.clock}${esc(whenLabel(st.closes))}</span></div>
        <div><div class="card__name">${esc(p.name)}</div><div class="card__sub">${esc(p.pack)} · ${esc(p.origin)} · started by ${esc(S.me.flat)}</div></div>
        ${priceBox(fake)}
      </div>
      <div class="stair">${stair(fake, { label: 'You start here' })}</div>
      <div class="sum" style="margin-top:16px"><span>Your order, ${units(p, st.q)}</span><b>${inr(p.tiers[0][1] * st.q)}</b></div>
      <div class="sum sum--save" style="margin-top:8px"><span>At ${topTier(p)[0]} flats you pay</span><span>${inr(topTier(p)[1] * st.q)}</span></div>`;
    const hint = $('[data-running-hint]'), r = running[st.pid];
    hint.hidden = !r;
    if (r) hint.innerHTML = `A ${esc(p.name.toLowerCase())} group is already open with ${count(r)} flats. <a class="link" href="#/g/${r.id}">Join that one instead</a> and the price drops faster.`;
  };
  draw();
  form.addEventListener('change', e => {
    if (e.target.name === 'pid') st.pid = e.target.value;
    if (e.target.name === 'closes') st.closes = +e.target.value;
    draw();
  });
  form.addEventListener('click', e => {
    const b = e.target.closest('[data-sq]'); if (!b) return;
    st.q = Math.max(1, Math.min(6, st.q + +b.dataset.sq));
    $('[data-sq-out]').textContent = st.q;
    $('[data-sq="-1"]').disabled = st.q <= 1; $('[data-sq="1"]').disabled = st.q >= 6;
    draw();
  });
  const note = $('#note');
  note.addEventListener('input', () => { st.note = note.value; $('[data-note-count]').textContent = `${note.value.length} of 140`; });
  form.addEventListener('submit', e => {
    e.preventDefault();
    // drop any earlier unpaid draft for the same product
    S.groups.filter(g => g.status === 'draft' && g.pid === st.pid).forEach(g => { S.basket = S.basket.filter(b => b.gid !== g.id); });
    S.groups = S.groups.filter(g => !(g.status === 'draft' && g.pid === st.pid));
    const id = 'n' + Date.now().toString(36);
    S.groups.push({ id, pid: st.pid, by: S.me.flat, opened: Date.now(), closes: st.closes, note: st.note.trim(), status: 'draft', members: [], events: [] });
    S.basket.push({ gid: id, q: st.q, draft: true });
    save(); bindGlobal();
    go('#/checkout');
  });
}

/* Checkout */
const UPI = [
  { id: 'gpay', name: 'Google Pay', icon: 'assets/icons/google-pay.svg' },
  { id: 'phonepe', name: 'PhonePe', icon: 'assets/icons/phonepe.svg' },
  { id: 'paytm', name: 'Paytm', icon: 'assets/icons/paytm.svg' },
];
function lineCalc(b) {
  const g = G(b.gid), p = PBY[g.pid];
  const already = g.members.some(m => m.me);
  const nAfter = count(g) + (already ? 0 : 1);
  const price = priceAt(p, nAfter);
  return { g, p, price, amt: price * b.q, mrp: p.mrp * b.q, low: topTier(p)[1] * b.q };
}
function viewCheckout() {
  S.basket = S.basket.filter(b => G(b.gid) && G(b.gid).status !== 'closed');
  if (!S.basket.length) {
    VIEW.innerHTML = `<div class="view"><div class="wrap"><a class="back" href="#/">${I.back}All group buys</a>
      <div class="empty" style="margin-top:24px"><h3>Your basket is empty</h3><p>Join a group buy, or start one for something nobody is buying yet.</p><a class="btn btn--primary" href="#/">See group buys${I.arrow}</a></div></div></div>`;
    return;
  }
  const lines = S.basket.map(lineCalc);
  const total = lines.reduce((a, l) => a + l.amt, 0), mrp = lines.reduce((a, l) => a + l.mrp, 0), low = lines.reduce((a, l) => a + l.low, 0);
  const pay = S.me.pay || 'gpay';
  VIEW.innerHTML = `<div class="view"><div class="wrap">
    <a class="back" href="#/">${I.back}Keep browsing</a>
    <form class="checkout" novalidate data-checkout>
      <div>
        <h1>Check out</h1>
        <fieldset class="fieldset">
          <legend>Where it goes</legend>
          <p class="lead">Every order in Lakeside Habitat comes to the main gate together. The guard hands it over by flat number.</p>
          <div class="drop"><span class="ic">${I.gate}</span><div><b>Lakeside Habitat, main gate</b><small>Whitefield · pickup at the clubhouse, 7 to 9 am</small></div></div>
          <div class="row2">
            <div class="field" data-f="flat"><label for="flat">Your flat</label><input id="flat" name="flat" value="${esc(S.me.flat)}" autocomplete="off" inputmode="text" aria-describedby="flat-err flat-help" placeholder="B-1204"><span class="help" id="flat-help">Tower letter, a dash, then the flat number</span><span class="err" id="flat-err" role="alert"></span></div>
            <div class="field" data-f="name"><label for="name">Name for the guard</label><input id="name" name="name" value="${esc(S.me.name)}" autocomplete="given-name" aria-describedby="name-err" placeholder="First name"><span class="err" id="name-err" role="alert"></span></div>
          </div>
        </fieldset>
        <fieldset class="fieldset">
          <legend>Pay by UPI</legend>
          <p class="lead">Your bank blocks ${inr(total)} now and takes only the final price when each group closes. If a group grows, the rest is released.</p>
          <div class="upi">${UPI.map(u => `<label><input type="radio" name="pay" value="${u.id}"${pay === u.id ? ' checked' : ''}><span><img src="${u.icon}" alt="" width="28" height="28">${u.name}</span></label>`).join('')}<label><input type="radio" name="pay" value="vpa"${pay === 'vpa' ? ' checked' : ''}><span><i class="vpa-ic" aria-hidden="true">@</i>UPI ID</span></label></div>
          <div class="field" data-f="upi" ${pay === 'vpa' ? '' : 'hidden'}><label for="upi">UPI ID</label><input id="upi" name="upi" value="${esc(S.me.upi)}" autocomplete="off" inputmode="email" placeholder="yourname@bank" aria-describedby="upi-err"><span class="err" id="upi-err" role="alert"></span></div>
        </fieldset>
      </div>
      <aside class="summary" aria-labelledby="sum-h">
        <h2 id="sum-h">${plural(lines.length, 'group buy')}</h2>
        <div>${lines.map(l => `<div class="line">${photo(l.p, '56px')}<div><a class="line__name" href="${l.g.status === 'draft' ? '#/start/' + l.p.id : '#/g/' + l.g.id}">${esc(l.p.name)}</a><div class="line__sub">${units(l.p, S.basket.find(b => b.gid === l.g.id).q)} · ${l.g.status === 'draft' ? 'you open it' : `${count(l.g)} flats in`}</div></div><div class="line__amt">${inr(l.amt)}<small>${inr(l.price)} each</small></div></div>`).join('')}</div>
        <div class="sums">
          <div class="sum"><span>Shop price</span><span class="mono"><s>${inr(mrp)}</s></span></div>
          <div class="sum sum--save"><span>Group price today</span><span>−${inr(mrp - total)}</span></div>
          <div class="sum sum--total"><span>Blocked on UPI now</span><b>${inr(total)}</b></div>
          <div class="sum muted"><span>If every group fills</span><span class="mono">${inr(low)}</span></div>
        </div>
        <button class="btn btn--primary btn--lg btn--block" type="submit" data-pay>Block ${inr(total)} with UPI</button>
        <p class="fine">${I.lock}<span>You can leave any group before it closes and the block is released. Nothing is charged for a group you leave.</span></p>
      </aside>
    </form>
  </div></div>`;
  const form = $('[data-checkout]');
  form.addEventListener('change', e => {
    if (e.target.name === 'pay') { S.me.pay = e.target.value; save(); $('[data-f="upi"]').hidden = e.target.value !== 'vpa'; if (e.target.value === 'vpa') $('#upi').focus(); }
  });
  form.addEventListener('input', e => { const f = e.target.closest('.field'); if (f) { f.classList.remove('invalid'); $('.err', f).textContent = ''; } });
  form.addEventListener('submit', e => {
    e.preventDefault();
    const flat = $('#flat').value.trim().toUpperCase().replace(/\s+/g, '').replace(/^([A-F])(\d)/, '$1-$2');
    const name = $('#name').value.trim();
    const payV = form.pay.value;
    const upi = $('#upi').value.trim();
    const errs = {};
    if (!/^[A-F]-\d{3,4}$/.test(flat)) errs.flat = 'Use your tower (A to F) and flat number, like B-1204.';
    if (name.length < 2) errs.name = 'Add the name the guard should call out.';
    if (payV === 'vpa' && !/^[\w.\-]{2,}@[a-z]{2,}$/i.test(upi)) errs.upi = 'A UPI ID looks like name@bank.';
    $$('.field[data-f]', form).forEach(f => { const k = f.dataset.f, m = errs[k] || ''; f.classList.toggle('invalid', !!m); $('.err', f).textContent = m; });
    const firstErr = Object.keys(errs)[0];
    if (firstErr) { $('#' + firstErr).focus(); return; }
    S.me.flat = flat; S.me.name = name; S.me.upi = upi; save();
    const btn = $('[data-pay]');
    btn.classList.add('is-busy'); btn.textContent = `Waiting for ${payV === 'vpa' ? 'your UPI app' : UPI.find(u => u.id === payV).name}`;
    setTimeout(() => placeOrder(payV), 1400);
  });
}
function placeOrder(payV) {
  const now = Date.now(), items = [];
  S.basket.forEach(b => {
    const g = G(b.gid); if (!g || g.status === 'closed') return;
    const p = PBY[g.pid];
    if (g.status === 'draft') { g.status = 'open'; g.opened = now; g.by = S.me.flat; g.events = [{ t: now, type: 'open', f: S.me.flat }]; }
    if (g.members.some(m => m.me)) return;
    const before = count(g);
    g.members.push({ f: S.me.flat, q: b.q, t: now, me: true });
    if (g.members.length > 1) g.events.push({ t: now, type: 'join', f: S.me.flat, q: b.q, me: true });
    if (tierIdx(p, before) < tierIdx(p, count(g))) g.events.push({ t: now + 1, type: 'drop', price: priceNow(g), n: count(g) });
    items.push({ gid: g.id, q: b.q, price: priceNow(g) });
  });
  const id = `GB-${48207 + S.seq++}`;
  S.orders.unshift({ id, at: now, items, method: payV === 'vpa' ? S.me.upi : UPI.find(u => u.id === payV).name, flat: S.me.flat });
  S.basket = [];
  save(); bindGlobal();
  go(`#/done/${id}`);
}

function viewDone(id) {
  const o = S.orders.find(x => x.id === id);
  if (!o) return go('#/mine');
  const total = o.items.reduce((a, i) => a + i.price * i.q, 0);
  const opened = o.items.map(i => G(i.gid)).find(g => g && g.by === o.flat && g.members[0]?.me);
  const shareG = opened || G(o.items[0]?.gid);
  const sp = shareG && PBY[shareG.pid];
  const link = shareG ? location.href.split('#')[0] + '#/g/' + shareG.id : '';
  VIEW.innerHTML = `<div class="view"><div class="wrap"><div class="done">
    <div class="done__check" aria-hidden="true"><svg viewBox="0 0 40 40"><path d="M11 21l6 6 12-14" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
    <h1>${opened ? 'Your group is open' : `You're in, flat ${esc(o.flat)}`}</h1>
    <p>${inr(total)} is blocked on ${esc(o.method)}. Each group charges its final price when it closes, so you will likely pay less.</p>
    <div class="receipt">
      ${o.items.map(i => { const g = G(i.gid), p = PBY[g.pid]; return `<div class="line">${photo(p, '56px')}<div><a class="line__name" href="#/g/${g.id}">${esc(p.name)}</a><div class="line__sub">${units(p, i.q)} · delivery ${esc(deliveryLabel(g))}</div></div><div class="line__amt">${inr(i.price * i.q)}</div></div>`; }).join('')}
      <div class="sums"><div class="sum"><span>Order</span><span class="mono">${esc(o.id)}</span></div><div class="sum"><span>Blocked now</span><b>${inr(total)}</b></div></div>
    </div>
    ${shareG ? `<ol class="nexts" aria-label="What happens next">
      <li><b>Neighbours join</b><span>until ${esc(whenLabel(shareG.closes).replace('Today', 'today').replace('Tomorrow', 'tomorrow'))}</span></li>
      <li><b>Final price is charged</b><span>the rest of the block goes back</span></li>
      <li><b>At the main gate</b><span>${esc(deliveryLabel(shareG))}</span></li>
    </ol>` : ''}
    <div class="btns">
      ${sp ? `<a class="btn btn--primary" href="https://wa.me/?text=${encodeURIComponent(`${opened ? 'I started' : 'I joined'} a group buy for ${sp.name.toLowerCase()} in Lakeside Habitat. The more flats join, the lower the price for all of us: ${link}`)}" target="_blank" rel="noopener"><img src="assets/icons/whatsapp.svg" alt="" width="18" height="18">Invite your tower on WhatsApp</a>` : ''}
      <a class="btn btn--ghost" href="#/mine">See my groups${I.arrow}</a>
    </div>
  </div></div></div>`;
}

function mineCells(g) {
  const p = PBY[g.pid], m = myLine(g);
  const it = S.orders.flatMap(o => o.items).find(i => i.gid === g.id && !i.left);
  const blocked = it ? it.price * it.q : 0, pay = g.unfilled ? 0 : priceNow(g) * (m?.q || 0);
  return `<div class="mrow__cell--w"><div class="mrow__k">${g.status === 'open' ? `<span class="status">${I.clock.replace('viewBox', 'width="12" height="12" viewBox')}${left(g.closes - Date.now())}</span>` : '<span class="status status--closed">Closed</span>'}</div>
      <div class="card__name" style="margin-top:8px">${esc(p.name)}</div><div class="card__sub">${units(p, m.q)} · delivery ${esc(deliveryLabel(g))}</div></div>
    <div class="mrow__cell--w"><div class="mrow__k">${count(g)} flats in</div><div class="tiers">${tierBar(g)}</div></div>
    <div class="mrow__cell--w"><div class="mrow__k">${g.status === 'open' ? 'You pay now' : g.unfilled ? 'Did not fill' : 'Charged'}</div><div class="mrow__v">${inr(pay)}${g.unfilled ? '<small>Block released</small>' : blocked > pay ? `<small>${inr(blocked - pay)} less than blocked</small>` : `<small style="color:var(--muted)">${inr(blocked)} blocked</small>`}</div></div>`;
}
function viewMine() {
  const mine = S.groups.filter(g => myLine(g)).sort((a, b) => (a.status === 'open' ? 0 : 1) - (b.status === 'open' ? 0 : 1) || a.closes - b.closes);
  const totalBack = mine.reduce((s, g) => { const it = S.orders.flatMap(o => o.items).find(i => i.gid === g.id && !i.left); return s + (it && !g.unfilled ? it.price * it.q - priceNow(g) * myLine(g).q : 0); }, 0);
  VIEW.innerHTML = `<div class="view"><div class="wrap">
    <div class="mine-head">
      <div><span class="eyebrow">Flat ${esc(S.me.flat)}${S.me.name ? ' · ' + esc(S.me.name) : ''}</span><h1>Your group buys</h1></div>
      ${mine.length ? `<div class="stats"><div class="stat"><b>${mine.filter(g => g.status === 'open').length}</b><span>still open</span></div><div class="stat"><b data-back>${inr(Math.max(0, totalBack))}</b><span>back since you joined</span></div></div>` : ''}
    </div>
    ${mine.length ? `<div class="mine-list">${mine.map(g => `<a class="mrow" href="#/g/${g.id}">${photo(PBY[g.pid], '120px')}<div style="display:contents" data-b="mine" data-g="${g.id}">${mineCells(g)}</div></a>`).join('')}</div>`
      : `<div class="empty"><h3>You haven't joined a group yet</h3><p>Pick one your neighbours are already filling, or start your own.</p><a class="btn btn--primary" href="#/">See group buys${I.arrow}</a></div>`}
    ${S.orders.length ? `<section class="orders" aria-labelledby="ord-h"><h2 id="ord-h">Orders</h2>
      <table class="otable"><thead><tr><th scope="col">Order</th><th scope="col">Placed</th><th scope="col">Paid with</th><th scope="col">Blocked</th></tr></thead><tbody>
      ${S.orders.map(o => `<tr><td class="num">${esc(o.id)}<div class="muted" style="font-family:var(--font-text);font-size:14px">${o.items.map(i => esc(PBY[G(i.gid)?.pid]?.name || '')).join(', ')}${o.items.every(i => i.left) ? ' · left' : ''}</div></td><td>${esc(whenLabel(o.at))}</td><td>${esc(o.method)}</td><td class="num">${inr(o.items.filter(i => !i.left).reduce((a, i) => a + i.price * i.q, 0))}</td></tr>`).join('')}
      </tbody></table></section>` : ''}
  </div></div>`;
}

/* ---------------- Basket drawer ---------------- */
const drawer = $('[data-drawer]'), scrim = $('[data-scrim]');
let lastFocus = null;
function drawBasket() {
  S.basket = S.basket.filter(b => G(b.gid) && G(b.gid).status !== 'closed');
  const lines = S.basket.map(b => ({ b, ...lineCalc(b) }));
  const total = lines.reduce((a, l) => a + l.amt, 0), mrp = lines.reduce((a, l) => a + l.mrp, 0);
  drawer.innerHTML = `<div class="drawer__head"><h2 id="basket-h">Basket</h2><button class="icon-btn" type="button" data-close aria-label="Close basket">${I.close}</button></div>
    <div class="drawer__body">${lines.length ? lines.map(l => `<div class="line">${photo(l.p, '72px')}<div>
        <a class="line__name" href="${l.g.status === 'draft' ? '#/start/' + l.p.id : '#/g/' + l.g.id}" data-close>${esc(l.p.name)}</a>
        <div class="line__sub">${esc(l.p.pack)} · ${l.g.status === 'draft' ? 'you open this group' : `${count(l.g)} flats, ${left(l.g.closes - Date.now())}`}</div>
        <div class="line__row">
          <div class="stepper stepper--sm" role="group" aria-label="Quantity of ${esc(l.p.name)}"><button type="button" data-bq="-1" data-gid="${l.g.id}" aria-label="One less" ${l.b.q <= 1 ? 'disabled' : ''}>${I.minus}</button><output>${l.b.q}</output><button type="button" data-bq="1" data-gid="${l.g.id}" aria-label="One more" ${l.b.q >= 6 ? 'disabled' : ''}>${I.plus}</button></div>
          <div class="line__amt">${inr(l.amt)}<small>${inr(l.price)} each</small></div>
        </div>
        <button class="rm" type="button" data-rm="${l.g.id}">Remove</button>
      </div></div>`).join('')
      : `<div class="empty" style="margin-top:24px"><h3>Nothing here yet</h3><p>Join a group buy and it waits here until you check out.</p></div>`}</div>
    ${lines.length ? `<div class="drawer__foot">
      <div class="sum sum--save"><span>Off shop prices</span><span>−${inr(mrp - total)}</span></div>
      <div class="sum"><span>Blocked on UPI at checkout</span><b>${inr(total)}</b></div>
      <a class="btn btn--primary btn--lg btn--block" href="#/checkout" data-close>Check out${I.arrow}</a>
    </div>` : ''}`;
}
function openBasket() {
  lastFocus = document.activeElement;
  drawBasket();
  drawer.hidden = false; scrim.hidden = false;
  requestAnimationFrame(() => { drawer.classList.add('open'); scrim.classList.add('open'); $('[data-close]', drawer).focus(); });
  document.body.style.overflow = 'hidden';
}
function closeBasket(restore = true) {
  if (drawer.hidden) return;
  drawer.classList.remove('open'); scrim.classList.remove('open');
  document.body.style.overflow = '';
  setTimeout(() => { drawer.hidden = true; scrim.hidden = true; }, reduced ? 0 : 350);
  if (restore) lastFocus?.focus?.();
}
drawer.addEventListener('click', e => {
  const q = e.target.closest('[data-bq]');
  if (q) { const b = inBasket(q.dataset.gid); b.q = Math.max(1, Math.min(6, b.q + +q.dataset.bq)); save(); drawBasket(); $(`[data-bq="${q.dataset.bq}"][data-gid="${q.dataset.gid}"]`, drawer)?.focus(); refreshJoin(q.dataset.gid); return; }
  const rm = e.target.closest('[data-rm]');
  if (rm) {
    const g = G(rm.dataset.rm);
    S.basket = S.basket.filter(b => b.gid !== rm.dataset.rm);
    if (g?.status === 'draft') S.groups = S.groups.filter(x => x !== g);
    save(); drawBasket(); bindGlobal(); refreshJoin(rm.dataset.rm); $('[data-close]', drawer).focus();
    if (route().name === 'checkout') render();
    return;
  }
  if (e.target.closest('[data-close]')) closeBasket(!e.target.closest('a'));
});
drawer.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeBasket();
  if (e.key === 'Tab') {
    const f = $$('a[href], button:not([disabled])', drawer); if (!f.length) return;
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
  }
});
scrim.addEventListener('click', () => closeBasket());
$$('[data-open-basket]').forEach(b => b.addEventListener('click', openBasket));
function refreshJoin(gid) { const host = $(`[data-b="join"][data-g="${gid}"]`); if (host) { delete qtyDraft[gid]; host.innerHTML = joinBlock(G(gid)); } }
function bumpBasket() { const b = $('.basket-btn'); b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); }

/* ---------------- Toasts ---------------- */
function toast({ icon, title, sub, href, cta }) {
  const box = $('[data-toasts]');
  const el = document.createElement(href ? 'a' : 'div');
  el.className = 'toast';
  if (href) el.href = href;
  el.innerHTML = `<span class="av" aria-hidden="true">${icon || I.check}</span><span><b>${esc(title)}</b><small>${esc(sub || '')}${cta ? ` · ${esc(cta)}` : ''}</small></span>`;
  box.appendChild(el);
  while (box.children.length > 3) box.firstElementChild.remove();
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 300); }, 5200);
}

/* ---------------- Live simulation ---------------- */
const live = rng(Date.now() & 0xffff);
function simulateJoin() {
  const og = openGroups().filter(g => count(g) < topTier(PBY[g.pid])[0] * 1.15);
  if (!og.length) return;
  // groups near a drop and groups closing soon draw more neighbours
  const w = og.map(g => { const nt = nextTier(PBY[g.pid], count(g)); return 1 + (nt && nt[0] - count(g) <= 5 ? 2 : 0) + (g.closes - Date.now() < 12 * HOUR ? 1 : 0) + (g.members.some(m => m.me) ? 1 : 0); });
  let r = live() * w.reduce((a, b) => a + b, 0), g = og[0];
  for (let i = 0; i < og.length; i++) { r -= w[i]; if (r <= 0) { g = og[i]; break; } }
  const p = PBY[g.pid], taken = new Set(g.members.map(m => m.f)); taken.add(S.me.flat);
  const f = randFlat(live, taken), q = live() < .7 ? 1 : live() < .7 ? 2 : 3, now = Date.now();
  const before = tierIdx(p, count(g));
  g.members.push({ f, q, t: now });
  g.events.push({ t: now, type: 'join', f, q });
  const dropped = tierIdx(p, count(g)) > before;
  if (dropped) g.events.push({ t: now + 1, type: 'drop', price: priceNow(g), n: count(g) });
  if (g.events.length > 60) g.events = g.events.slice(-60);
  save();
  fresh = { gid: g.id, f };
  bind(g.id);
  const t = $('[data-ticker]');
  if (t) { t.innerHTML = tickerText({ f, q, g }); t.classList.remove('in'); void t.offsetWidth; t.classList.add('in'); $('[data-ticker-time]').textContent = 'now'; }
  if (dropped) {
    const mine = g.members.some(m => m.me);
    toast({ icon: I.down, title: `${p.name}: now ${inr(priceNow(g))}`, sub: `Flat ${f} made it ${count(g)} flats${mine ? '. You pay less too' : ''}`, href: `#/g/${g.id}` });
  } else if (g.members.some(m => m.me) && route().name !== 'group') {
    const nt = nextTier(p, count(g));
    toast({ icon: I.people, title: `Flat ${f} joined your ${p.name.toLowerCase()} group`, sub: nt ? `${nt[0] - count(g)} more for ${inr(nt[1])}` : `${count(g)} flats in`, href: `#/g/${g.id}` });
  }
  if (route().name === 'mine') { const b = $('[data-back]'); if (b) viewMine(); }
}
function closeDue() {
  const now = Date.now();
  openGroups().forEach(g => {
    if (g.closes > now) return;
    const m = myLine(g), p = PBY[g.pid];
    g.status = 'closed';
    g.unfilled = count(g) < minFill(p);
    g.events.push({ t: g.closes, type: 'close', price: priceNow(g), n: count(g), unfilled: g.unfilled });
    if (m && g.unfilled) toast({ icon: I.lock, title: `${p.name} did not fill`, sub: `It closed at ${count(g)} of ${minFill(p)} flats. Your UPI block is released, nothing is charged.`, href: `#/g/${g.id}` });
    else if (m) toast({ icon: I.lock, title: `${p.name} closed at ${inr(priceNow(g))}`, sub: `You are charged ${inr(priceNow(g) * m.q)}. Delivery ${deliveryLabel(g)}.`, href: `#/g/${g.id}` });
    save();
    if (route().name === 'group' && route().arg === g.id) render();
  });
}
function tick() {
  closeDue();
  $$('[data-b="left"], [data-b="clock"]').forEach(el => { const g = G(el.dataset.g); if (g) BIND[el.dataset.b](el, g); });
  const tt = $('[data-ticker-time]'); if (tt && tt.textContent && tt.textContent !== 'now') {/* keep */}
}
function loopSim() { setTimeout(() => { if (!document.hidden) simulateJoin(); loopSim(); }, 6000 + live() * 6000); }

/* ---------------- Router ---------------- */
function route() {
  const h = location.hash.replace(/^#\/?/, '');
  const [name, arg] = h.split('/');
  return { name: ({ '': 'discover', g: 'group', start: 'start', checkout: 'checkout', mine: 'mine', done: 'done' })[name] || 'discover', arg };
}
function go(h) { if (location.hash === h) render(); else location.hash = h; }
let prevRoute = '';
function render() {
  const r = route();
  closeBasket(false);
  fresh = null;
  ({ discover: viewDiscover, group: () => viewGroup(r.arg), start: () => viewStart(r.arg), checkout: viewCheckout, mine: viewMine, done: () => viewDone(r.arg) })[r.name]();
  $$('[data-nav]').forEach(a => a.toggleAttribute('aria-current', false));
  $$(`[data-nav="${r.name}"]`).forEach(a => a.setAttribute('aria-current', 'page'));
  const titles = { discover: 'Group buys in your society', group: PBY[G(r.arg)?.pid]?.name || 'Group buy', start: 'Start a group buy', checkout: 'Check out', mine: 'Your group buys', done: 'Order placed' };
  document.title = `${titles[r.name]} · GroupBuy`;
  const key = location.hash;
  if (key !== prevRoute) { window.scrollTo(0, 0); if (prevRoute) VIEW.focus({ preventScroll: true }); }
  prevRoute = key;
}

$('[data-reset]').addEventListener('click', () => {
  if (!confirm('Reset GroupBuy to its starting data? Your orders and groups here are cleared.')) return;
  localStorage.removeItem(STORE); load(); prevRoute = ''; go('#/');
});
window.addEventListener('hashchange', render);
// another tab changed the state: adopt it and refresh the live numbers in place (only the visible tab simulates)
window.addEventListener('storage', e => {
  if (e.key !== STORE || !e.newValue) return;
  try { S = JSON.parse(e.newValue); } catch { return; }
  S.groups.forEach(g => bind(g.id));
});

load();
render();
setInterval(tick, 1000);
loopSim();
