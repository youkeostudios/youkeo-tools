// chords.js — Programmatically generated guitar chord voicings
// Uses CAGED-system shapes shifted to each of the 12 notes.
//
// Fret array convention: 6 strings, index 0 = low E, index 5 = high e
//   -1 = muted, 0 = open, 1-15 = fret number

// ─── Tuning & note helpers ────────────────────────────────────────────────────

// Semitones from low E for each open string: E A D G B e
const STRING_TUNING = [0, 5, 10, 15, 19, 24];

// Semitones above low E (fret 0) for each note name
const NOTE_SEMITONES = {
  "E":     0,
  "F":     1,
  "F#/Gb": 2,
  "G":     3,
  "G#/Ab": 4,
  "A":     5,
  "A#/Bb": 6,
  "B":     7,
  "C":     8,
  "C#/Db": 9,
  "D":     10,
  "D#/Eb": 11,
};

// All 12 notes in chromatic order
const NOTE_NAMES = [
  "C", "C#/Db", "D", "D#/Eb", "E",
  "F", "F#/Gb", "G", "G#/Ab", "A", "A#/Bb", "B"
];

// ─── Shape templates ──────────────────────────────────────────────────────────
// Each shape is defined as fret *offsets* from the root fret (which is placed
// on the rootString).  -1 stays -1 (muted).  0 means "play root fret + 0"
// (i.e. the barred/root fret itself).
//
// rootString: 0-indexed string where the root note sits (0=low E, 1=A, …)
// barreStrings: null | [fromString1idx, toString1idx]  (0-based, inclusive)
//
// fingers are assigned automatically after the shape is placed.

const SHAPE_TEMPLATES = {
  // Only E-shape, A-shape, and D-shape are used here.
  // C-shape and G-shape involve notes *below* the root fret (open strings that
  // can't be captured by a simple positive offset), so they produce wrong notes
  // when transposed to other keys.  With octave shifts 0 and 1, three templates
  // already give up to 6 distinct voicings per key.

  major: [
    // E-shape — root on low E (string 0)
    { name: "E-shape",  rootString: 0, offsets: [0, 2, 2, 1, 0, 0], barreStrings: [0, 5] },
    // A-shape — root on A string (string 1)
    { name: "A-shape",  rootString: 1, offsets: [-1, 0, 2, 2, 2, 0], barreStrings: [1, 5] },
    // D-shape — root on D string (string 2)
    { name: "D-shape",  rootString: 2, offsets: [-1, -1, 0, 2, 3, 2], barreStrings: null },
  ],

  minor: [
    // Em-shape — root on string 0
    { name: "Em-shape", rootString: 0, offsets: [0, 2, 2, 0, 0, 0], barreStrings: [0, 5] },
    // Am-shape — root on string 1
    { name: "Am-shape", rootString: 1, offsets: [-1, 0, 2, 2, 1, 0], barreStrings: [1, 5] },
    // Dm-shape — root on string 2
    { name: "Dm-shape", rootString: 2, offsets: [-1, -1, 0, 2, 3, 1], barreStrings: null },
  ],

  dominant7: [
    // E7-shape — root on string 0
    { name: "E7-shape", rootString: 0, offsets: [0, 2, 0, 1, 0, 0], barreStrings: [0, 5] },
    // A7-shape — root on string 1
    { name: "A7-shape", rootString: 1, offsets: [-1, 0, 2, 0, 2, 0], barreStrings: [1, 5] },
    // D7-shape — root on string 2
    { name: "D7-shape", rootString: 2, offsets: [-1, -1, 0, 2, 1, 2], barreStrings: null },
  ],

  major7: [
    // Emaj7-shape — root on string 0
    { name: "Emaj7-shape",  rootString: 0, offsets: [0, 2, 1, 1, 0, 0], barreStrings: [0, 5] },
    // Amaj7-shape — root on string 1
    { name: "Amaj7-shape",  rootString: 1, offsets: [-1, 0, 2, 1, 2, 0], barreStrings: [1, 5] },
    // Dmaj7-shape — root on string 2
    { name: "Dmaj7-shape",  rootString: 2, offsets: [-1, -1, 0, 2, 2, 2], barreStrings: null },
  ],

  minor7: [
    // Em7-shape — root on string 0
    { name: "Em7-shape", rootString: 0, offsets: [0, 2, 0, 0, 0, 0], barreStrings: [0, 5] },
    // Am7-shape — root on string 1
    { name: "Am7-shape", rootString: 1, offsets: [-1, 0, 2, 0, 1, 0], barreStrings: [1, 5] },
    // Dm7-shape — root on string 2
    { name: "Dm7-shape", rootString: 2, offsets: [-1, -1, 0, 2, 1, 1], barreStrings: null },
  ],

  sus2: [
    // Esus2-shape — root on string 0; offsets [0,2,4,4,0,0] keeps the maj2 (sus2 note)
    { name: "Esus2-shape", rootString: 0, offsets: [0, 2, 4, 4, 0, 0], barreStrings: [0, 5] },
    // Asus2-shape — root on string 1
    { name: "Asus2-shape", rootString: 1, offsets: [-1, 0, 2, 2, 0, 0], barreStrings: [1, 4] },
    // Dsus2-shape — root on string 2
    { name: "Dsus2-shape", rootString: 2, offsets: [-1, -1, 0, 2, 3, 0], barreStrings: null },
  ],

  sus4: [
    // Esus4-shape — root on string 0
    { name: "Esus4-shape", rootString: 0, offsets: [0, 2, 2, 2, 0, 0], barreStrings: [0, 5] },
    // Asus4-shape — root on string 1
    { name: "Asus4-shape", rootString: 1, offsets: [-1, 0, 2, 2, 3, 0], barreStrings: [1, 5] },
    // Dsus4-shape — root on string 2
    { name: "Dsus4-shape", rootString: 2, offsets: [-1, -1, 0, 2, 3, 3], barreStrings: null },
  ],

  // ── Diminished triad (root, m3, dim5) ─────────────────────────────────────
  // Strings verified: E-shape [root, dim5, root+oct, m3+oct, mute, mute]
  //                   A-shape [mute, root, dim5, root+oct, m3+oct, mute]
  //                   D-shape [mute, mute, root, dim5, root+oct, m3+oct]
  dim: [
    { name: "Edim-shape", rootString: 0, offsets: [0, 1, 2, 0, -1, -1], barreStrings: null },
    { name: "Adim-shape", rootString: 1, offsets: [-1, 0, 1, 2, 1, -1], barreStrings: null },
    { name: "Ddim-shape", rootString: 2, offsets: [-1, -1, 0, 1, 3, 1], barreStrings: null },
  ],

  // ── Augmented triad (root, M3, aug5) ──────────────────────────────────────
  // Strings verified: E-shape [root, aug5, root+oct, M3+oct, aug5+oct, root+2oct]
  //                   A-shape [mute, root, aug5, root+oct, M3+oct, aug5+oct]
  //                   D-shape [mute, mute, root, aug5, root+oct, M3+oct]
  aug: [
    { name: "Eaug-shape", rootString: 0, offsets: [0, 3, 2, 1, 1, 0], barreStrings: null },
    { name: "Aaug-shape", rootString: 1, offsets: [-1, 0, 3, 2, 2, 1], barreStrings: null },
    { name: "Daug-shape", rootString: 2, offsets: [-1, -1, 0, 3, 3, 2], barreStrings: null },
  ],

  // ── Major 6th (root, M3, P5, M6) ──────────────────────────────────────────
  // E-shape: [root, P5, root+oct, M3+oct, M6+oct, root+2oct]
  // A-shape: [mute, root, P5, root+oct, M3+oct, M6+oct]
  // D-shape: [mute, mute, root, P5, M6, M3+oct]
  major6: [
    { name: "E6-shape",  rootString: 0, offsets: [0, 2, 2, 1, 2, 0], barreStrings: [0, 5] },
    { name: "A6-shape",  rootString: 1, offsets: [-1, 0, 2, 2, 2, 2], barreStrings: [1, 5] },
    { name: "D6-shape",  rootString: 2, offsets: [-1, -1, 0, 2, 0, 2], barreStrings: null },
  ],

  // ── Minor 6th (root, m3, P5, M6) ──────────────────────────────────────────
  // E-shape: [root, P5, root+oct, m3+oct, M6+oct, root+2oct]
  // A-shape: [mute, root, P5, root+oct, m3+oct, M6+oct]
  // D-shape: [mute, mute, root, P5, M6, m3+oct]
  minor6: [
    { name: "Em6-shape", rootString: 0, offsets: [0, 2, 2, 0, 2, 0], barreStrings: [0, 5] },
    { name: "Am6-shape", rootString: 1, offsets: [-1, 0, 2, 2, 1, 2], barreStrings: [1, 5] },
    { name: "Dm6-shape", rootString: 2, offsets: [-1, -1, 0, 2, 0, 1], barreStrings: null },
  ],
};

// ─── Chord-type display names ─────────────────────────────────────────────────

const CHORD_TYPE_SUFFIX = {
  major:     "Major",
  minor:     "Minor",
  dominant7: "7",
  major7:    "maj7",
  minor7:    "m7",
  sus2:      "sus2",
  sus4:      "sus4",
  dim:       "dim",
  aug:       "aug",
  major6:    "6",
  minor6:    "m6",
};

// ─── Core voicing builder ─────────────────────────────────────────────────────

/**
 * Given a shape template and a target note, compute the actual fret array,
 * barre object, startFret, type, and name for one chord voicing.
 *
 * octaveShift: 0 = primary octave, 1 = add 12 to rootFret.
 *
 * Returns null when the resulting frets would be out of range or nonsensical.
 */
function buildVoicing(noteName, chordTypeName, template, octaveShift) {
  octaveShift = octaveShift || 0;

  const rootSemitone = NOTE_SEMITONES[noteName];    // semitones above open low E
  const stringSemitone = STRING_TUNING[template.rootString]; // tuning of root string

  // How many frets up from the root string's open pitch do we need?
  let rootFret = (rootSemitone - stringSemitone + 12) % 12;
  // rootFret is now 0-11; add octave if requested
  rootFret += octaveShift * 12;

  // Resolve each string
  const frets = template.offsets.map(function(offset) {
    if (offset === -1) return -1;
    const absoluteFret = rootFret + offset;
    return absoluteFret;
  });

  // Sanity: reject voicings with any fret out of 0-15
  for (let i = 0; i < frets.length; i++) {
    if (frets[i] > 15) return null;
    // Negative frets (after adding rootFret) shouldn't happen with well-designed
    // offsets, but guard anyway.
    if (frets[i] < -1) return null;
  }

  // Barre
  let barre = null;
  if (template.barreStrings && rootFret > 0) {
    // Convert 0-based indices to 1-based (app.js convention: low E = 1)
    barre = {
      fret: rootFret,
      fromString: template.barreStrings[0] + 1,
      toString:   template.barreStrings[1] + 1,
    };
  }

  // Determine startFret (lowest non-zero, non-muted fret played, at least 1)
  const playedFrets = frets.filter(function(f) { return f > 0; });
  const minFret = playedFrets.length > 0 ? Math.min.apply(null, playedFrets) : 1;
  const startFret = Math.max(1, minFret);

  // type: "open" if any string is 0; otherwise "barre"
  const hasOpen = frets.some(function(f) { return f === 0; });
  const type = hasOpen ? "open" : "barre";

  // Build a human-readable name
  const suffix = CHORD_TYPE_SUFFIX[chordTypeName];
  let posLabel;
  if (rootFret === 0) {
    posLabel = "Open";
  } else {
    posLabel = ordinal(rootFret) + " fret";
    if (barre) posLabel = "Barre " + ordinal(rootFret);
  }
  const name = noteName + " " + suffix + " (" + posLabel + ")";

  // Auto-assign finger numbers (simple heuristic)
  const fingers = assignFingers(frets, barre);

  return {
    name: name,
    type: type,
    frets: frets,
    fingers: fingers,
    barre: barre || undefined,
    startFret: startFret,
  };
}

// ─── Finger assignment heuristic ─────────────────────────────────────────────

/**
 * Assigns plausible finger numbers to fretted notes.
 * Fingers 1-4 (index to pinky); 0 = open or muted.
 * Barre finger is always finger 1 on the barre fret.
 */
function assignFingers(frets, barre) {
  // Collect (stringIndex, fretValue) for non-open, non-muted strings
  var fretted = [];
  for (var i = 0; i < frets.length; i++) {
    if (frets[i] > 0) {
      fretted.push({ s: i, f: frets[i] });
    }
  }

  // Sort by fret then by string
  fretted.sort(function(a, b) {
    return a.f !== b.f ? a.f - b.f : a.s - b.s;
  });

  // Map each unique fret to a finger number
  var fretToFinger = {};
  var nextFinger = 1;

  // If there's a barre, finger 1 is reserved for the barre fret
  if (barre) {
    fretToFinger[barre.fret] = 1;
    nextFinger = 2;
  }

  fretted.forEach(function(item) {
    if (fretToFinger[item.f] === undefined) {
      // If barre took finger 1, skip 1 for other frets
      if (nextFinger > 4) nextFinger = 4; // clamp
      fretToFinger[item.f] = nextFinger;
      nextFinger++;
    }
  });

  return frets.map(function(f) {
    if (f <= 0) return 0;
    return fretToFinger[f] || 0;
  });
}

// ─── Ordinal helper ───────────────────────────────────────────────────────────

function ordinal(n) {
  if (n === 1) return "1st";
  if (n === 2) return "2nd";
  if (n === 3) return "3rd";
  return n + "th";
}

// ─── Deduplication helper ─────────────────────────────────────────────────────

function fretKey(voicing) {
  return voicing.frets.join(",");
}

// ─── Main generation ──────────────────────────────────────────────────────────

/**
 * For a given note + chord type, generate up to 6 voicings sorted
 * open/low-fret first.
 */
function generateVoicings(noteName, chordTypeName) {
  var templates = SHAPE_TEMPLATES[chordTypeName];
  var seen = {};
  var voicings = [];

  // Try octave shifts 0, 1, 2 for each template to cover low, mid, and high positions
  var shifts = [0, 1, 2];

  templates.forEach(function(template) {
    shifts.forEach(function(shift) {
      var v = buildVoicing(noteName, chordTypeName, template, shift);
      if (!v) return;
      var key = fretKey(v);
      if (seen[key]) return;
      seen[key] = true;
      voicings.push(v);
    });
  });

  // Sort: open voicings first, then by startFret ascending
  voicings.sort(function(a, b) {
    var aOpen = a.type === "open" ? 0 : 1;
    var bOpen = b.type === "open" ? 0 : 1;
    if (aOpen !== bOpen) return aOpen - bOpen;
    return a.startFret - b.startFret;
  });

  // Cap at 6 voicings
  return voicings.slice(0, 6);
}

// ─── Override table for well-known open voicings ──────────────────────────────
// The algorithmic approach sometimes produces voicings that differ from
// standard guitar pedagogy for the most common open chords.  We patch those
// here so the displayed fingering matches what every guitarist expects.
// Format is identical to the standard voicing object.

var KNOWN_OVERRIDES = {
  "C": {
    major: [
      {
        name: "C Major (Open)",
        type: "open",
        frets:   [-1, 3, 2, 0, 1, 0],
        fingers: [ 0, 3, 2, 0, 1, 0],
        startFret: 1,
      },
    ],
    major7: [
      {
        name: "Cmaj7 (Open)",
        type: "open",
        frets:   [-1, 3, 2, 0, 0, 0],
        fingers: [ 0, 3, 2, 0, 0, 0],
        startFret: 1,
      },
    ],
    dominant7: [
      {
        name: "C7 (Open)",
        type: "open",
        frets:   [-1, 3, 2, 3, 1, 0],
        fingers: [ 0, 3, 2, 4, 1, 0],
        startFret: 1,
      },
    ],
    sus2: [
      {
        name: "Csus2 (Open)",
        type: "open",
        frets:   [-1, 3, 0, 0, 1, 0],  // x-3-0-0-1-0 (C-G-C-D-C, no E)
        fingers: [ 0, 3, 0, 0, 1, 0],
        startFret: 1,
      },
    ],
    sus4: [
      {
        name: "Csus4 (Open)",
        type: "open",
        frets:   [-1, 3, 3, 0, 1, 1],
        fingers: [ 0, 3, 4, 0, 1, 2],
        startFret: 1,
      },
    ],
  },
  "D": {
    major: [
      {
        name: "D Major (Open)",
        type: "open",
        frets:   [-1, -1, 0, 2, 3, 2],
        fingers: [  0,  0, 0, 1, 3, 2],
        startFret: 1,
      },
    ],
    minor: [
      {
        name: "Dm (Open)",
        type: "open",
        frets:   [-1, -1, 0, 2, 3, 1],
        fingers: [  0,  0, 0, 2, 3, 1],
        startFret: 1,
      },
    ],
    dominant7: [
      {
        name: "D7 (Open)",
        type: "open",
        frets:   [-1, -1, 0, 2, 1, 2],
        fingers: [  0,  0, 0, 3, 1, 2],
        startFret: 1,
      },
    ],
    major7: [
      {
        name: "Dmaj7 (Open)",
        type: "open",
        frets:   [-1, -1, 0, 2, 2, 2],
        fingers: [  0,  0, 0, 1, 2, 3],
        startFret: 1,
      },
    ],
    minor7: [
      {
        name: "Dm7 (Open)",
        type: "open",
        frets:   [-1, -1, 0, 2, 1, 1],
        fingers: [  0,  0, 0, 3, 1, 2],
        startFret: 1,
      },
    ],
    sus2: [
      {
        name: "Dsus2 (Open)",
        type: "open",
        frets:   [-1, -1, 0, 2, 3, 0],
        fingers: [  0,  0, 0, 1, 3, 0],
        startFret: 1,
      },
    ],
    sus4: [
      {
        name: "Dsus4 (Open)",
        type: "open",
        frets:   [-1, -1, 0, 2, 3, 3],
        fingers: [  0,  0, 0, 1, 3, 4],
        startFret: 1,
      },
    ],
  },
  "E": {
    major: [
      {
        name: "E Major (Open)",
        type: "open",
        frets:   [0, 2, 2, 1, 0, 0],
        fingers: [0, 2, 3, 1, 0, 0],
        startFret: 1,
      },
    ],
    minor: [
      {
        name: "Em (Open)",
        type: "open",
        frets:   [0, 2, 2, 0, 0, 0],
        fingers: [0, 2, 3, 0, 0, 0],
        startFret: 1,
      },
    ],
    dominant7: [
      {
        name: "E7 (Open)",
        type: "open",
        frets:   [0, 2, 0, 1, 0, 0],
        fingers: [0, 2, 0, 1, 0, 0],
        startFret: 1,
      },
    ],
    major7: [
      {
        name: "Emaj7 (Open)",
        type: "open",
        frets:   [0, 2, 1, 1, 0, 0],
        fingers: [0, 3, 1, 2, 0, 0],
        startFret: 1,
      },
    ],
    minor7: [
      {
        name: "Em7 (Open)",
        type: "open",
        frets:   [0, 2, 0, 0, 0, 0],
        fingers: [0, 2, 0, 0, 0, 0],
        startFret: 1,
      },
    ],
    sus2: [
      {
        name: "Esus2 (Open)",
        type: "open",
        frets:   [0, 2, 4, 4, 0, 0],
        fingers: [0, 1, 3, 4, 0, 0],
        startFret: 1,
      },
    ],
    sus4: [
      {
        name: "Esus4 (Open)",
        type: "open",
        frets:   [0, 2, 2, 2, 0, 0],
        fingers: [0, 2, 3, 4, 0, 0],
        startFret: 1,
      },
    ],
  },
  "G": {
    major: [
      {
        name: "G Major (Open)",
        type: "open",
        frets:   [3, 2, 0, 0, 0, 3],
        fingers: [2, 1, 0, 0, 0, 3],
        startFret: 1,
      },
    ],
    dominant7: [
      {
        name: "G7 (Open)",
        type: "open",
        frets:   [3, 2, 0, 0, 0, 1],
        fingers: [3, 2, 0, 0, 0, 1],
        startFret: 1,
      },
    ],
    major7: [
      {
        name: "Gmaj7 (Open)",
        type: "open",
        frets:   [3, 2, 0, 0, 0, 2],
        fingers: [3, 1, 0, 0, 0, 2],
        startFret: 1,
      },
    ],
    sus2: [
      {
        name: "Gsus2 (Open)",
        type: "open",
        frets:   [3, 2, 0, 0, 3, 3],
        fingers: [2, 1, 0, 0, 3, 4],
        startFret: 1,
      },
    ],
    sus4: [
      {
        name: "Gsus4 (Open)",
        type: "open",
        frets:   [3, 3, 0, 0, 1, 3],
        fingers: [3, 4, 0, 0, 1, 2],
        startFret: 1,
      },
    ],
  },
  "A": {
    major: [
      {
        name: "A Major (Open)",
        type: "open",
        frets:   [-1, 0, 2, 2, 2, 0],
        fingers: [  0, 0, 1, 2, 3, 0],
        startFret: 1,
      },
    ],
    minor: [
      {
        name: "Am (Open)",
        type: "open",
        frets:   [-1, 0, 2, 2, 1, 0],
        fingers: [  0, 0, 2, 3, 1, 0],
        startFret: 1,
      },
    ],
    dominant7: [
      {
        name: "A7 (Open)",
        type: "open",
        frets:   [-1, 0, 2, 0, 2, 0],
        fingers: [  0, 0, 2, 0, 3, 0],
        startFret: 1,
      },
    ],
    major7: [
      {
        name: "Amaj7 (Open)",
        type: "open",
        frets:   [-1, 0, 2, 1, 2, 0],
        fingers: [  0, 0, 3, 1, 4, 0],
        startFret: 1,
      },
    ],
    minor7: [
      {
        name: "Am7 (Open)",
        type: "open",
        frets:   [-1, 0, 2, 0, 1, 0],
        fingers: [  0, 0, 2, 0, 1, 0],
        startFret: 1,
      },
    ],
    sus2: [
      {
        name: "Asus2 (Open)",
        type: "open",
        frets:   [-1, 0, 2, 2, 0, 0],
        fingers: [  0, 0, 1, 2, 0, 0],
        startFret: 1,
      },
    ],
    sus4: [
      {
        name: "Asus4 (Open)",
        type: "open",
        frets:   [-1, 0, 2, 2, 3, 0],
        fingers: [  0, 0, 1, 2, 3, 0],
        startFret: 1,
      },
    ],
  },
  "B": {
    major: [
      {
        name: "B Major (Barre 2nd)",
        type: "barre",
        frets:   [-1, 2, 4, 4, 4, 2],
        fingers: [  0, 1, 3, 4, 2, 1],
        barre: { fret: 2, fromString: 5, toString: 1 },
        startFret: 2,
      },
    ],
    minor: [
      {
        name: "Bm (Barre 2nd)",
        type: "barre",
        frets:   [-1, 2, 4, 4, 3, 2],
        fingers: [  0, 1, 3, 4, 2, 1],
        barre: { fret: 2, fromString: 5, toString: 1 },
        startFret: 2,
      },
    ],
  },
};

// ─── Apply overrides ──────────────────────────────────────────────────────────

/**
 * Merge override voicings into the front of the generated list.
 * Duplicates (same frets) are removed from the generated list first.
 */
function mergeOverrides(generated, overrideList) {
  // Keys of overrides so we don't duplicate
  var overrideKeys = {};
  overrideList.forEach(function(v) { overrideKeys[fretKey(v)] = true; });

  // Remove generated entries that match an override
  var filtered = generated.filter(function(v) { return !overrideKeys[fretKey(v)]; });

  // Prepend overrides
  return overrideList.concat(filtered).slice(0, 6);
}

// ─── Build CHORD_DATA ─────────────────────────────────────────────────────────

var CHORD_DATA = {};

var CHORD_TYPE_KEYS = ["major", "minor", "dominant7", "major7", "minor7", "sus2", "sus4", "dim", "aug", "major6", "minor6"];

NOTE_NAMES.forEach(function(note) {
  CHORD_DATA[note] = {};
  CHORD_TYPE_KEYS.forEach(function(chordType) {
    var voicings = generateVoicings(note, chordType);

    // Apply known-good overrides where available
    var noteOverrides = KNOWN_OVERRIDES[note];
    if (noteOverrides && noteOverrides[chordType]) {
      voicings = mergeOverrides(voicings, noteOverrides[chordType]);
    }

    CHORD_DATA[note][chordType] = voicings;
  });
});

// ─── Exports (browser globals) ────────────────────────────────────────────────

const NOTES = [
  "C", "C#/Db", "D", "D#/Eb", "E",
  "F", "F#/Gb", "G", "G#/Ab", "A", "A#/Bb", "B"
];

const CHORD_TYPES = [
  { value: "major",     label: "Major" },
  { value: "minor",     label: "Minor" },
  { value: "dominant7", label: "Dominant 7th (7)" },
  { value: "major7",    label: "Major 7th (maj7)" },
  { value: "minor7",    label: "Minor 7th (m7)" },
  { value: "sus2",      label: "Suspended 2nd (sus2)" },
  { value: "sus4",      label: "Suspended 4th (sus4)" },
  { value: "dim",       label: "Diminished (dim)" },
  { value: "aug",       label: "Augmented (aug)" },
  { value: "major6",    label: "Major 6th (6)" },
  { value: "minor6",    label: "Minor 6th (m6)" },
];
