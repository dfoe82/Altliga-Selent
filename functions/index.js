/* Push-Nachrichten für die Mannschafts-App
 * Läuft bei Firebase (Cloud Functions, Region Frankfurt) und verschickt Nachrichten an alle Geräte,
 * auf denen in der App die Glocke aktiviert wurde (Sammlung „push“).
 *  - neueTermine:     neuer Termin oder neue Umfrage
 *  - neueNachricht:   neuer Beitrag an der Pinnwand (Admin oder Spieler), wichtige Nachrichten auf Wunsch an alle
 *  - erinnerungWichtig: Admin tippt „Erinnern“ → an alle, die die wichtige Nachricht noch nicht gelesen haben
 *  - neuerKommentar:  neuer Kommentar zu einem Termin oder einer Umfrage
 *  - neueUmfrage:     Umfrage der Mannschaft (von Spielern oder Admins)
 *  - neueChatNachricht / neueAdminNachricht: Mannschafts-Chat bzw. Admin-Chat
 *  - zahlungGemeldet: Spieler meldet eine Zahlung → Nachricht an Admins mit Kassen-Recht
 *  - zahlungVerrechnet: Zahlung bestätigt oder abgelehnt → Nachricht an den Spieler
 *  - Training fällt aus / findet doch statt / Halle oder draußen (in neueTermine)
 *  - kalender:        Kalender-Abo (iCal) für iPhone, Android/Google, Outlook – nur mit geheimem Link, wenn eingeschaltet
 *  - erinnerungen:    täglich 18 Uhr – Zu-/Absage am Vortag, offene Beträge einen Tag nach dem letzten Training/Spiel des Monats
 *  - geburtstage:     täglich 9 Uhr – Geburtstage im Team
 *  - geplanteMitteilungen: alle 15 Minuten – Push für wichtige Mitteilungen mit späterem Start
 * Alle Erinnerungen und das Kalender-Abo sind ab Werk aus und werden in der App unter Optionen eingeschaltet.
 * Module (Optionen → Module): ist „Push-Nachrichten“ oder der jeweilige Bereich aus, wird nichts verschickt.
 */
const functions = require('firebase-functions/v1');
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();
const fn = functions.region('europe-west3');

const WD = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
const TYPES = { game: 'Spiele', training: 'Trainings', event: 'Events' };

function evTitle(e) {
  if (e.type === 'game' && e.tour) return e.title || 'Turnier';
  if (e.type === 'game') return e.home === false ? `Auswärts bei ${e.title}` : `Heimspiel gegen ${e.title}`;
  if (e.type === 'training') return e.title || 'Training';
  return e.title || 'Termin';
}
function when(e) {
  const d = new Date(e.date + 'T12:00:00');
  return `${WD[d.getDay()]} ${d.getDate()}.${d.getMonth() + 1}.${e.time ? ', ' + e.time + ' Uhr' : ''}${e.meet || e.meetAt ? ' (Treffen' + (e.meet ? ' ' + e.meet : '') + (e.meetAt ? ', ' + e.meetAt : '') + ')' : ''}`;
}
const cut = (t, n) => (t.length > n ? t.slice(0, n - 1) + '…' : t);

async function appName() {
  const m = await db.doc('team/main').get();
  return (m.exists && m.data().appName) || 'Mannschaft';
}

/* Module aus team/main.mods; ältere Daten ohne „mods“ hatten alles an */
const MOD_NEEDS = { squad: ['players'], access: ['players'], kasse: ['players'] };
function modOn(m, k) {
  const mods = m && m.mods; if (!mods) return true;
  if (k === 'rsvp') return ['rsvp_training', 'rsvp_game', 'rsvp_event'].some(x => modOn(m, x));
  if (k === 'cmt') return ['cmt_training', 'cmt_game', 'cmt_event'].some(x => modOn(m, x));
  if (!mods[k]) return false;
  const need = MOD_NEEDS[k] || (k === 'players' ? [] : ['access']);
  return need.every(x => modOn(m, x));
}
const PREF_MOD = { chat: 'chat', news: null, cmt: 'cmt', bday: 'players', pay: 'kasse' };
async function mainDocRaw() { const m = await db.doc('team/main').get(); return m.exists ? m.data() : {}; }

/* Empfänger: nur Geräte mit gültigem Spielercode oder von aktuellen Admins; gesperrte Codes bekommen nichts */
async function recipients(pref, exclude) {
  const main = await mainDocRaw();
  if (!modOn(main, 'push')) return [];
  if (pref === 'news' && !modOn(main, 'board') && !modOn(main, 'akt')) return [];
  if (PREF_MOD[pref] && !modOn(main, PREF_MOD[pref])) return [];
  const [push, codes, members, admins] = await Promise.all([
    db.collection('push').get(), db.collection('codes').get(), db.collection('members').get(), db.collection('admins').get()]);
  const codeP = {}; codes.forEach(d => { codeP[d.id] = d.data().p; });
  const mem = {}; members.forEach(d => { mem[d.id] = d.data(); });
  const adm = new Set(admins.docs.map(d => d.id));
  const admP = {}; admins.forEach(d => { admP[d.id] = d.data().p || ''; });
  const out = [];
  push.forEach(d => {
    const x = d.data();
    if (!x.token || (x.prefs || {})[pref] === false) return;
    /* Spieler: gültiger Code – oder Admin, dem dieser Spieler fest zugeordnet ist */
    const okP = !!x.p && ((!!mem[d.id] && codeP[mem[d.id].code] === x.p) || (!!x.a && admP[x.a] === x.p));
    const okA = !!x.a && adm.has(x.a);
    if (!okP && !okA) return;
    if (exclude && ((exclude.p && x.p === exclude.p) || (exclude.a && x.a === exclude.a))) return;
    out.push({ id: d.id, token: x.token, url: x.url || '', p: okP ? x.p : '' });
  });
  return out;
}

async function send(list, title, body, tag) {
  for (let i = 0; i < list.length; i += 500) {
    const chunk = list.slice(i, i + 500);
    const res = await admin.messaging().sendEach(chunk.map(r => ({
      token: r.token,
      data: { title, body, url: r.url, tag },
      webpush: { headers: { Urgency: 'high', TTL: '86400' } }
    })));
    res.responses.forEach((x, j) => {
      const c = !x.success && x.error && x.error.code;
      if (c === 'messaging/registration-token-not-registered' || c === 'messaging/invalid-registration-token')
        db.doc('push/' + chunk[j].id).delete().catch(() => {});
    });
  }
}

exports.neueTermine = fn.firestore.document('team/events').onWrite(async chg => {
  if (!chg.before.exists || !chg.after.exists) return null;
  const b = chg.before.data().map || {}, a = chg.after.data().map || {};
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = Object.values(a).filter(e => e && e.id && e.date >= today);
  const added = upcoming.filter(e => !b[e.id]).sort((x, y) => (x.date + (x.time || '')).localeCompare(y.date + (y.time || '')));
  const polls = upcoming.filter(e => b[e.id] && !b[e.id].poll && e.poll && e.poll.open);
  /* Training abgesagt, wieder angesetzt oder verlegt (Halle/draußen) */
  const changed = upcoming.filter(e => b[e.id] &&
    (!!b[e.id].cancel !== !!e.cancel || (e.type === 'training' && (b[e.id].venue || 'out') !== (e.venue || 'out')))).sort((x, y) => x.date.localeCompare(y.date));
  if (!added.length && !polls.length && !changed.length) return null;
  const [list, name, mm] = await Promise.all([recipients('ev'), appName(), db.doc('team/main').get()]);
  if (!list.length) return null;
  const mainV = mm.exists ? mm.data().venues : null;
  for (const e of changed.slice(0, 3)) {
    const noun = { training: 'Training', game: 'Spiel', event: 'Event' }[e.type] || 'Termin', cx = e.type === 'game' ? 'abgesagt' : 'fällt aus';
    const what = e.cancel ? `${noun} ${cx}` : b[e.id].cancel ? `${noun} findet doch statt` : (e.venue === 'in' ? 'Training in der Halle' : e.venue === 'alt' ? 'Training: ' + (((mainV || {}).alt) || 'anderer Ort') : 'Training draußen');
    await send(list, `${name}: ${what}`, `${evTitle(e)} – ${when(e)}${!e.cancel && e.place ? ' · ' + e.place : ''}`, 'tr-' + e.id);
  }
  if (!added.length && !polls.length) return null;
  let title, body;
  if (added.length === 1) {
    const e = added[0];
    title = `${name}: ${e.poll ? 'Neuer Termin mit Umfrage' : 'Neuer Termin'}`;
    body = `${evTitle(e)} – ${when(e)}${e.poll ? ' · ' + e.poll.q : ''}`;
  } else if (added.length > 1) {
    const one = new Set(added.map(e => e.type)).size === 1;
    title = `${name}: ${added.length} neue ${one ? TYPES[added[0].type] : 'Termine'}`;
    body = `Ab ${when(added[0])}: ${evTitle(added[0])}`;
  } else {
    const e = polls[0];
    title = `${name}: Neue Umfrage`;
    body = `${e.poll.q} – ${evTitle(e)}, ${when(e)}`;
  }
  await send(list, title, cut(body, 180), 'termine');
  return null;
});

exports.neueNachricht = fn.firestore.document('news/{id}').onCreate(async snap => {
  const n = snap.data(); if (!n || !n.t) return null;
  /* Wichtige Nachricht: auf Wunsch an alle, auch wenn „Pinnwand“ an der Glocke aus ist */
  const [list, name, pl] = await Promise.all([recipients(n.imp && n.impPushAll ? '-' : 'news', { a: n.a, p: n.p }), appName(), n.p ? db.doc('team/players').get() : null]);
  if (!list.length) return null;
  const who = n.p ? (((pl && pl.exists && pl.data().list) || []).find(p => p.id === n.p) || {}).name || 'Jemand' : (n.an || 'Admin');
  if (n.imp && +n.impFrom > Date.now() + 60000) return null;   // geplanter Banner: Push erst zum Start (geplanteMitteilungen)
  const akt = n.cat === 'akt' || n.imp;
  const title = n.imp ? `⚠️ WICHTIG · ${name}` : akt ? `${name}: Aktuelles von ${who}` : n.p ? `${name}: ${who} an der Pinnwand` : `${name}: ${n.pin ? '📌 ' : ''}Nachricht von ${who}`;
  await send(list, title, cut(akt ? `${n.ti ? n.ti + ' – ' : ''}${n.t}` : n.t, 220), 'news-' + snap.id);
  if (n.imp && snap.ref) await snap.ref.update({ pushed: true }).catch(() => {});
  return null;
});

/* Admin tippt „Erinnern“: noch einmal an alle Spieler, die die wichtige Nachricht nicht als gelesen bestätigt haben */
exports.erinnerungWichtig = fn.firestore.document('nremind/{id}').onCreate(async snap => {
  const r = snap.data() || {}; if (!r.n) return null;
  const [nd, reads, list, name] = await Promise.all([db.doc('news/' + r.n).get(), db.collection('nreads').where('n', '==', r.n).get(), recipients('-'), appName()]);
  if (!nd.exists) return null;
  const done = new Set(reads.docs.map(d => d.data().p));
  const target = list.filter(x => x.p && !done.has(x.p));
  if (target.length) await send(target, `⚠️ Erinnerung · ${name}`, cut(`Bitte lesen und bestätigen: ${nd.data().t}`, 200), 'news-' + r.n);
  if (snap.ref) await snap.ref.delete().catch(() => {});
  return null;
});

exports.neuerKommentar = fn.firestore.document('comments/{id}').onCreate(async snap => {
  const c = snap.data(); if (!c || c.rm || !c.t) return null;
  const [ev, pl, name, list] = await Promise.all([db.doc('team/events').get(), db.doc('team/players').get(), appName(), recipients('cmt', { p: c.p, a: c.a })]);
  if (!list.length) return null;
  const e = c.k !== 'news' && ev.exists && (ev.data().map || {})[c.e];
  const who = c.p ? (((pl.exists && pl.data().list) || []).find(p => p.id === c.p) || {}).name || 'Jemand' : (c.an || 'Admin');
  const where = c.k === 'news' ? 'Pinnwand' : e ? `${evTitle(e)} (${when(e)})` : 'Termin';
  await send(list, `${name}: ${who} ${c.k === 'poll' ? 'zur Umfrage' : 'hat kommentiert'}`, cut(`${where}: ${c.t}`, 200), 'cmt-' + c.e);
  return null;
});

exports.neueUmfrage = fn.firestore.document('polls/{id}').onCreate(async snap => {
  const x = snap.data(); if (!x || !x.q) return null;
  const [pl, name, list] = await Promise.all([db.doc('team/players').get(), appName(), recipients('ev', { p: x.p, a: x.a })]);
  if (!list.length) return null;
  const who = x.p ? (((pl.exists && pl.data().list) || []).find(p => p.id === x.p) || {}).name || 'Jemand' : (x.an || 'Admin');
  await send(list, `${name}: Neue Umfrage von ${who}`, cut(`${x.q} – ${(x.opts || []).join(' / ')}`, 200), 'poll-' + snap.id);
  return null;
});

/* Geräte von Admins mit Recht auf eine Kasse (für gemeldete Zahlungen) */
async function moneyAdmins() {
  const [push, admins] = await Promise.all([db.collection('push').get(), db.collection('admins').get()]);
  const ok = new Set(admins.docs.filter(d => { const a = d.data(); return a.role !== 'part' || (a.areas || []).some(x => ['drinks', 'team', 'misc', 'finance'].includes(x)); }).map(d => d.id));
  const out = [];
  push.forEach(d => { const x = d.data(); if (x.token && x.a && ok.has(x.a)) out.push({ id: d.id, token: x.token, url: x.url || '' }); });
  return out;
}
const eur = n => (Math.round(n * 100) / 100).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
const METHODS = { paypal: 'PayPal', bank: 'Überweisung', cash: 'bar', other: '' };

exports.zahlungGemeldet = fn.firestore.document('payreq/{id}').onCreate(async snap => {
  const x = snap.data(); if (!x) return null;
  const [pl, name, list] = await Promise.all([db.doc('team/players').get(), appName(), moneyAdmins()]);
  if (!list.length) return null;
  const who = (((pl.exists && pl.data().list) || []).find(p => p.id === x.p) || {}).name || 'Ein Spieler';
  await send(list, `${name}: Zahlung gemeldet`, cut(`${who} hat ${eur(x.amount)}${METHODS[x.method] ? ' per ' + METHODS[x.method] : ''} gemeldet${x.note ? ' – ' + x.note : ''}`, 200), 'pay-' + snap.id);
  return null;
});

exports.zahlungVerrechnet = fn.firestore.document('payreq/{id}').onUpdate(async chg => {
  const b = chg.before.data(), a = chg.after.data();
  if (!a || b.status === a.status || !['done', 'rejected'].includes(a.status)) return null;
  /* persönliche Nachricht: nur an die Geräte dieses Spielers (gültiger Code), unabhängig von den Themen */
  const [all, push] = await Promise.all([recipients('-'), db.collection('push').get()]);
  const mine = new Set(push.docs.filter(d => d.data().p === a.p).map(d => d.id));
  const target = all.filter(r => mine.has(r.id));
  if (!target.length) return null;
  const name = await appName();
  await send(target, `${name}: ${a.status === 'done' ? 'Zahlung verrechnet' : 'Zahlung nicht verrechnet'}`,
    a.status === 'done' ? `Deine Zahlung über ${eur(a.amount)} wurde verbucht. Danke!` : `Deine Meldung über ${eur(a.amount)} wurde abgelehnt – bitte beim Kassenwart nachfragen.`, 'pay-' + chg.after.id);
  return null;
});

/* Chat: Nachricht an alle (außer Absender), die „Chat-Nachrichten“ in der Glocke aktiviert haben */
async function chatPush(m, id, adminsOnly) {
  const [list, name, pl, admins] = await Promise.all([recipients('chat', { p: m.p, a: m.a }), appName(), db.doc('team/players').get(), adminsOnly ? db.collection('admins').get() : null]);
  let target = list;
  if (adminsOnly) { const ok = new Set(admins.docs.map(d => d.id)); const push = await db.collection('push').get(); const ad = new Set(push.docs.filter(d => d.data().a && ok.has(d.data().a)).map(d => d.id)); target = list.filter(r => ad.has(r.id)); }
  if (!target.length) return null;
  const who = m.p ? (((pl.exists && pl.data().list) || []).find(p => p.id === m.p) || {}).name || 'Jemand' : (m.an || 'Admin');
  const what = m.t ? m.t : m.img ? '📷 Foto' : m.poll ? '📊 Umfrage' : '';
  await send(target, adminsOnly ? `${name} · Admin-Chat` : `${name} · Chat`, cut(`${who}: ${what}`, 200), adminsOnly ? 'chatadm' : 'chat');
  return null;
}
exports.neueChatNachricht = fn.firestore.document('chat/{id}').onCreate(snap => chatPush(snap.data() || {}, snap.id, false));
exports.neueAdminNachricht = fn.firestore.document('chatadm/{id}').onCreate(snap => chatPush(snap.data() || {}, snap.id, true));

/* ---------- Datum in deutscher Zeit ---------- */
const berlin = (ms) => new Date(ms).toLocaleDateString('sv-SE', { timeZone: 'Europe/Berlin' }); // JJJJ-MM-TT
const DAY = 86400000;
async function mainDoc() { const m = await db.doc('team/main').get(); return m.exists ? m.data() : {}; }
const playerName = (pl, pid) => (((pl.exists && pl.data().list) || []).find(p => p.id === pid) || {}).name || '';

/* ---------- Kalender-Abo ---------- */
const ICS_DUR = { game: 120, training: 90, event: 180 };
function icsText(events, name, venues = {}) {
  const esc = t => String(t || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
  const fold = l => { const out = []; let cur = ''; for (const ch of l) { if (Buffer.byteLength(cur + ch) > 74) { out.push(cur); cur = ' ' + ch; } else cur += ch; } out.push(cur); return out.join('\r\n'); };
  const loc = (d, t) => d.replace(/-/g, '') + 'T' + t.replace(':', '') + '00';
  const add = (d, t, min) => new Date(Date.UTC(+d.slice(0, 4), +d.slice(5, 7) - 1, +d.slice(8, 10), +t.slice(0, 2), +t.slice(3, 5)) + min * 60000).toISOString().slice(0, 16).replace(/[-:]/g, '') + '00';
  const stamp = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z';
  const L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Mannschafts-App//DE', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'X-WR-CALNAME:' + esc(name), 'X-WR-TIMEZONE:Europe/Berlin',
    'REFRESH-INTERVAL;VALUE=DURATION:PT2H', 'X-PUBLISHED-TTL:PT2H',
    'BEGIN:VTIMEZONE', 'TZID:Europe/Berlin', 'BEGIN:DAYLIGHT', 'TZOFFSETFROM:+0100', 'TZOFFSETTO:+0200', 'TZNAME:CEST', 'DTSTART:19700329T020000', 'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU', 'END:DAYLIGHT',
    'BEGIN:STANDARD', 'TZOFFSETFROM:+0200', 'TZOFFSETTO:+0100', 'TZNAME:CET', 'DTSTART:19701025T030000', 'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU', 'END:STANDARD', 'END:VTIMEZONE'];
  events.forEach(e => {
    const t = /^\d\d:\d\d$/.test(e.time || '') ? e.time : '', tr = e.type === 'training';
    const title = (e.cancel ? 'Abgesagt: ' : '') + evTitle(e) + (tr && !e.cancel ? (e.venue === 'in' ? ' (Halle)' : e.venue === 'alt' ? ' (' + (venues.alt || 'anderer Ort') + ')' : ' (draußen)') : '');
    L.push('BEGIN:VEVENT', 'UID:' + e.id + '@mannschafts-app', 'DTSTAMP:' + stamp);
    const mt = /^\d\d:\d\d$/.test(e.meet || '') && (!t || e.meet < t) ? e.meet : '';
    if (t || mt) L.push('DTSTART;TZID=Europe/Berlin:' + loc(e.date, mt || t), 'DTEND;TZID=Europe/Berlin:' + add(e.date, t || mt, ICS_DUR[e.type] || 120));
    else { const n = new Date(Date.UTC(+e.date.slice(0, 4), +e.date.slice(5, 7) - 1, +e.date.slice(8, 10) + 1)).toISOString().slice(0, 10).replace(/-/g, ''); L.push('DTSTART;VALUE=DATE:' + e.date.replace(/-/g, ''), 'DTEND;VALUE=DATE:' + n); }
    L.push('SUMMARY:' + esc(title));
    if (e.place) L.push('LOCATION:' + esc(e.place));
    { const sw = e.type === 'game' && !e.tour ? 'Anpfiff' : 'Beginn'; const dsc = [e.meet || e.meetAt ? 'Treffen' + (e.meet ? ' ' + e.meet : '') + (e.meetAt ? ', ' + e.meetAt : '') : '', e.meet && t ? sw + ' ' + t + ' Uhr' : '', e.note || ''].filter(Boolean).join('\n'); if (dsc) L.push('DESCRIPTION:' + esc(dsc)); }
    if (e.cancel) L.push('STATUS:CANCELLED');
    L.push('END:VEVENT');
  });
  L.push('END:VCALENDAR');
  return L.map(fold).join('\r\n') + '\r\n';
}
exports.kalender = fn.https.onRequest(async (req, res) => {
  const m = await mainDoc();
  const t = String(req.query.t || '');
  if (!m.calOn || !m.calToken || t.length < 16 || t !== m.calToken) { res.status(404).send('Kalender nicht gefunden'); return; }
  const ev = await db.doc('team/events').get();
  const from = berlin(Date.now() - 90 * DAY);
  const list = Object.values((ev.exists && ev.data().map) || {}).filter(e => e && e.id && e.date >= from)
    .sort((a, b) => (a.date + (a.time || '')).localeCompare(b.date + (b.time || '')));
  res.set('Content-Type', 'text/calendar; charset=utf-8');
  res.set('Content-Disposition', 'inline; filename="termine.ics"');
  res.set('Cache-Control', 'public, max-age=900');
  res.status(200).send(icsText(list, m.appName || 'Mannschaft', m.venues || {}));
});

/* ---------- Erinnerungen ---------- */
async function rsvpReminders(m, name, today) {
  const tomorrow = berlin(Date.parse(today + 'T12:00:00Z') + DAY);
  const ev = await db.doc('team/events').get();
  const due = Object.values((ev.exists && ev.data().map) || {}).filter(e => e && e.date === tomorrow && ['game', 'training'].includes(e.type) && !e.cancel && e.poll && e.poll.open);
  if (!due.length) return 0;
  const list = (await recipients('rem')).filter(r => r.p);
  let n = 0;
  for (const e of due) {
    const votes = await db.collection('votes').where('e', '==', e.id).get();
    const voted = new Set(votes.docs.map(d => d.data().p));
    const target = list.filter(r => !voted.has(r.p));
    if (!target.length) continue;
    await send(target, `${name}: Bist du morgen dabei?`, cut(`${evTitle(e)} – ${when(e)}. Bitte kurz zu- oder absagen.`, 180), 'rsvp-' + e.id);
    n += target.length;
  }
  return n;
}
async function debtReminders(m, name, today) {
  const yesterday = berlin(Date.parse(today + 'T12:00:00Z') - DAY), month = yesterday.slice(0, 7);
  const [ev, dr] = await Promise.all([db.doc('team/events').get(), db.doc('team/drinks').get()]);
  const dates = Object.values((ev.exists && ev.data().map) || {}).filter(e => e && ['game', 'training'].includes(e.type) && !e.cancel && String(e.date).startsWith(month)).map(e => e.date)
    .concat(((dr.exists && dr.data().days) || []).map(d => d.date).filter(d => String(d).startsWith(month)));
  if (!dates.length || dates.sort().pop() !== yesterday) return 0;   // nur am Tag nach dem letzten Training/Spiel des Monats
  const bal = await db.collection('balances').get();
  const open = new Set(bal.docs.filter(d => (d.data().due || 0) > 0).map(d => d.id));
  const target = (await recipients('rem')).filter(r => r.p && open.has(r.p));
  if (!target.length) return 0;
  await send(target, `${name}: Offener Betrag`, 'Bei dir ist noch etwas offen. Tippe hier für deinen Stand – Zahlung per PayPal oder melden geht direkt in der App.', 'debt-' + month);
  return target.length;
}
exports.erinnerungen = fn.pubsub.schedule('0 18 * * *').timeZone('Europe/Berlin').onRun(async () => {
  const m = await mainDoc(); if (!m.remRsvp && !m.remDebt) return null;
  const name = m.appName || 'Mannschaft', today = berlin(Date.now());
  if (!modOn(m, 'push')) return null;
  if (m.remRsvp && modOn(m, 'rsvp')) await rsvpReminders(m, name, today);
  if (m.remDebt && modOn(m, 'kasse')) await debtReminders(m, name, today);
  return null;
});
exports.geburtstage = fn.pubsub.schedule('0 9 * * *').timeZone('Europe/Berlin').onRun(async () => {
  const m = await mainDoc(); if (!m.remBday || !modOn(m, 'push') || !modOn(m, 'players')) return null;
  const today = berlin(Date.now()), md = today.slice(5);
  const leap = y => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
  const [pv, pl] = await Promise.all([db.doc('team/private').get(), db.doc('team/players').get()]);
  const birth = (pv.exists && pv.data().birth) || {};
  const kids = Object.entries(birth).filter(([pid, d]) => { const x = String(d).slice(5); return playerName(pl, pid) && (x === md || (x === '02-29' && md === '02-28' && !leap(+today.slice(0, 4)))); }).map(([pid]) => pid);
  if (!kids.length) return null;
  const name = m.appName || 'Mannschaft', list = await recipients('bday');
  for (const pid of kids) {
    const who = playerName(pl, pid);
    const own = list.filter(r => r.p === pid), others = list.filter(r => r.p !== pid);
    if (others.length) await send(others, `${name}: 🎂 Geburtstag`, `Heute hat ${who} Geburtstag – Glückwünsche nicht vergessen!`, 'bday-' + pid);
    if (own.length) await send(own, `${name}: 🎂 Alles Gute, ${who}!`, 'Die ganze Mannschaft wünscht dir alles Gute zum Geburtstag!', 'bday-' + pid);
  }
  return null;
});

/* Geplante wichtige Mitteilungen: Push, sobald der Banner startet (alle 15 Minuten geprüft) */
exports.geplanteMitteilungen = fn.pubsub.schedule('every 15 minutes').timeZone('Europe/Berlin').onRun(async () => {
  const qs = await db.collection('news').where('imp', '==', true).get();
  const now = Date.now();
  const due = qs.docs.filter(d => { const x = d.data(); return +x.impFrom > 0 && +x.impFrom <= now && now - x.impFrom < 864e5 && !x.pushed && (!x.impUntil || x.impUntil > now); });
  if (!due.length) return null;
  const name = await appName();
  for (const d of due) {
    const n = d.data();
    const list = await recipients(n.impPushAll ? '-' : 'news', { a: n.a });
    if (list.length) await send(list, `⚠️ WICHTIG · ${name}`, cut(`${n.ti ? n.ti + ' – ' : ''}${n.t}`, 220), 'news-' + d.id);
    if (d.ref) await d.ref.update({ pushed: true }).catch(() => {});
  }
  return null;
});
