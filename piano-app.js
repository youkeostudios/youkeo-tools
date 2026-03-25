// piano-app.js — Piano Chord Finder logic

// ── Piano SVG renderer ─────────────────────────────────────────────────────

const IS_BLACK = [false,true,false,true,false,false,true,false,true,false,true,false];

// White key index within one octave (C=0, D=1, E=2, F=3, G=4, A=5, B=6)
const WHITE_IDX = [0,-1,1,-1,2,3,-1,4,-1,5,-1,6];

// Black key x-offset as a fraction of white key width (from the preceding white key's left edge)
const BLACK_OFFSETS = { 1:0.65, 3:1.65, 6:3.65, 8:4.65, 10:5.65 };

function renderPianoSVG(voicing, scale) {
  scale = scale || 1;

  const KEY_W  = 26 * scale;   // white key width
  const KEY_H  = 80 * scale;   // white key height
  const BLK_W  = 16 * scale;   // black key width
  const BLK_H  = 52 * scale;   // black key height
  const PAD_X  = 10 * scale;
  const PAD_Y  = 8  * scale;
  const LABEL_SIZE = 9 * scale;

  const NUM_WHITE = 14; // 2 octaves
  const w = NUM_WHITE * KEY_W + 2 * PAD_X;
  const h = KEY_H + 2 * PAD_Y;

  const highlighted = new Set(voicing.notePositions);

  // Precompute x positions for all 24 semitones
  const xPos = {};
  let wi = 0;
  for (let s = 0; s < 24; s++) {
    const note = s % 12;
    if (!IS_BLACK[note]) {
      xPos[s] = PAD_X + wi * KEY_W;
      wi++;
    }
  }
  // Black key x = left edge of white key + offset fraction * KEY_W
  for (let oct = 0; oct < 2; oct++) {
    for (const [noteStr, off] of Object.entries(BLACK_OFFSETS)) {
      const note = +noteStr;
      const s    = oct * 12 + note;
      // "preceding white key" index in this octave
      const prevWhite = Math.floor(off);
      const octWhiteStart = oct * 7;
      xPos[s] = PAD_X + (octWhiteStart + off) * KEY_W;
    }
  }

  let svg = `<svg class="piano-svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">`;

  // Background
  svg += `<rect x="0" y="0" width="${w}" height="${h}" fill="transparent"/>`;

  // White keys
  for (let s = 0; s < 24; s++) {
    const note = s % 12;
    if (IS_BLACK[note]) continue;
    const x    = xPos[s];
    const isLit = highlighted.has(s);
    const fill  = isLit ? '#E8365D' : '#F0F0F0';
    const stroke = '#333';
    svg += `<rect x="${x + scale}" y="${PAD_Y}" width="${KEY_W - 2*scale}" height="${KEY_H}" rx="${2*scale}" fill="${fill}" stroke="${stroke}" stroke-width="${scale}"/>`;
    // Note label inside highlighted white keys
    if (isLit) {
      const label = PIANO_NOTES[note];
      svg += `<text x="${x + KEY_W/2}" y="${PAD_Y + KEY_H - 7*scale}" text-anchor="middle" font-family="Inter,sans-serif" font-size="${LABEL_SIZE}" font-weight="700" fill="#fff">${label}</text>`;
    }
  }

  // Black keys (drawn on top)
  for (let s = 0; s < 24; s++) {
    const note = s % 12;
    if (!IS_BLACK[note]) continue;
    const x    = xPos[s];
    const isLit = highlighted.has(s);
    const fill  = isLit ? '#E8365D' : '#111';
    svg += `<rect x="${x - BLK_W/2}" y="${PAD_Y}" width="${BLK_W}" height="${BLK_H}" rx="${2*scale}" fill="${fill}"/>`;
    if (isLit) {
      const label = PIANO_NOTES[note];
      svg += `<text x="${x}" y="${PAD_Y + BLK_H - 7*scale}" text-anchor="middle" font-family="Inter,sans-serif" font-size="${LABEL_SIZE - scale}" font-weight="700" fill="#fff">${label}</text>`;
    }
  }

  svg += '</svg>';
  return svg;
}

// ── Chord suggestions (same logic as guitar, reused here) ──────────────────
function pianoNoteAt(root, semitones) {
  return PIANO_NOTES[(PIANO_NOTES.indexOf(root) + semitones) % 12];
}

function getPianoSuggestions(root, chordType) {
  let suggestions = [];
  if (chordType === 'major' || chordType === 'major7' || chordType === 'major6' || chordType === 'sus2' || chordType === 'sus4') {
    suggestions = [
      { note: pianoNoteAt(root,2),  type:'minor',     role:'ii'  },
      { note: pianoNoteAt(root,4),  type:'minor',     role:'iii' },
      { note: pianoNoteAt(root,5),  type:'major',     role:'IV'  },
      { note: pianoNoteAt(root,7),  type:'major',     role:'V'   },
      { note: pianoNoteAt(root,7),  type:'dominant7', role:'V7'  },
      { note: pianoNoteAt(root,9),  type:'minor',     role:'vi'  },
    ];
  } else if (chordType === 'minor' || chordType === 'minor7' || chordType === 'minor6') {
    suggestions = [
      { note: pianoNoteAt(root,3),  type:'major',     role:'III' },
      { note: pianoNoteAt(root,5),  type:'minor',     role:'iv'  },
      { note: pianoNoteAt(root,7),  type:'minor',     role:'v'   },
      { note: pianoNoteAt(root,7),  type:'dominant7', role:'V7'  },
      { note: pianoNoteAt(root,8),  type:'major',     role:'VI'  },
      { note: pianoNoteAt(root,10), type:'major',     role:'VII' },
    ];
  } else if (chordType === 'dominant7') {
    const tonic = pianoNoteAt(root, 5);
    suggestions = [
      { note: tonic,                   type:'major',     role:'I (resolve)' },
      { note: tonic,                   type:'minor',     role:'i (resolve)' },
      { note: pianoNoteAt(tonic,5),   type:'major',     role:'IV'          },
      { note: pianoNoteAt(tonic,2),   type:'minor',     role:'ii'          },
    ];
  } else if (chordType === 'dim') {
    suggestions = [
      { note: pianoNoteAt(root,1),  type:'major',     role:'resolve →'   },
      { note: pianoNoteAt(root,1),  type:'minor',     role:'resolve →m'  },
      { note: pianoNoteAt(root,9),  type:'dominant7', role:'related V7'  },
    ];
  } else if (chordType === 'aug') {
    suggestions = [
      { note: pianoNoteAt(root,5),  type:'major',     role:'I'   },
      { note: pianoNoteAt(root,5),  type:'minor',     role:'i'   },
      { note: pianoNoteAt(root,8),  type:'major',     role:'bVI' },
    ];
  }
  return suggestions.filter(s => !(s.note === root && s.type === chordType));
}

// ── Scale definitions ──────────────────────────────────────────────────────
const PIANO_SCALE_INTERVALS = {
  major:     [0,2,4,5,7,9,11],
  minor:     [0,2,3,5,7,8,10],
  majorPent: [0,2,4,7,9],
  minorPent: [0,3,5,7,10],
  dorian:    [0,2,3,5,7,9,10],
  mixolydian:[0,2,4,5,7,9,10],
};

const PIANO_SCALE_DIATONIC = {
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

const PIANO_SCALE_TYPE_LABEL = {
  major:      'Major',
  minor:      'Minor (Natural)',
  majorPent:  'Major Pentatonic',
  minorPent:  'Minor Pentatonic',
  dorian:     'Dorian',
  mixolydian: 'Mixolydian',
};

// ── DOM refs ───────────────────────────────────────────────────────────────
const noteSelect       = document.getElementById('note-select');
const chordSelect      = document.getElementById('chord-select');
const chordDisplay     = document.getElementById('chord-display');
const keySelect        = document.getElementById('key-select');
const scaleTypeSelect  = document.getElementById('scale-type-select');
const scaleDisplay     = document.getElementById('scale-display');
const scaleHeader      = document.getElementById('scale-header');
const scaleGrid        = document.getElementById('scale-grid');

const modalOverlay   = document.getElementById('modal-overlay');
const modalTitle     = document.getElementById('modal-title');
const modalSub       = document.getElementById('modal-subtitle');
const modalDiagram   = document.getElementById('modal-diagram');
const modalNotes     = document.getElementById('modal-notes');
const modalSuggest   = document.getElementById('modal-suggestions');
const modalClose     = document.getElementById('modal-close');

// ── Populate dropdowns ─────────────────────────────────────────────────────
PIANO_NOTES.forEach(note => {
  const opt = document.createElement('option');
  opt.value = note; opt.textContent = note;
  noteSelect.appendChild(opt);
});

// "All" option first, then individual chord types
const pianoAllOpt = document.createElement('option');
pianoAllOpt.value = 'all'; pianoAllOpt.textContent = 'All';
chordSelect.appendChild(pianoAllOpt);

PIANO_CHORD_TYPES.forEach(ct => {
  const opt = document.createElement('option');
  opt.value = ct.value; opt.textContent = ct.label;
  chordSelect.appendChild(opt);
});

// Key dropdown: "None" + all 12 notes
const keyNone = document.createElement('option');
keyNone.value = ''; keyNone.textContent = 'None';
keySelect.appendChild(keyNone);
PIANO_NOTES.forEach(note => {
  const opt = document.createElement('option');
  opt.value = note; opt.textContent = note;
  keySelect.appendChild(opt);
});

// Scale type dropdown: "None" + all scale types
const scaleNone = document.createElement('option');
scaleNone.value = ''; scaleNone.textContent = 'None';
scaleTypeSelect.appendChild(scaleNone);
Object.entries(PIANO_SCALE_TYPE_LABEL).forEach(([val, label]) => {
  const opt = document.createElement('option');
  opt.value = val; opt.textContent = label;
  scaleTypeSelect.appendChild(opt);
});

// ── Render suggestions ─────────────────────────────────────────────────────
function renderSuggestions(note, chordType) {
  modalSuggest.innerHTML = '';
  const suggestions = getPianoSuggestions(note, chordType);
  suggestions.forEach(s => {
    const voicings = (PIANO_CHORD_DATA[s.note] || {})[s.type];
    if (!voicings || !voicings.length) return;
    const card = document.createElement('div');
    card.className = 'suggest-card';
    card.innerHTML = `
      <div class="suggest-role">${s.role}</div>
      <div class="suggest-name">${s.note} ${PIANO_CHORD_TYPE_SUFFIX[s.type]}</div>
      ${renderPianoSVG(voicings[0], 0.5)}
    `;
    card.addEventListener('click', () => openModal(voicings[0], s.note, s.type));
    modalSuggest.appendChild(card);
  });
  document.getElementById('modal-suggest-section').style.display =
    modalSuggest.children.length ? 'block' : 'none';
}

// ── Modal ──────────────────────────────────────────────────────────────────
function openModal(voicing, note, chordType) {
  modalTitle.textContent = voicing.name;
  modalSub.textContent   = voicing.inversionLabel;
  modalDiagram.innerHTML = renderPianoSVG(voicing, 1.3);

  // Note list
  modalNotes.innerHTML = voicing.noteNames
    .map(n => `<span class="piano-note-pill">${n}</span>`)
    .join('');

  renderSuggestions(note, chordType);
  modalOverlay.classList.add('open');
}

function closeModal() { modalOverlay.classList.remove('open'); }

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

// ── Build chord display cards ──────────────────────────────────────────────
function buildCard(voicing, note, chordType) {
  const card = document.createElement('div');
  card.className = 'chord-card';
  card.innerHTML = `
    <h2>${voicing.name}</h2>
    <div class="subtitle">${voicing.inversionLabel}</div>
    ${renderPianoSVG(voicing, 0.65)}
  `;
  card.addEventListener('click', () => openModal(voicing, note, chordType));
  return card;
}

// ── Scale helpers ──────────────────────────────────────────────────────────
function getActiveScale() {
  const key  = keySelect.value;
  const type = scaleTypeSelect.value;
  if (!key || !type) return null;
  return { key, type };
}

function renderScaleView() {
  const scale = getActiveScale();
  scaleGrid.innerHTML = '';
  scaleHeader.textContent = `${scale.key} ${PIANO_SCALE_TYPE_LABEL[scale.type]}`;

  const diatonic = PIANO_SCALE_DIATONIC[scale.type] || [];
  diatonic.forEach(({ interval, type, roman }) => {
    const note     = PIANO_NOTES[(PIANO_NOTES.indexOf(scale.key) + interval) % 12];
    const voicings = (PIANO_CHORD_DATA[note] || {})[type] || [];
    if (!voicings.length) return;
    const voicing  = voicings[0];

    const card = document.createElement('div');
    card.className = 'scale-chord-card';
    card.innerHTML = `
      <div class="scale-roman">${roman}</div>
      <div class="scale-chord-name">${voicing.name}</div>
      ${renderPianoSVG(voicing, 0.65)}
    `;
    card.addEventListener('click', () => openModal(voicing, note, type));
    scaleGrid.appendChild(card);
  });
}

// ── Update display ─────────────────────────────────────────────────────────
function updateDisplay() {
  const activeScale = getActiveScale();

  if (activeScale) {
    // Scale mode: hide chord filters, show scale view
    noteSelect.disabled  = true;
    chordSelect.disabled = true;
    chordDisplay.style.display  = 'none';
    scaleDisplay.style.display  = 'block';
    renderScaleView();
  } else {
    // Chord finder mode
    noteSelect.disabled  = false;
    chordSelect.disabled = false;
    chordDisplay.style.display  = '';
    scaleDisplay.style.display  = 'none';

    const note      = noteSelect.value;
    const chordType = chordSelect.value;
    chordDisplay.innerHTML = '';

    if (chordType === 'all') {
      // Show root-position voicing of every chord type for the selected note
      let found = false;
      PIANO_CHORD_TYPES.forEach(ct => {
        const voicings = (PIANO_CHORD_DATA[note] || {})[ct.value] || [];
        if (!voicings.length) return;
        found = true;
        chordDisplay.appendChild(buildCard(voicings[0], note, ct.value));
      });
      if (!found) chordDisplay.innerHTML = '<p class="no-chord">No voicings found.</p>';
      return;
    }

    const voicings = (PIANO_CHORD_DATA[note] || {})[chordType] || [];
    if (!voicings.length) {
      chordDisplay.innerHTML = '<p class="no-chord">No voicings found.</p>';
      return;
    }
    voicings.forEach(v => chordDisplay.appendChild(buildCard(v, note, chordType)));
  }
}

// ── Wire events ────────────────────────────────────────────────────────────
noteSelect.addEventListener('change', updateDisplay);
chordSelect.addEventListener('change', updateDisplay);
keySelect.addEventListener('change', updateDisplay);
scaleTypeSelect.addEventListener('change', updateDisplay);

// ── Init ───────────────────────────────────────────────────────────────────
noteSelect.value  = 'C';
chordSelect.value = 'major';
scaleDisplay.style.display = 'none';
updateDisplay();
