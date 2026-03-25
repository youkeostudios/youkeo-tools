// progression.js — Chord Progression Builder

// ── SVG renderer (duplicated from app.js — self-contained) ─────────────────
const SVG_COLORS = {
  nut:        '#F5F5F5',
  grid:       '#555555',
  gridLine:   '#444444',
  barre:      '#F5F5F5',
  dot:        '#F5F5F5',
  mute:       '#888888',
  openCircle: '#F5F5F5',
  fretNum:    '#AAAAAA',
};

function renderChordSVG(chord, scale) {
  scale = scale || 1;
  const STRING_COUNT = 6;
  const FRET_COUNT   = 4;
  const CELL_W    = 28 * scale;
  const CELL_H    = 28 * scale;
  const NUT_H     = 6  * scale;
  const LEFT_PAD  = 26 * scale;
  const TOP_PAD   = 38 * scale;
  const RIGHT_PAD = 10 * scale;
  const BOT_PAD   = 16 * scale;

  const w = LEFT_PAD + (STRING_COUNT - 1) * CELL_W + RIGHT_PAD;
  const h = TOP_PAD + FRET_COUNT * CELL_H + BOT_PAD;

  const startFret = chord.startFret || 1;
  const isOpenPos = startFret === 1;

  let svg = `<svg class="chord-svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">`;

  if (isOpenPos) {
    svg += `<rect x="${LEFT_PAD}" y="${TOP_PAD - NUT_H}" width="${(STRING_COUNT-1)*CELL_W}" height="${NUT_H}" fill="${SVG_COLORS.nut}"/>`;
  } else {
    svg += `<line x1="${LEFT_PAD}" y1="${TOP_PAD}" x2="${LEFT_PAD+(STRING_COUNT-1)*CELL_W}" y2="${TOP_PAD}" stroke="${SVG_COLORS.nut}" stroke-width="1.5"/>`;
  }

  for (let f = 1; f <= FRET_COUNT; f++) {
    const y = TOP_PAD + f * CELL_H;
    svg += `<line x1="${LEFT_PAD}" y1="${y}" x2="${LEFT_PAD+(STRING_COUNT-1)*CELL_W}" y2="${y}" stroke="${SVG_COLORS.grid}" stroke-width="1"/>`;
    const fretNum = startFret + f - 1;
    const labelY  = TOP_PAD + (f - 0.5) * CELL_H + 4 * scale;
    svg += `<text x="${LEFT_PAD - 5*scale}" y="${labelY}" text-anchor="end" font-family="Inter,sans-serif" font-size="${10*scale}" fill="${SVG_COLORS.fretNum}">${fretNum}</text>`;
  }
  for (let s = 0; s < STRING_COUNT; s++) {
    const x = LEFT_PAD + s * CELL_W;
    svg += `<line x1="${x}" y1="${TOP_PAD}" x2="${x}" y2="${TOP_PAD+FRET_COUNT*CELL_H}" stroke="${SVG_COLORS.gridLine}" stroke-width="1"/>`;
  }

  if (chord.barre) {
    const { fret, fromString, toString: toStr } = chord.barre;
    const relFret = fret - startFret + 1;
    if (relFret >= 1 && relFret <= FRET_COUNT) {
      const x1 = LEFT_PAD + (fromString - 1) * CELL_W;
      const x2 = LEFT_PAD + (toStr - 1) * CELL_W;
      const cy = TOP_PAD + (relFret - 0.5) * CELL_H;
      svg += `<rect x="${Math.min(x1,x2)}" y="${cy - 9*scale}" width="${Math.abs(x2-x1)}" height="${18*scale}" rx="${9*scale}" fill="${SVG_COLORS.barre}"/>`;
    }
  }

  chord.frets.forEach((fret, i) => {
    const x = LEFT_PAD + i * CELL_W;
    if (fret === -1) {
      svg += `<text x="${x}" y="${TOP_PAD - NUT_H - 2*scale}" text-anchor="middle" font-family="Inter,sans-serif" font-size="${13*scale}" font-weight="bold" fill="${SVG_COLORS.mute}">✕</text>`;
    } else if (fret === 0) {
      svg += `<circle cx="${x}" cy="${TOP_PAD - NUT_H - 7*scale}" r="${5*scale}" fill="none" stroke="${SVG_COLORS.openCircle}" stroke-width="${1.5*scale}"/>`;
    } else {
      const relFret = fret - startFret + 1;
      if (relFret >= 1 && relFret <= FRET_COUNT) {
        const cy = TOP_PAD + (relFret - 0.5) * CELL_H;
        const barreCoversThis = chord.barre && chord.barre.fret === fret &&
          i >= (chord.barre.fromString - 1) && i <= (chord.barre.toString - 1);
        if (!barreCoversThis)
          svg += `<circle cx="${x}" cy="${cy}" r="${10*scale}" fill="${SVG_COLORS.dot}"/>`;
      }
    }
  });

  svg += '</svg>';
  return svg;
}

// ── Piano SVG renderer (inlined so progression.js stays self-contained) ────
const PIANO_IS_BLACK = [false,true,false,true,false,false,true,false,true,false,true,false];
const PIANO_BLACK_OFFSETS = { 1:0.65, 3:1.65, 6:3.65, 8:4.65, 10:5.65 };

function renderPianoSVG(voicing, scale) {
  scale = scale || 1;
  const KEY_W  = 26 * scale;
  const KEY_H  = 80 * scale;
  const BLK_W  = 16 * scale;
  const BLK_H  = 52 * scale;
  const PAD_X  = 10 * scale;
  const PAD_Y  = 8  * scale;
  const LABEL_SIZE = 9 * scale;
  const NUM_WHITE = 14;
  const w = NUM_WHITE * KEY_W + 2 * PAD_X;
  const h = KEY_H + 2 * PAD_Y;

  const highlighted = new Set(voicing.notePositions);

  const xPos = {};
  let wi = 0;
  for (let s = 0; s < 24; s++) {
    const note = s % 12;
    if (!PIANO_IS_BLACK[note]) { xPos[s] = PAD_X + wi * KEY_W; wi++; }
  }
  for (let oct = 0; oct < 2; oct++) {
    for (const [noteStr, off] of Object.entries(PIANO_BLACK_OFFSETS)) {
      const s = oct * 12 + +noteStr;
      const octWhiteStart = oct * 7;
      xPos[s] = PAD_X + (octWhiteStart + off) * KEY_W;
    }
  }

  let svg = `<svg class="piano-svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">`;
  svg += `<rect x="0" y="0" width="${w}" height="${h}" fill="transparent"/>`;

  for (let s = 0; s < 24; s++) {
    const note = s % 12;
    if (PIANO_IS_BLACK[note]) continue;
    const x = xPos[s];
    const isLit = highlighted.has(s);
    svg += `<rect x="${x + scale}" y="${PAD_Y}" width="${KEY_W - 2*scale}" height="${KEY_H}" rx="${2*scale}" fill="${isLit ? '#E8365D' : '#F0F0F0'}" stroke="#333" stroke-width="${scale}"/>`;
    if (isLit) {
      const label = PIANO_NOTES[note];
      svg += `<text x="${x + KEY_W/2}" y="${PAD_Y + KEY_H - 7*scale}" text-anchor="middle" font-family="Inter,sans-serif" font-size="${LABEL_SIZE}" font-weight="700" fill="#fff">${label}</text>`;
    }
  }
  for (let s = 0; s < 24; s++) {
    const note = s % 12;
    if (!PIANO_IS_BLACK[note]) continue;
    const x = xPos[s];
    const isLit = highlighted.has(s);
    svg += `<rect x="${x - BLK_W/2}" y="${PAD_Y}" width="${BLK_W}" height="${BLK_H}" rx="${2*scale}" fill="${isLit ? '#E8365D' : '#111'}"/>`;
    if (isLit) {
      const label = PIANO_NOTES[note];
      svg += `<text x="${x}" y="${PAD_Y + BLK_H - 7*scale}" text-anchor="middle" font-family="Inter,sans-serif" font-size="${LABEL_SIZE - scale}" font-weight="700" fill="#fff">${label}</text>`;
    }
  }
  svg += '</svg>';
  return svg;
}

// ── Scale definitions ──────────────────────────────────────────────────────
const PROG_SCALE_DIATONIC = {
  major: [
    { interval:0,  type:'major',     roman:'I'    },
    { interval:2,  type:'minor',     roman:'ii'   },
    { interval:4,  type:'minor',     roman:'iii'  },
    { interval:5,  type:'major',     roman:'IV'   },
    { interval:7,  type:'major',     roman:'V'    },
    { interval:9,  type:'minor',     roman:'vi'   },
    { interval:11, type:'dim',       roman:'vii°' },
  ],
  minor: [
    { interval:0,  type:'minor',     roman:'i'    },
    { interval:2,  type:'dim',       roman:'ii°'  },
    { interval:3,  type:'major',     roman:'III'  },
    { interval:5,  type:'minor',     roman:'iv'   },
    { interval:7,  type:'minor',     roman:'v'    },
    { interval:8,  type:'major',     roman:'VI'   },
    { interval:10, type:'major',     roman:'VII'  },
  ],
  majorPent: [
    { interval:0,  type:'major',     roman:'I'   },
    { interval:2,  type:'minor',     roman:'ii'  },
    { interval:4,  type:'major',     roman:'III' },
    { interval:7,  type:'major',     roman:'V'   },
    { interval:9,  type:'minor',     roman:'vi'  },
  ],
  minorPent: [
    { interval:0,  type:'minor',     roman:'i'   },
    { interval:3,  type:'major',     roman:'III' },
    { interval:5,  type:'minor',     roman:'iv'  },
    { interval:7,  type:'minor',     roman:'v'   },
    { interval:10, type:'major',     roman:'VII' },
  ],
  dorian: [
    { interval:0,  type:'minor',     roman:'i'    },
    { interval:2,  type:'minor',     roman:'ii'   },
    { interval:3,  type:'major',     roman:'III'  },
    { interval:5,  type:'major',     roman:'IV'   },
    { interval:7,  type:'minor',     roman:'v'    },
    { interval:9,  type:'dim',       roman:'vi°'  },
    { interval:10, type:'major',     roman:'VII'  },
  ],
  mixolydian: [
    { interval:0,  type:'major',     roman:'I'    },
    { interval:2,  type:'minor',     roman:'ii'   },
    { interval:4,  type:'dim',       roman:'iii°' },
    { interval:5,  type:'major',     roman:'IV'   },
    { interval:7,  type:'minor',     roman:'v'    },
    { interval:9,  type:'minor',     roman:'vi'   },
    { interval:10, type:'major',     roman:'VII'  },
  ],
};

const PROG_SCALE_LABEL = {
  major:      'Major',
  minor:      'Minor (Natural)',
  majorPent:  'Major Pentatonic',
  minorPent:  'Minor Pentatonic',
  dorian:     'Dorian',
  mixolydian: 'Mixolydian',
};

// ── Chord type labels ──────────────────────────────────────────────────────
const TYPE_LABEL = {
  major: 'Major', minor: 'Minor', dominant7: '7',
  major7: 'maj7', minor7: 'm7', sus2: 'sus2', sus4: 'sus4',
  dim: 'dim', aug: 'aug', major6: '6', minor6: 'm6',
};

function chordLabel(note, type) {
  return note + ' ' + (TYPE_LABEL[type] || type);
}

// ── Preset progressions ────────────────────────────────────────────────────
// Each chord: { s: semitones_from_key, t: chord_type }
// mode: 'major' | 'minor' — used to filter presets when a scale is active
const PRESETS = [
  {
    name: 'I – V – vi – IV', mode: 'major',
    chords: [{ s:0,t:'major' }, { s:7,t:'major' }, { s:9,t:'minor' }, { s:5,t:'major' }],
  },
  {
    name: 'I – IV – V', mode: 'major',
    chords: [{ s:0,t:'major' }, { s:5,t:'major' }, { s:7,t:'major' }],
  },
  {
    name: 'I – vi – IV – V', mode: 'major',
    chords: [{ s:0,t:'major' }, { s:9,t:'minor' }, { s:5,t:'major' }, { s:7,t:'major' }],
  },
  {
    name: 'i – VI – III – VII', mode: 'minor',
    chords: [{ s:0,t:'minor' }, { s:8,t:'major' }, { s:3,t:'major' }, { s:10,t:'major' }],
  },
  {
    name: 'ii – V – I', mode: 'major',
    chords: [{ s:2,t:'minor' }, { s:7,t:'dominant7' }, { s:0,t:'major' }],
  },
  {
    name: 'i – iv – VII – III', mode: 'minor',
    chords: [{ s:0,t:'minor' }, { s:5,t:'minor' }, { s:10,t:'major' }, { s:3,t:'major' }],
  },
  {
    name: 'I – IV – vi – V', mode: 'major',
    chords: [{ s:0,t:'major' }, { s:5,t:'major' }, { s:9,t:'minor' }, { s:7,t:'major' }],
  },
  {
    name: 'I – I – IV – V', mode: 'major',
    chords: [{ s:0,t:'major' }, { s:0,t:'major' }, { s:5,t:'major' }, { s:7,t:'major' }],
  },
];

// ── Instrument mode helpers ────────────────────────────────────────────────
let instrMode = 'guitar'; // 'guitar' | 'piano'

function getActiveData()   { return instrMode === 'piano' ? PIANO_CHORD_DATA : CHORD_DATA; }
function renderDiagram(voicing, scale) {
  return instrMode === 'piano' ? renderPianoSVG(voicing, scale) : renderChordSVG(voicing, scale);
}
function slotScale()   { return instrMode === 'piano' ? 0.46 : 0.78; }
function pickerScale() { return instrMode === 'piano' ? 0.52 : 0.72; }
function getVoicingLabel(v) {
  return instrMode === 'piano' ? (v.inversionLabel || '') : (v.type === 'open' ? 'Open' : 'Barre');
}

// ── State ──────────────────────────────────────────────────────────────────
let slots        = [];   // [{note, chordType, voicingIdx}]
let editingIdx   = null; // null = add mode, number = edit mode
let pickerNote   = 'C';
let pickerType   = 'major';
let pickerVoicingIdx = 0;

// ── DOM refs ───────────────────────────────────────────────────────────────
const instrToggleEl      = document.getElementById('instr-toggle');
const keySelect          = document.getElementById('prog-key');
const scaleSelect        = document.getElementById('prog-scale');
const scaleSuggestionsEl = document.getElementById('scale-suggestions');
const scaleSugLabelEl    = document.getElementById('scale-suggestions-label');
const scaleSugGridEl     = document.getElementById('scale-suggestions-grid');
const presetButtonsEl = document.getElementById('preset-buttons');
const slotsEl         = document.getElementById('progression-slots');
const btnAddSlot      = document.getElementById('btn-add-slot');
const btnClear        = document.getElementById('btn-clear');
const pickerHeading   = document.getElementById('picker-heading');
const pickerNoteEl    = document.getElementById('picker-note');
const pickerTypeEl    = document.getElementById('picker-type');
const pickerVoicingsEl= document.getElementById('picker-voicings');
const btnCommit       = document.getElementById('btn-commit');
const btnCancelEdit   = document.getElementById('btn-cancel-edit');

// ── Populate key + picker dropdowns ───────────────────────────────────────
NOTES.forEach(note => {
  [keySelect, pickerNoteEl].forEach(el => {
    const opt = document.createElement('option');
    opt.value = note;
    opt.textContent = note;
    el.appendChild(opt);
  });
});

// Scale dropdown: "None" + all scale types
const scaleNoneOpt = document.createElement('option');
scaleNoneOpt.value = ''; scaleNoneOpt.textContent = 'None';
scaleSelect.appendChild(scaleNoneOpt);
Object.entries(PROG_SCALE_LABEL).forEach(([val, label]) => {
  const opt = document.createElement('option');
  opt.value = val; opt.textContent = label;
  scaleSelect.appendChild(opt);
});

CHORD_TYPES.forEach(ct => {
  const opt = document.createElement('option');
  opt.value = ct.value;
  opt.textContent = ct.label;
  pickerTypeEl.appendChild(opt);
});

// ── Build preset buttons (filtered by active scale mode) ──────────────────
function renderPresets() {
  const activeScale = getActiveProgScale();
  const scaleType   = activeScale ? activeScale.type : null;

  // Determine which mode to show: major-like vs minor-like scales
  const minorScales = new Set(['minor', 'minorPent', 'dorian']);
  const filterMode  = scaleType
    ? (minorScales.has(scaleType) ? 'minor' : 'major')
    : null;

  presetButtonsEl.innerHTML = '';
  PRESETS.forEach(preset => {
    if (filterMode && preset.mode !== filterMode) return;
    const btn = document.createElement('button');
    btn.className = 'preset-btn';
    btn.textContent = preset.name;
    btn.addEventListener('click', () => loadPreset(preset));
    presetButtonsEl.appendChild(btn);
  });
}

renderPresets();

// ── Note helper ────────────────────────────────────────────────────────────
function noteAt(root, semitones) {
  return NOTES[(NOTES.indexOf(root) + semitones) % 12];
}

// ── Load preset ────────────────────────────────────────────────────────────
function loadPreset(preset) {
  const key  = keySelect.value;
  const data = getActiveData();
  slots = preset.chords
    .map(c => ({ note: noteAt(key, c.s), chordType: c.t, voicingIdx: 0 }))
    .filter(s => {
      const v = (data[s.note] || {})[s.chordType];
      return v && v.length > 0;
    });
  exitEditMode();
  renderAll();
}

// ── Render ─────────────────────────────────────────────────────────────────
function renderAll() {
  renderSlots();
  renderPickerVoicings();
}

function renderSlots() {
  slotsEl.innerHTML = '';

  if (slots.length === 0) {
    slotsEl.innerHTML = '<p class="progression-empty">No chords yet — load a preset or add chords below.</p>';
    return;
  }

  const data = getActiveData();
  slots.forEach((slot, i) => {
    const voicings = (data[slot.note] || {})[slot.chordType] || [];
    const voicing  = voicings[slot.voicingIdx] || voicings[0];
    if (!voicing) return;

    const card = document.createElement('div');
    card.className = 'prog-slot' + (editingIdx === i ? ' editing' : '');
    card.dataset.i = i;
    card.innerHTML = `
      <button class="slot-remove" data-action="remove" data-i="${i}" title="Remove">✕</button>
      <div class="prog-slot-num">Chord ${i + 1}</div>
      <div class="prog-slot-name">${chordLabel(slot.note, slot.chordType)}</div>
      <div class="prog-slot-diagram">${renderDiagram(voicing, slotScale())}</div>
      <div class="prog-slot-actions">
        <button class="slot-action-btn" data-action="left"  data-i="${i}" title="Move left">←</button>
        <button class="slot-action-btn" data-action="right" data-i="${i}" title="Move right">→</button>
      </div>
    `;
    slotsEl.appendChild(card);
  });
}

function renderPickerVoicings() {
  pickerVoicingsEl.innerHTML = '';
  const voicings = (getActiveData()[pickerNote] || {})[pickerType] || [];

  if (!voicings.length) {
    pickerVoicingsEl.innerHTML = '<p style="color:var(--midgray);font-size:13px;padding:8px 0">No voicings found.</p>';
    return;
  }

  pickerVoicingIdx = Math.min(pickerVoicingIdx, voicings.length - 1);

  voicings.forEach((v, i) => {
    const card = document.createElement('div');
    card.className = 'picker-voicing-card' + (i === pickerVoicingIdx ? ' selected' : '');
    card.innerHTML = `
      <div class="picker-voicing-label">${getVoicingLabel(v)}</div>
      ${renderDiagram(v, pickerScale())}
    `;
    card.addEventListener('click', () => {
      pickerVoicingIdx = i;
      renderPickerVoicings();
    });
    pickerVoicingsEl.appendChild(card);
  });
}

// ── Edit mode helpers ──────────────────────────────────────────────────────
function enterEditMode(i) {
  editingIdx = i;
  pickerNote = slots[i].note;
  pickerType = slots[i].chordType;
  pickerVoicingIdx = slots[i].voicingIdx;
  pickerNoteEl.value = pickerNote;
  pickerTypeEl.value = pickerType;
  updatePickerChrome();
  renderPickerVoicings();
  renderSlots();
  document.getElementById('chord-picker').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function exitEditMode() {
  editingIdx = null;
  updatePickerChrome();
}

function updatePickerChrome() {
  if (editingIdx !== null) {
    pickerHeading.textContent = `Edit Chord ${editingIdx + 1}`;
    btnCommit.textContent = 'Update Chord';
    btnCancelEdit.style.display = 'inline-block';
  } else {
    pickerHeading.textContent = 'Add a Chord';
    btnCommit.textContent = 'Add to Progression';
    btnCancelEdit.style.display = 'none';
  }
}

// ── Scale suggestions ──────────────────────────────────────────────────────
function getActiveProgScale() {
  const key  = keySelect.value;
  const type = scaleSelect.value;
  if (!key || !type) return null;
  return { key, type };
}

function renderScaleSuggestions() {
  const activeScale = getActiveProgScale();
  if (!activeScale) {
    scaleSuggestionsEl.style.display = 'none';
    return;
  }

  const { key, type } = activeScale;
  const diatonic = PROG_SCALE_DIATONIC[type] || [];
  const data = getActiveData();

  scaleSugLabelEl.textContent = `${key} ${PROG_SCALE_LABEL[type]} — click a chord to add it`;
  scaleSugGridEl.innerHTML = '';

  diatonic.forEach(({ interval, type: chordType, roman }) => {
    const note     = NOTES[(NOTES.indexOf(key) + interval) % 12];
    const voicings = (data[note] || {})[chordType] || [];
    if (!voicings.length) return;

    const card = document.createElement('div');
    card.className = 'scale-suggestion-card';
    card.innerHTML = `
      <div class="sugg-roman">${roman}</div>
      <div class="sugg-name">${chordLabel(note, chordType)}</div>
    `;
    card.addEventListener('click', () => {
      // Load this chord into the picker and scroll to it
      pickerNote = note;
      pickerType = chordType;
      pickerVoicingIdx = 0;
      pickerNoteEl.value = note;
      pickerTypeEl.value = chordType;
      exitEditMode();
      renderPickerVoicings();
      document.getElementById('chord-picker').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
    scaleSugGridEl.appendChild(card);
  });

  scaleSuggestionsEl.style.display = scaleSugGridEl.children.length ? 'block' : 'none';
}

// ── Events ─────────────────────────────────────────────────────────────────
pickerNoteEl.addEventListener('change', () => {
  pickerNote = pickerNoteEl.value;
  pickerVoicingIdx = 0;
  renderPickerVoicings();
});

pickerTypeEl.addEventListener('change', () => {
  pickerType = pickerTypeEl.value;
  pickerVoicingIdx = 0;
  renderPickerVoicings();
});

btnCommit.addEventListener('click', () => {
  const entry = { note: pickerNote, chordType: pickerType, voicingIdx: pickerVoicingIdx };
  if (editingIdx !== null) {
    slots[editingIdx] = entry;
    exitEditMode();
  } else {
    slots.push(entry);
  }
  renderAll();
});

btnCancelEdit.addEventListener('click', () => {
  exitEditMode();
  renderSlots();
});

// "+" button — scroll to picker and ensure add mode
btnAddSlot.addEventListener('click', () => {
  exitEditMode();
  renderSlots();
  document.getElementById('chord-picker').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

btnClear.addEventListener('click', () => {
  slots = [];
  exitEditMode();
  renderAll();
});

keySelect.addEventListener('change', () => { renderScaleSuggestions(); renderPresets(); });
scaleSelect.addEventListener('change', () => { renderScaleSuggestions(); renderPresets(); });

// Delegate clicks inside slots row
slotsEl.addEventListener('click', e => {
  const removeBtn = e.target.closest('[data-action="remove"]');
  const leftBtn   = e.target.closest('[data-action="left"]');
  const rightBtn  = e.target.closest('[data-action="right"]');
  const card      = e.target.closest('.prog-slot');

  if (removeBtn) {
    const i = +removeBtn.dataset.i;
    slots.splice(i, 1);
    if (editingIdx === i) exitEditMode();
    else if (editingIdx !== null && editingIdx > i) editingIdx--;
    renderAll();
    return;
  }
  if (leftBtn) {
    const i = +leftBtn.dataset.i;
    if (i > 0) {
      [slots[i - 1], slots[i]] = [slots[i], slots[i - 1]];
      if (editingIdx === i) editingIdx = i - 1;
      else if (editingIdx === i - 1) editingIdx = i;
      renderSlots();
    }
    return;
  }
  if (rightBtn) {
    const i = +rightBtn.dataset.i;
    if (i < slots.length - 1) {
      [slots[i + 1], slots[i]] = [slots[i], slots[i + 1]];
      if (editingIdx === i) editingIdx = i + 1;
      else if (editingIdx === i + 1) editingIdx = i;
      renderSlots();
    }
    return;
  }
  // Click on card body → enter edit mode
  if (card && card.dataset.i !== undefined) {
    const i = +card.dataset.i;
    if (editingIdx === i) {
      exitEditMode();
      renderSlots();
    } else {
      enterEditMode(i);
    }
  }
});

// ── Instrument toggle ──────────────────────────────────────────────────────
instrToggleEl.addEventListener('click', e => {
  const btn = e.target.closest('.instr-btn');
  if (!btn) return;
  const mode = btn.dataset.instr;
  if (mode === instrMode) return;
  instrMode = mode;
  instrToggleEl.querySelectorAll('.instr-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.instr === instrMode);
  });
  // Clear slots since voicing indices are instrument-specific
  slots = [];
  exitEditMode();
  renderAll();
  renderScaleSuggestions();
  renderPresets();
});

// ── Init ───────────────────────────────────────────────────────────────────
pickerNoteEl.value = 'C';
pickerTypeEl.value = 'major';
updatePickerChrome();
renderAll();
