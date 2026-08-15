export const QR_SIZE = 25;
export const QR_DATA_CW = 28;
export const QR_EC_CW = 16;

export function qrBuildGF() {
  const EXP = new Array(512).fill(0);
  const LOG = new Array(256).fill(0);
  let x = 1;
  for (let i = 0; i < 255; i++) {
    EXP[i] = x;
    LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
  return { EXP, LOG };
}
const { EXP: QR_EXP, LOG: QR_LOG } = qrBuildGF();

export function qrGmul(a, b) {
  if (a === 0 || b === 0) return 0;
  return QR_EXP[QR_LOG[a] + QR_LOG[b]];
}
export function qrPolyMul(p, q) {
  const r = new Array(p.length + q.length - 1).fill(0);
  for (let i = 0; i < p.length; i++) {
    if (p[i] === 0) continue;
    for (let j = 0; j < q.length; j++) {
      r[i + j] ^= qrGmul(p[i], q[j]);
    }
  }
  return r;
}
export function qrGeneratorPoly(nsym) {
  let g = [1];
  for (let i = 0; i < nsym; i++) g = qrPolyMul(g, [1, QR_EXP[i]]);
  return g;
}
export function qrRsEncode(data, nsym) {
  const gen = qrGeneratorPoly(nsym);
  const msg = data.slice();
  for (let i = 0; i < nsym; i++) msg.push(0);
  for (let i = 0; i < data.length; i++) {
    const coef = msg[i];
    if (coef !== 0) {
      for (let j = 0; j < gen.length; j++) msg[i + j] ^= qrGmul(gen[j], coef);
    }
  }
  return msg.slice(data.length);
}

export function qrEncodeBytes(text) {
  const dataBytes = Array.from(new TextEncoder().encode(text));
  if (dataBytes.length > QR_DATA_CW - 3) {
    // Defensive truncation — admission IDs are always well under this,
    // this just guarantees we never produce a corrupt/unscannable code.
    dataBytes.length = QR_DATA_CW - 3;
  }
  const bits = [];
  const push = (val, n) => {
    for (let i = n - 1; i >= 0; i--) bits.push((val >> i) & 1);
  };
  push(0b0100, 4);
  push(dataBytes.length, 8);
  for (const b of dataBytes) push(b, 8);
  const capBits = QR_DATA_CW * 8;
  const term = Math.min(4, capBits - bits.length);
  push(0, term);
  while (bits.length % 8 !== 0) bits.push(0);
  const cws = [];
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j++) byte = (byte << 1) | bits[i + j];
    cws.push(byte);
  }
  const pad = [0xec, 0x11];
  let pi = 0;
  while (cws.length < QR_DATA_CW) cws.push(pad[pi++ % 2]);
  return cws;
}

export function qrMaskFn(pat, r, c) {
  switch (pat) {
    case 0:
      return (r + c) % 2 === 0 ? 1 : 0;
    case 1:
      return r % 2 === 0 ? 1 : 0;
    case 2:
      return c % 3 === 0 ? 1 : 0;
    case 3:
      return (r + c) % 3 === 0 ? 1 : 0;
    case 4:
      return (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0 ? 1 : 0;
    case 5:
      return ((r * c) % 2) + ((r * c) % 3) === 0 ? 1 : 0;
    case 6:
      return (((r * c) % 2) + ((r * c) % 3)) % 2 === 0 ? 1 : 0;
    case 7:
      return (((r + c) % 2) + ((r * c) % 3)) % 2 === 0 ? 1 : 0;
    default:
      return 0;
  }
}

export function qrBuildMatrix(dataCws, maskPattern) {
  const size = QR_SIZE;
  const mat = Array.from({ length: size }, () => new Array(size).fill(null));
  const reserved = Array.from({ length: size }, () => new Array(size).fill(false));
  const setM = (r, c, v) => {
    mat[r][c] = v;
    reserved[r][c] = true;
  };

  const placeFinder = (r0, c0) => {
    for (let i = -1; i < 8; i++) {
      for (let j = -1; j < 8; j++) {
        const rr = r0 + i,
          cc = c0 + j;
        if (rr < 0 || rr >= size || cc < 0 || cc >= size) continue;
        if (i >= 0 && i <= 6 && j >= 0 && j <= 6 && (i === 0 || i === 6 || j === 0 || j === 6 || (i >= 2 && i <= 4 && j >= 2 && j <= 4))) {
          setM(rr, cc, 1);
        } else {
          setM(rr, cc, 0);
        }
      }
    }
  };
  placeFinder(0, 0);
  placeFinder(0, size - 7);
  placeFinder(size - 7, 0);

  for (let i = 8; i < size - 8; i++) {
    const val = i % 2 === 0 ? 1 : 0;
    setM(6, i, val);
    setM(i, 6, val);
  }

  const ar = 18,
    ac = 18;
  for (let i = -2; i <= 2; i++) {
    for (let j = -2; j <= 2; j++) {
      const v = Math.max(Math.abs(i), Math.abs(j)) === 2 || (i === 0 && j === 0) ? 1 : 0;
      setM(ar + i, ac + j, v);
    }
  }

  setM(17, 8, 1); // dark module, version 2

  for (let i = 0; i <= 8; i++) {
    reserved[8][i] = true;
    reserved[i][8] = true;
  }
  for (let i = size - 8; i < size; i++) reserved[8][i] = true;
  for (let i = size - 7; i < size; i++) reserved[i][8] = true;

  const totalBits = [];
  for (const cw of dataCws) for (let i = 7; i >= 0; i--) totalBits.push((cw >> i) & 1);

  let bitIdx = 0,
    col = size - 1,
    upward = true;
  while (col > 0) {
    if (col === 6) col -= 1;
    for (let ri = 0; ri < size; ri++) {
      const row = upward ? size - 1 - ri : ri;
      for (const c of [col, col - 1]) {
        if (!reserved[row][c] && mat[row][c] === null) {
          const bit = bitIdx < totalBits.length ? totalBits[bitIdx] : 0;
          bitIdx++;
          const m = qrMaskFn(maskPattern, row, c);
          mat[row][c] = bit ^ m;
        }
      }
    }
    upward = !upward;
    col -= 2;
  }
  return mat;
}

export function qrPlaceFormatInfo(mat, eccBits, maskPattern) {
  const size = QR_SIZE;
  const data = (eccBits << 3) | maskPattern;
  const g = 0x537;
  let tmp = data << 10;
  const val = tmp;
  for (let i = 4; i >= 0; i--) {
    if (tmp & (1 << (i + 10))) tmp ^= g << i;
  }
  const fmt = val ^ tmp ^ 0x5412;
  const bits = [];
  for (let i = 14; i >= 0; i--) bits.push((fmt >> i) & 1);

  const seqA = [
    [8, 0],
    [8, 1],
    [8, 2],
    [8, 3],
    [8, 4],
    [8, 5],
    [8, 7],
    [8, 8],
    [7, 8],
    [5, 8],
    [4, 8],
    [3, 8],
    [2, 8],
    [1, 8],
    [0, 8],
  ];
  seqA.forEach(([r, c], k) => {
    mat[r][c] = bits[k];
  });
  const seqB = [
    [size - 1, 8],
    [size - 2, 8],
    [size - 3, 8],
    [size - 4, 8],
    [size - 5, 8],
    [size - 6, 8],
    [size - 7, 8],
    [8, size - 8],
    [8, size - 7],
    [8, size - 6],
    [8, size - 5],
    [8, size - 4],
    [8, size - 3],
    [8, size - 2],
    [8, size - 1],
  ];
  seqB.forEach(([r, c], k) => {
    mat[r][c] = bits[k];
  });
  return mat;
}

export function qrPenaltyScore(mat) {
  const size = mat.length;
  let score = 0;
  for (let r = 0; r < size; r++) {
    let run = 1;
    for (let c = 1; c < size; c++) {
      if (mat[r][c] === mat[r][c - 1]) run++;
      else {
        if (run >= 5) score += run - 2;
        run = 1;
      }
    }
    if (run >= 5) score += run - 2;
  }
  for (let c = 0; c < size; c++) {
    let run = 1;
    for (let r = 1; r < size; r++) {
      if (mat[r][c] === mat[r - 1][c]) run++;
      else {
        if (run >= 5) score += run - 2;
        run = 1;
      }
    }
    if (run >= 5) score += run - 2;
  }
  for (let r = 0; r < size - 1; r++) {
    for (let c = 0; c < size - 1; c++) {
      const v = mat[r][c];
      if (v === mat[r][c + 1] && v === mat[r + 1][c] && v === mat[r + 1][c + 1]) score += 3;
    }
  }
  let dark = 0;
  for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) dark += mat[r][c];
  const pct = Math.floor((dark * 100) / (size * size));
  const prev = pct - (pct % 5);
  const nextm = prev + 5;
  score += Math.min(Math.abs(prev - 50) / 5, Math.abs(nextm - 50) / 5) * 10;
  return score;
}

export const QR_ECC_M_INDICATOR = 0b00;

/** Returns a 25x25 matrix (array of arrays of 0/1) encoding `text`. */
export function generateQrMatrix(text) {
  const dataCws = qrEncodeBytes(text);
  const ecCws = qrRsEncode(dataCws, QR_EC_CW);
  const allCws = dataCws.concat(ecCws);
  let best = null;
  for (let mp = 0; mp < 8; mp++) {
    const mat = qrBuildMatrix(allCws, mp);
    const mat2 = mat.map((row) => row.slice());
    qrPlaceFormatInfo(mat2, QR_ECC_M_INDICATOR, mp);
    const sc = qrPenaltyScore(mat2);
    if (best === null || sc < best.sc) best = { sc, mat: mat2 };
  }
  return best.mat;
}
