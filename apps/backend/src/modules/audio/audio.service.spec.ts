import { whisperExtension } from './audio.service';

describe('whisperExtension', () => {
  it('maps audio mime types to Whisper-supported extensions', () => {
    expect(whisperExtension('audio/mpeg')).toBe('mp3');
    expect(whisperExtension('audio/webm')).toBe('webm');
    expect(whisperExtension('audio/wav')).toBe('wav');
    expect(whisperExtension('audio/x-wav')).toBe('wav');
    expect(whisperExtension('audio/x-m4a')).toBe('m4a');
    expect(whisperExtension('audio/mp4')).toBe('m4a');
    expect(whisperExtension('audio/ogg')).toBe('ogg');
  });

  it('defaults to mp3 for an unknown/empty type', () => {
    expect(whisperExtension('')).toBe('mp3');
  });
});
