export function base64ToInt16Array(base64: string): Int16Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return new Int16Array(bytes.buffer);
}

export function pcmToWavBlob(pcmData: Int16Array, sampleRate = 24000): Blob {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const pcmByteLen = pcmData.length * 2;
  const buffer = new ArrayBuffer(44 + pcmByteLen);
  const view = new DataView(buffer);

  function writeString(v: DataView, offset: number, str: string) {
    for (let i = 0; i < str.length; i++) {
      v.setUint8(offset + i, str.charCodeAt(i));
    }
  }

  /* RIFF identifier */
  writeString(view, 0, 'RIFF');
  /* RIFF chunk length */
  view.setUint32(4, 36 + pcmByteLen, true);
  /* RIFF type */
  writeString(view, 8, 'WAVE');
  /* format chunk identifier */
  writeString(view, 12, 'fmt ');
  /* format chunk length */
  view.setUint32(16, 16, true);
  /* sample format (1 = PCM) */
  view.setUint16(20, 1, true);
  /* channel count */
  view.setUint16(22, numChannels, true);
  /* sample rate */
  view.setUint32(24, sampleRate, true);
  /* byte rate */
  view.setUint32(28, byteRate, true);
  /* block align */
  view.setUint16(32, blockAlign, true);
  /* bits per sample */
  view.setUint16(34, bitsPerSample, true);
  /* data chunk identifier */
  writeString(view, 36, 'data');
  /* data chunk length */
  view.setUint32(40, pcmByteLen, true);

  const pcmBytes = new Int16Array(buffer, 44, pcmData.length);
  pcmBytes.set(pcmData);

  return new Blob([buffer], { type: 'audio/wav' });
}

export function encodePcmToMp3(int16Samples: Int16Array, sampleRate = 24000, kbps = 128): Blob | null {
  try {
    const lamejs = (window as any).lamejs;
    if (!lamejs) {
      console.warn("lamejs window globalida topilmadi");
      return null;
    }
    const mp3encoder = new lamejs.Mp3Encoder(1, sampleRate, kbps);
    const mp3Data: Uint8Array[] = [];
    const sampleBlockSize = 1152;

    for (let i = 0; i < int16Samples.length; i += sampleBlockSize) {
      const sampleChunk = int16Samples.subarray(i, i + sampleBlockSize);
      const mp3buf = mp3encoder.encodeBuffer(sampleChunk);
      if (mp3buf.length > 0) {
        mp3Data.push(new Uint8Array(mp3buf));
      }
    }
    const mp3buf = mp3encoder.flush();
    if (mp3buf.length > 0) {
      mp3Data.push(new Uint8Array(mp3buf));
    }
    return new Blob(mp3Data, { type: 'audio/mp3' });
  } catch (err) {
    console.error("MP3 kodlash xatosi:", err);
    return null;
  }
}

export function generateWaveformBars(int16Samples: Int16Array, totalBars = 60): number[] {
  if (!int16Samples || int16Samples.length === 0) {
    return Array(totalBars).fill(20);
  }
  const blockSize = Math.floor(int16Samples.length / totalBars);
  const bars: number[] = [];

  for (let i = 0; i < totalBars; i++) {
    const start = i * blockSize;
    const end = Math.min(start + blockSize, int16Samples.length);
    let max = 0;
    for (let j = start; j < end; j++) {
      const abs = Math.abs(int16Samples[j]);
      if (abs > max) max = abs;
    }
    const heightPercent = Math.max(12, Math.min(100, Math.round((max / 32768) * 100)));
    bars.push(heightPercent);
  }

  return bars;
}

export function formatSeconds(seconds: number): string {
  if (isNaN(seconds) || seconds <= 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}
