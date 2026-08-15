// tools/split-port.mjs — one-time mechanical port of the legacy single-file
// app source (extracted from public/index-premium.html) into the modular
// src/ tree. Slices by line range, adds `export` to top-level declarations,
// and generates cross-module import statements from actual identifier usage.
// The result is behavior-identical; hand-written type annotations come later.

import fs from 'node:fs';
import path from 'node:path';

const RAW = process.argv[2] || 'C:/Users/User/AppData/Local/Temp/opencode/ack-raw/premium.jsx';
const lines = fs.readFileSync(RAW, 'utf8').split('\n');
const line = (n) => lines[n - 1]; // 1-indexed

// name -> { file (relative to src/), ranges: [[start,end], ...] }
const MODULES = [
  { file: 'icons.tsx', ranges: [[2, 52]] },
  { file: 'components/charts.tsx', ranges: [[54, 219]] },
  { file: 'components/ui.tsx', ranges: [[220, 349]] },
  { file: 'components/nav.tsx', ranges: [[351, 407]] },
  { file: 'components/QRScannerModal.tsx', ranges: [[409, 494]] },
  { file: 'lib/theme.ts', ranges: [[495, 561]] },
  { file: 'lib/tournament.ts', ranges: [[563, 605]] },
  { file: 'lib/dates.ts', ranges: [[601, 631]] },
  { file: 'lib/identity.ts', ranges: [[632, 660]] },
  { file: 'lib/attendance.ts', ranges: [[661, 938]] },
  { file: 'lib/qr.ts', ranges: [[940, 1170]] },
  { file: 'hooks/useAuth.ts', ranges: [[1172, 1209]] },
  { file: 'hooks/useClubData.ts', ranges: [[1210, 1473]] },
  { file: 'lib/csv.ts', ranges: [[1531, 1669]] },
  { file: 'features/students.tsx', ranges: [[1474, 1530], [1671, 2144]] },
  { file: 'features/dashboard.tsx', ranges: [[2145, 2320]] },
  { file: 'features/attendance.tsx', ranges: [[2321, 2583]] },
  { file: 'features/achievements.tsx', ranges: [[2584, 3113]] },
  { file: 'features/analytics.tsx', ranges: [[3114, 3362]] },
  { file: 'features/notifications.tsx', ranges: [[3363, 3412]] },
  { file: 'features/profile.tsx', ranges: [[3413, 3712]] },
  { file: 'features/auth.tsx', ranges: [[3713, 3819]] },
  { file: 'lib/supabase.ts', ranges: [[3820, 3834]] },
  { file: 'App.tsx', ranges: [[3836, 4003]] },
];

const EXPORT_RE = /^(function\s+\w+|const\s+\w+\s*=)/;

const files = new Map(); // file -> content lines
for (const mod of MODULES) {
  const parts = [];
  for (const [s, e] of mod.ranges) {
    for (let i = s; i <= e; i++) {
      const l = line(i);
      if (l === undefined) throw new Error(`${mod.file}: line ${i} out of range`);
      parts.push(EXPORT_RE.test(l) ? 'export ' + l : l);
    }
  }
  files.set(mod.file, parts);
}

// Collect exported names per file.
function exportedNames(content) {
  const names = new Set();
  for (const l of content) {
    const m = l.match(/^export\s+(?:function\s+(\w+)|const\s+(\w+)\s*=)/);
    if (m) names.add(m[1] || m[2]);
  }
  return names;
}
const exportsByFile = new Map();
for (const [file, content] of files) exportsByFile.set(file, exportedNames(content));

// Duplicate-name guard: two modules exporting the same name would break imports.
const seen = new Map();
for (const [file, names] of exportsByFile) {
  for (const n of names) {
    if (seen.has(n) && seen.get(n) !== file) throw new Error(`duplicate export "${n}" in ${seen.get(n)} and ${file}`);
    seen.set(n, file);
  }
}

// Generate imports: for each file, find identifiers it uses from other files.
function rel(fromFile, toFile) {
  const from = path.posix.dirname('src/' + fromFile);
  const to = path.posix.dirname('src/' + toFile);
  let p = path.posix.relative(from, to);
  if (!p.startsWith('.')) p = './' + p;
  return p + '/' + path.posix.basename(toFile).replace(/\.(tsx|ts)$/, '');
}
for (const [file, content] of files) {
  const joined = content.join('\n');
  const importLines = [];
  for (const [otherFile, names] of exportsByFile) {
    if (otherFile === file) continue;
    const used = [...names].filter((n) => new RegExp('\\b' + n + '\\b').test(joined));
    if (used.length) importLines.push(`import { ${used.join(', ')} } from '${rel(file, otherFile)}';`);
  }
  if (/React\./.test(joined)) importLines.unshift("import React from 'react';");
  if (file === 'components/QRScannerModal.tsx' && /\bjsQR\b/.test(joined)) importLines.push("import jsQR from 'jsqr';");
  const out = importLines.length ? importLines.join('\n') + '\n\n' + joined : joined;
  const dest = 'src/' + file;
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, out + '\n');
  console.log(`wrote ${dest} (${content.length} lines, ${importLines.length} imports)`);
}
console.log('split complete');