// piano-chords.js — Piano chord voicings (all inversions, all keys)

// Semitones from C for each note (C-based, unlike guitar's E-based tuning)
const PIANO_NOTE_SEMITONES = {
  "C": 0, "C#/Db": 1, "D": 2, "D#/Eb": 3, "E": 4,
  "F": 5, "F#/Gb": 6, "G": 7, "G#/Ab": 8, "A": 9, "A#/Bb": 10, "B": 11,
};

// All 12 notes in chromatic order (C-based)
const PIANO_NOTES = [
  "C","C#/Db","D","D#/Eb","E","F","F#/Gb","G","G#/Ab","A","A#/Bb","B"
];

// Chord intervals in semitones from root
const PIANO_CHORD_INTERVALS = {
  major:     [0, 4, 7],
  minor:     [0, 3, 7],
  dominant7: [0, 4, 7, 10],
  major7:    [0, 4, 7, 11],
  minor7:    [0, 3, 7, 10],
  sus2:      [0, 2, 7],
  sus4:      [0, 5, 7],
  dim:       [0, 3, 6],
  aug:       [0, 4, 8],
  major6:    [0, 4, 7, 9],
  minor6:    [0, 3, 7, 9],
};

const INVERSION_NAMES = ['Root Position', '1st Inversion', '2nd Inversion', '3rd Inversion'];

const PIANO_CHORD_TYPE_SUFFIX = {
  major: 'Major', minor: 'Minor', dominant7: '7',
  major7: 'maj7', minor7: 'm7', sus2: 'sus2', sus4: 'sus4',
  dim: 'dim', aug: 'aug', major6: '6', minor6: 'm6',
};

/**
 * Generate all inversions for a given root note and chord type.
 * notePositions are semitones relative to C4 (0 = C4, 23 = B5).
 * All inversions fit within two octaves (verified for all 11 chord types × 12 notes).
 */
function generatePianoVoicings(rootNote, chordType) {
  const intervals = PIANO_CHORD_INTERVALS[chordType];
  const rootSemitone = PIANO_NOTE_SEMITONES[rootNote];
  const suffix = PIANO_CHORD_TYPE_SUFFIX[chordType];
  const voicings = [];

  for (let inv = 0; inv < intervals.length; inv++) {
    // Rotate: inv-th degree becomes the bass; earlier degrees go up an octave
    const rotated = [
      ...intervals.slice(inv),
      ...intervals.slice(0, inv).map(i => i + 12),
    ];

    // Semitone of the bass note within one octave (0–11, C-based)
    const bassSemitone = (rootSemitone + intervals[inv]) % 12;

    // Absolute positions relative to C4 (0 = C4)
    const notePositions = rotated.map((interval, j) =>
      bassSemitone + (rotated[j] - rotated[0])
    );

    // Human-readable note names for each position
    const noteNames = notePositions.map(pos => PIANO_NOTES[pos % 12]);

    voicings.push({
      name:            `${rootNote} ${suffix}`,
      inversionLabel:  INVERSION_NAMES[inv] || `${inv}th Inversion`,
      inversionIndex:  inv,
      notePositions,   // array of ints, 0–23
      noteNames,       // array of note name strings
      chordType,
    });
  }

  return voicings;
}

// ── Build PIANO_CHORD_DATA ─────────────────────────────────────────────────
const PIANO_CHORD_DATA = {};

const PIANO_CHORD_KEYS = [
  "major","minor","dominant7","major7","minor7",
  "sus2","sus4","dim","aug","major6","minor6",
];

PIANO_NOTES.forEach(note => {
  PIANO_CHORD_DATA[note] = {};
  PIANO_CHORD_KEYS.forEach(type => {
    PIANO_CHORD_DATA[note][type] = generatePianoVoicings(note, type);
  });
});

// ── Exports (browser globals) ──────────────────────────────────────────────
const PIANO_CHORD_TYPES = [
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
