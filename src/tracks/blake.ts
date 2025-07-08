import * as Tone from 'tone';
import { getRandomBetween } from '../utils';

export async function playBlakePiece(): Promise<Tone.Analyser> {
  return new Promise(resolve => {
    const freeverb = new Tone.Freeverb({ roomSize: 0.8, dampening: 6000, wet: 0.9 });
    const analyser = new Tone.Analyser('fft', 64);

    const filter = new Tone.Filter({
      type: 'lowpass',
      frequency: 900,
      rolloff: -12,
      Q: 0.5
    });

    const synth = new Tone.PolySynth({
      maxPolyphony: 8,
      voice: Tone.Synth,
      options: {
        oscillator: { type: 'sawtooth' },
        volume: -30,
        envelope: {
          attack: 0.03,
          decay: 0.2,
          sustain: 0.8,
          release: 3
        }
      }
    });

    const tremolo = new Tone.Tremolo({
      frequency: 6,
      depth: 0.75,
      spread: 250
    }).start();

    const tremoloDepthLFO = new Tone.LFO({
      frequency: 0.1,
      min: 0.3,
      max: 0.9
    });

    tremoloDepthLFO.connect(tremolo.depth);
    tremoloDepthLFO.start();

    synth.chain(filter, tremolo, freeverb, analyser, Tone.Destination);

    const motifs: [string, string[]][][] = [
      [
        ['0:0', ['G3', 'A#3', 'D4']], // Gm
        ['0:2', ['A3', 'C4', 'E4']], // Am
        ['0:4', ['A#3', 'D4', 'F4']], // A#
        ['0:6', ['A3', 'C4', 'E4']], // Am
        ['0:8', ['A#3', 'D4', 'F4']], // A#
        ['0:10', ['A3', 'C#4', 'E4']], // A
        ['0:12', ['D4', 'F#4', 'A4']] // D
      ],
      [
        ['0:0', ['A3', 'C4', 'E4']], // Am
        ['0:2', ['A#3', 'D4', 'F4']], // A#
        ['0:4', ['A3', 'C4', 'E4']], // Am
        ['0:6', ['A#3', 'D4', 'F4']], // A#
        ['0:8', ['A3', 'C4', 'E4']], // Am
        ['0:10', ['D4', 'F#4', 'A4']] // D
      ],
      [
        ['0:0', ['A#3', 'D4', 'F4']], // A#
        ['0:2', ['A3', 'C4', 'E4']], // Am
        ['0:4', ['B3', 'D4', 'A4']], // Bm7
        ['0:6', ['A3', 'C4', 'E4']], // Am
        ['0:8', ['C#4', 'E4', 'G#4']], // C#m
        ['0:10', ['D4', 'F#4', 'A4']] // D
      ],
      [
        ['0:0', ['B3', 'D4', 'A4']], // Bm
        ['0:2', ['A3', 'C#4', 'E4', 'G4']], // A7
        ['0:4', ['C4', 'E4', 'G4']], // C
        ['0:6', ['A3', 'C4', 'E4']], // Am
        ['0:8', ['A#3', 'D4', 'F4']], // A#
        ['0:10', ['A3', 'C4', 'E4']], // Am
        ['0:12', ['D4', 'F#4', 'A4']] // D
      ],
      [
        ['0:0', ['G3', 'A#3', 'D4']], // Gm
        ['0:2', ['A3', 'C4', 'E4']], // Am
        ['0:4', ['A#3', 'D4', 'F4']], // A#
        ['0:6', ['A3', 'C4', 'E4']], // Am
        ['0:8', ['B3', 'D4', 'A4']], // Bm7
        ['0:10', ['A3', 'C4', 'E4']], // Am
        ['0:12', ['C#4', 'E4', 'G#4']], // C#m
        ['0:14', ['D4', 'F#4', 'A4']] // D
      ],
      [
        ['0:0', ['B3', 'D4', 'A4']], // Bm
        ['0:2', ['A3', 'C#4', 'G4']], // A
        ['0:4', ['C4', 'E4', 'A#4']], // C7
        ['0:6', ['A3', 'C4', 'E4']], // Am
        ['0:8', ['A#3', 'D4', 'F4']], // A#
        ['0:10', ['A3', 'C4', 'E4']], // Am
        ['0:12', ['D4', 'F#4', 'A4']] // D
      ]
    ];

    let currentPart: Tone.Part | null = null;

    function playNextMotif() {
      if (currentPart) {
        currentPart.dispose();
      }

      const motif = motifs[Math.floor(Math.random() * motifs.length)];

      currentPart = new Tone.Part((time, chord: string[]) => {
        synth.triggerAttackRelease(chord, '8n', time);
      }, motif).start('+0');

      currentPart.loop = true;
      currentPart.loopEnd = '4m';
    }

    Tone.Transport.bpm.value = 65;
    Tone.Transport.start();

    playNextMotif();

    Tone.Transport.scheduleRepeat(() => {
      playNextMotif();
    }, '8m');
    resolve(analyser);
  });
}
