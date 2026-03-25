// ── Scale definitions ─────────────────────────────────────────────────────
const SCALE_INTERVALS = {
  major:      [0, 2, 4, 5, 7, 9, 11],
  minor:      [0, 2, 3, 5, 7, 8, 10],
  majorPent:  [0, 2, 4, 7, 9],
  minorPent:  [0, 3, 5, 7, 10],
  dorian:     [0, 2, 3, 5, 7, 9, 10],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
};

// Diatonic chords for each scale type (diminished chords omitted)
const SCALE_DIATONIC = {
  major: [
    { interval: 0,  type: 'major', roman: 'I'    },
    { interval: 2,  type: 'minor', roman: 'ii'   },
    { interval: 4,  type: 'minor', roman: 'iii'  },
    { interval: 5,  type: 'major', roman: 'IV'   },
    { interval: 7,  type: 'major', roman: 'V'    },
    { interval: 9,  type: 'minor', roman: 'vi'   },
    { interval: 11, type: 'dim',   roman: 'vii°' },
  ],
  minor: [
    { interval: 0,  type: 'minor', roman: 'i'    },
    { interval: 2,  type: 'dim',   roman: 'ii°'  },
    { interval: 3,  type: 'major', roman: 'III'  },
    { interval: 5,  type: 'minor', roman: 'iv'   },
    { interval: 7,  type: 'minor', roman: 'v'    },
    { interval: 8,  type: 'major', roman: 'VI'   },
    { interval: 10, type: 'major', roman: 'VII'  },
  ],
  majorPent: [
    { interval: 0,  type: 'major', roman: 'I'   },
    { interval: 2,  type: 'minor', roman: 'ii'  },
    { interval: 4,  type: 'minor', roman: 'iii' },
    { interval: 7,  type: 'major', roman: 'V'   },
    { interval: 9,  type: 'minor', roman: 'vi'  },
  ],
  minorPent: [
    { interval: 0,  type: 'minor', roman: 'i'   },
    { interval: 3,  type: 'major', roman: 'III' },
    { interval: 5,  type: 'minor', roman: 'iv'  },
    { interval: 7,  type: 'minor', roman: 'v'   },
    { interval: 10, type: 'major', roman: 'VII' },
  ],
  dorian: [
    { interval: 0,  type: 'minor', roman: 'i'   },
    { interval: 2,  type: 'minor', roman: 'ii'  },
    { interval: 3,  type: 'major', roman: 'III' },
    { interval: 5,  type: 'major', roman: 'IV'  },
    { interval: 7,  type: 'minor', roman: 'v'   },
    { interval: 9,  type: 'major', roman: 'VI'  },
    { interval: 10, type: 'minor', roman: 'vii' },
  ],
  mixolydian: [
    { interval: 0,  type: 'major', roman: 'I'   },
    { interval: 2,  type: 'minor', roman: 'ii'  },
    { interval: 5,  type: 'major', roman: 'IV'  },
    { interval: 7,  type: 'minor', roman: 'v'   },
    { interval: 9,  type: 'major', roman: 'VI'  },
    { interval: 10, type: 'major', roman: 'VII' },
  ],
};

const SCALE_TYPE_LABEL = {
  major: 'Major', minor: 'Minor',
  majorPent: 'Major Pentatonic', minorPent: 'Minor Pentatonic',
  dorian: 'Dorian', mixolydian: 'Mixolydian',
};

const CHORD_TYPE_LABEL = {
  major: 'Major', minor: 'Minor', dominant7: '7',
  major7: 'maj7', minor7: 'm7', sus2: 'sus2', sus4: 'sus4',
  dim: 'dim', aug: 'aug', major6: '6', minor6: 'm6',
};

const ALL_ROOTS = ["C","C#/Db","D","D#/Eb","E","F","F#/Gb","G","G#/Ab","A","A#/Bb","B"];

function buildScaleOptions() {
  const options = [{ value: '', label: 'None', notes: null, scaleType: null, root: null }];
  ['major','minor','majorPent','minorPent','dorian','mixolydian'].forEach(type => {
    ALL_ROOTS.forEach(root => {
      const rootIdx = ALL_ROOTS.indexOf(root);
      const notes = SCALE_INTERVALS[type].map(i => ALL_ROOTS[(rootIdx + i) % 12]);
      options.push({ value: `${root}|${type}`, label: `${root} ${SCALE_TYPE_LABEL[type]}`, notes, scaleType: type, root });
    });
  });
  return options;
}

const SCALE_OPTIONS = buildScaleOptions();

// ── DOM refs ──────────────────────────────────────────────────────────────
const noteSelect      = document.getElementById('note-select');
const chordSelect     = document.getElementById('chord-select');
const positionSelect  = document.getElementById('position-select');
const keySelect       = document.getElementById('key-select');
const scaleTypeSelect = document.getElementById('scale-type-select');
const chordDisplay    = document.getElementById('chord-display');
const scaleDisplay    = document.getElementById('scale-display');
const scaleHeader     = document.getElementById('scale-header');
const scaleGrid       = document.getElementById('scale-grid');

// ── Populate key + scale type dropdowns ───────────────────────────────────
// Key: None + all 12 notes
[{ value: '', label: 'None' }, ...ALL_ROOTS.map(r => ({ value: r, label: r }))].forEach(o => {
  const opt = document.createElement('option');
  opt.value = o.value;
  opt.textContent = o.label;
  keySelect.appendChild(opt);
});

// Scale type
[
  { value: '',           label: 'None'              },
  { value: 'major',      label: 'Major'             },
  { value: 'minor',      label: 'Minor'             },
  { value: 'majorPent',  label: 'Major Pentatonic'  },
  { value: 'minorPent',  label: 'Minor Pentatonic'  },
  { value: 'dorian',     label: 'Dorian'            },
  { value: 'mixolydian', label: 'Mixolydian'        },
].forEach(o => {
  const opt = document.createElement('option');
  opt.value = o.value;
  opt.textContent = o.label;
  scaleTypeSelect.appendChild(opt);
});

NOTES.forEach(note => {
  const opt = document.createElement('option');
  opt.value = note;
  opt.textContent = note;
  noteSelect.appendChild(opt);
});

// "All" option first, then individual chord types
const allOpt = document.createElement('option');
allOpt.value = 'all'; allOpt.textContent = 'All';
chordSelect.appendChild(allOpt);

CHORD_TYPES.forEach(ct => {
  const opt = document.createElement('option');
  opt.value = ct.value;
  opt.textContent = ct.label;
  chordSelect.appendChild(opt);
});

// ── SVG chord diagram renderer ────────────────────────────────────────────
const SVG_COLORS = {
  nut:       '#F5F5F5',
  grid:      '#555555',
  gridLine:  '#444444',
  barre:     '#F5F5F5',
  dot:       '#F5F5F5',
  mute:      '#888888',
  openCircle:'#F5F5F5',
  fretNum:   '#AAAAAA',
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

  svg += `</svg>`;
  return svg;
}

// ── Chord suggestions (music theory) ─────────────────────────────────────
const CHROMATIC = ["C","C#/Db","D","D#/Eb","E","F","F#/Gb","G","G#/Ab","A","A#/Bb","B"];

function noteAt(root, semitones) {
  return CHROMATIC[(CHROMATIC.indexOf(root) + semitones) % 12];
}

function getSuggestedChords(root, chordType) {
  let suggestions = [];
  if (chordType === 'major' || chordType === 'major7' || chordType === 'sus2' || chordType === 'sus4') {
    suggestions = [
      { note: noteAt(root, 2),  chordType: 'minor',     role: 'ii'   },
      { note: noteAt(root, 4),  chordType: 'minor',     role: 'iii'  },
      { note: noteAt(root, 5),  chordType: 'major',     role: 'IV'   },
      { note: noteAt(root, 7),  chordType: 'major',     role: 'V'    },
      { note: noteAt(root, 7),  chordType: 'dominant7', role: 'V7'   },
      { note: noteAt(root, 9),  chordType: 'minor',     role: 'vi'   },
    ];
  } else if (chordType === 'major6') {
    suggestions = [
      { note: noteAt(root, 2),  chordType: 'minor',     role: 'ii'   },
      { note: noteAt(root, 5),  chordType: 'major',     role: 'IV'   },
      { note: noteAt(root, 7),  chordType: 'dominant7', role: 'V7'   },
      { note: noteAt(root, 9),  chordType: 'minor',     role: 'vi'   },
      { note: root,              chordType: 'major',     role: 'I'    },
    ];
  } else if (chordType === 'minor' || chordType === 'minor7') {
    suggestions = [
      { note: noteAt(root, 3),  chordType: 'major',     role: 'III'  },
      { note: noteAt(root, 5),  chordType: 'minor',     role: 'iv'   },
      { note: noteAt(root, 7),  chordType: 'minor',     role: 'v'    },
      { note: noteAt(root, 7),  chordType: 'dominant7', role: 'V7'   },
      { note: noteAt(root, 8),  chordType: 'major',     role: 'VI'   },
      { note: noteAt(root, 10), chordType: 'major',     role: 'VII'  },
    ];
  } else if (chordType === 'minor6') {
    suggestions = [
      { note: noteAt(root, 3),  chordType: 'major',     role: 'III'  },
      { note: noteAt(root, 5),  chordType: 'minor',     role: 'iv'   },
      { note: noteAt(root, 7),  chordType: 'dominant7', role: 'V7'   },
      { note: noteAt(root, 8),  chordType: 'major',     role: 'VI'   },
      { note: root,              chordType: 'minor',     role: 'i'    },
    ];
  } else if (chordType === 'dominant7') {
    const tonic = noteAt(root, 5);
    suggestions = [
      { note: tonic,             chordType: 'major',     role: 'I (resolve)' },
      { note: tonic,             chordType: 'minor',     role: 'i (resolve)' },
      { note: noteAt(tonic, 5), chordType: 'major',     role: 'IV'          },
      { note: noteAt(tonic, 2), chordType: 'minor',     role: 'ii'          },
      { note: noteAt(tonic, 9), chordType: 'minor',     role: 'vi'          },
    ];
  } else if (chordType === 'dim') {
    // Diminished resolves up a half step to major or minor
    suggestions = [
      { note: noteAt(root, 1),  chordType: 'major',     role: 'resolve →' },
      { note: noteAt(root, 1),  chordType: 'minor',     role: 'resolve →m' },
      { note: noteAt(root, 9),  chordType: 'dominant7', role: 'related V7' },
      { note: noteAt(root, 3),  chordType: 'minor',     role: 'enharmonic i' },
    ];
  } else if (chordType === 'aug') {
    // Augmented is typically V+ leading to I
    suggestions = [
      { note: noteAt(root, 5),  chordType: 'major',     role: 'I'    },
      { note: noteAt(root, 5),  chordType: 'minor',     role: 'i'    },
      { note: noteAt(root, 8),  chordType: 'major',     role: 'bVI'  },
      { note: noteAt(root, 3),  chordType: 'major',     role: 'III'  },
    ];
  }
  return suggestions.filter(s => !(s.note === root && s.chordType === chordType));
}

// ── Modal ─────────────────────────────────────────────────────────────────
const modalOverlay   = document.getElementById('modal-overlay');
const modalTitle     = document.getElementById('modal-title');
const modalSub       = document.getElementById('modal-subtitle');
const modalDiagram   = document.getElementById('modal-diagram');
const modalVariations = document.getElementById('modal-variations');
const variationsGrid = document.getElementById('variations-grid');
const modalSuggest   = document.getElementById('modal-suggestions');
const modalClose     = document.getElementById('modal-close');

function renderSuggestions(note, chordType) {
  modalSuggest.innerHTML = '';
  const suggestions = getSuggestedChords(note, chordType);
  suggestions.forEach(s => {
    const voicings = (CHORD_DATA[s.note] || {})[s.chordType];
    if (!voicings || !voicings.length) return;
    const card = document.createElement('div');
    card.className = 'suggest-card';
    card.innerHTML = `
      <div class="suggest-role">${s.role}</div>
      <div class="suggest-name">${s.note} ${CHORD_TYPE_LABEL[s.chordType]}</div>
      ${renderChordSVG(voicings[0], 0.85)}
    `;
    card.addEventListener('click', () => openModalVariations(s.note, s.chordType));
    modalSuggest.appendChild(card);
  });
  document.getElementById('modal-suggest-section').style.display =
    modalSuggest.children.length ? 'block' : 'none';
}

// Open modal with a single large voicing (from chord finder grid)
function openModal(chord, note, chordType) {
  modalTitle.textContent = chord.name;
  modalSub.textContent   = chord.type === 'open' ? 'Open' : 'Barre';

  modalDiagram.style.display    = 'block';
  modalVariations.style.display = 'none';
  modalDiagram.innerHTML        = renderChordSVG(chord, 2.4);

  renderSuggestions(note, chordType);
  modalOverlay.classList.add('open');
}

// Open modal with ALL voicings (from scale view)
function openModalVariations(note, chordType) {
  const voicings = (CHORD_DATA[note] || {})[chordType] || [];

  modalTitle.textContent = `${note} ${CHORD_TYPE_LABEL[chordType]}`;
  modalSub.textContent   = `${voicings.length} voicing${voicings.length !== 1 ? 's' : ''}`;

  modalDiagram.style.display    = 'none';
  modalVariations.style.display = 'block';

  variationsGrid.innerHTML = '';
  voicings.forEach(v => {
    const card = document.createElement('div');
    card.className = 'variation-card';
    card.innerHTML = `
      <div class="variation-label">${v.type === 'open' ? 'Open' : 'Barre'}</div>
      ${renderChordSVG(v, 1.5)}
    `;
    card.addEventListener('click', () => openModal(v, note, chordType));
    variationsGrid.appendChild(card);
  });

  renderSuggestions(note, chordType);
  modalOverlay.classList.add('open');
}

function closeModal() { modalOverlay.classList.remove('open'); }

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

// ── Build chord card (chord finder grid) ──────────────────────────────────
function buildCard(chord, note, chordType) {
  const card = document.createElement('div');
  card.className = 'chord-card';
  card.innerHTML = `
    <h2>${chord.name}</h2>
    <div class="subtitle">${chord.type === 'open' ? 'Open' : 'Barre'}</div>
    ${renderChordSVG(chord)}
  `;
  card.addEventListener('click', () => openModal(chord, note, chordType));
  return card;
}

// ── Scale view ────────────────────────────────────────────────────────────
function getActiveScale() {
  const root      = keySelect.value;
  const scaleType = scaleTypeSelect.value;
  if (!root || !scaleType) return null;
  return SCALE_OPTIONS.find(s => s.root === root && s.scaleType === scaleType) || null;
}

function renderScaleView() {
  const scale = getActiveScale();
  if (!scale || !scale.scaleType) return;

  const diatonic = SCALE_DIATONIC[scale.scaleType];
  const rootIdx  = ALL_ROOTS.indexOf(scale.root);

  scaleHeader.textContent = `${scale.label} — Diatonic Chords`;
  scaleGrid.innerHTML = '';

  diatonic.forEach(degree => {
    const note      = ALL_ROOTS[(rootIdx + degree.interval) % 12];
    const chordType = degree.type;
    const voicings  = (CHORD_DATA[note] || {})[chordType] || [];
    if (!voicings.length) return;

    const card = document.createElement('div');
    card.className = 'scale-chord-card';
    card.innerHTML = `
      <div class="scale-chord-roman">${degree.roman}</div>
      <div class="scale-chord-name">${note} ${CHORD_TYPE_LABEL[chordType]}</div>
      ${renderChordSVG(voicings[0], 0.9)}
    `;
    card.addEventListener('click', () => openModalVariations(note, chordType));
    scaleGrid.appendChild(card);
  });
}

// ── Update chord finder display ───────────────────────────────────────────
function updateDisplay() {
  const scale = getActiveScale();

  if (scale && scale.scaleType) {
    // Scale mode: disable chord finder filters, show scale display
    chordDisplay.style.display = 'none';
    scaleDisplay.style.display = 'block';
    noteSelect.disabled     = true;
    chordSelect.disabled    = true;
    positionSelect.disabled = true;
    renderScaleView();
    return;
  }

  // Normal mode
  chordDisplay.style.display = '';
  scaleDisplay.style.display = 'none';
  noteSelect.disabled     = false;
  chordSelect.disabled    = false;
  positionSelect.disabled = false;

  const note      = noteSelect.value;
  const chordType = chordSelect.value;
  const position  = positionSelect.value;

  chordDisplay.innerHTML = '';

  if (chordType === 'all') {
    // Show first voicing of every chord type for the selected note
    let found = false;
    CHORD_TYPES.forEach(ct => {
      const chords = ((CHORD_DATA[note] || {})[ct.value] || []);
      const filtered = position === 'all' ? chords : chords.filter(c => c.type === position);
      if (!filtered.length) return;
      found = true;
      chordDisplay.appendChild(buildCard(filtered[0], note, ct.value));
    });
    if (!found) chordDisplay.innerHTML = '<p class="no-chord">No chord shapes found.</p>';
    return;
  }

  const chords = ((CHORD_DATA[note] || {})[chordType] || []);
  if (!chords.length) {
    chordDisplay.innerHTML = '<p class="no-chord">No chord shapes found.</p>';
    return;
  }

  const filtered = position === 'all' ? chords : chords.filter(c => c.type === position);
  if (!filtered.length) {
    chordDisplay.innerHTML = `<p class="no-chord">No ${position} shapes for this chord.</p>`;
    return;
  }

  filtered.forEach(chord => chordDisplay.appendChild(buildCard(chord, note, chordType)));
}

// ── Wire up events ────────────────────────────────────────────────────────
keySelect.addEventListener('change', updateDisplay);
scaleTypeSelect.addEventListener('change', updateDisplay);
noteSelect.addEventListener('change', updateDisplay);
chordSelect.addEventListener('change', updateDisplay);
positionSelect.addEventListener('change', updateDisplay);

// Default
noteSelect.value  = 'C';
chordSelect.value = 'major';
updateDisplay();
