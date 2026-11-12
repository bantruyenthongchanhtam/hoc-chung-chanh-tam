#!/usr/bin/env node
/**
 * Convert data.xlsx -> data.json / Chuyển đổi data.xlsx -> data.json
 *
 * Pure Node.js with zero dependencies (built-in zlib ZIP reader),
 * runs locally (Git Bash / Windows) and in GitHub Actions.
 * Node thuần không cần cài đặt gì thêm (đọc ZIP bằng zlib có sẵn),
 * chạy được cả trên máy local và GitHub Actions.
 *
 * Usage / Cách dùng: node scripts/convert-data.js
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const ROOT = path.join(__dirname, '..');
const XLSX_PATH = path.join(ROOT, 'public', 'data.xlsx');
const JSON_PATH = path.join(ROOT, 'public', 'data.json');
const SHEET_NAME = 'DS'; // Member sheet / Sheet chứa danh sách thành viên

/* =======================
   DECODE XML ENTITIES
   &lt;a href&gt; -> <a href> (SheetJS did this too)
   Giải mã thực thể XML để giống kết quả SheetJS cũ
======================= */
const decodeXml = (s) => String(s)
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');

/* =======================
   MINIMAL ZIP READER
   Reads entries via the central directory (handles deflate + stored)
   Đọc các mục qua central directory (hỗ trợ deflate + stored)
======================= */
function readZip(buffer) {
    const entries = {};
    const scanFrom = Math.max(0, buffer.length - 22 - 65535);
    let eocd = -1;
    for (let i = buffer.length - 22; i >= scanFrom; i--) {
        if (buffer.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
    }
    if (eocd < 0) throw new Error('Invalid xlsx: ZIP End of Central Directory not found');

    const total = buffer.readUInt16LE(eocd + 10);
    let ptr = buffer.readUInt32LE(eocd + 16);
    for (let n = 0; n < total; n++) {
        if (ptr + 46 > buffer.length || buffer.readUInt32LE(ptr) !== 0x02014b50) {
            throw new Error('Invalid ZIP central directory');
        }
        const method = buffer.readUInt16LE(ptr + 10);
        const compressedSize = buffer.readUInt32LE(ptr + 20);
        const nameLen = buffer.readUInt16LE(ptr + 28);
        const extraLen = buffer.readUInt16LE(ptr + 30);
        const commentLen = buffer.readUInt16LE(ptr + 32);
        const localOffset = buffer.readUInt32LE(ptr + 42);
        const name = buffer.toString('utf8', ptr + 46, ptr + 46 + nameLen);

        // Local header has its own name/extra lengths / Header cục bộ có độ dài riêng
        const lNameLen = buffer.readUInt16LE(localOffset + 26);
        const lExtraLen = buffer.readUInt16LE(localOffset + 28);
        const start = localOffset + 30 + lNameLen + lExtraLen;
        const raw = buffer.subarray(start, start + compressedSize);
        entries[name] = method === 0 ? Buffer.from(raw) : zlib.inflateRawSync(raw);
        ptr += 46 + nameLen + extraLen + commentLen;
    }
    return entries;
}

/* =======================
   SHEET XML -> ROWS
   Column-reference aware (r="B2"), same logic proven on this dataset
   Đọc theo tham chiếu cột (r="B2"), logic đã kiểm chứng với dữ liệu này
======================= */
const colToIdx = (letters) =>
    [...letters].reduce((n, ch) => n * 26 + (ch.charCodeAt(0) - 64), 0) - 1;

function sheetRows(xml, shared) {
    return [...xml.matchAll(/<row[^>]*>([\s\S]*?)<\/row>/g)].map((rm) => {
        const row = [];
        for (const cm of rm[1].matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
            const attrs = cm[1];
            const refM = attrs.match(/r="([A-Z]+)\d+"/);
            const idx = refM ? colToIdx(refM[1]) : row.length;
            const isStr = /\bt="s"/.test(attrs);
            const isInline = /t="inlineStr"/.test(attrs);
            let val = '';
            if (isInline) {
                val = [...(cm[2] || '').matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((t) => t[1]).join('');
            } else {
                const vM = (cm[2] || '').match(/<v>([\s\S]*?)<\/v>/);
                val = vM ? vM[1] : '';
            }
            row[idx] = decodeXml(isStr ? (shared[+val] ?? val) : val);
        }
        return Array.from(row, (v) => v ?? '');
    });
}

/* =======================
   MAIN
======================= */
(function main() {
    if (!fs.existsSync(XLSX_PATH)) {
        console.error(`Not found / Không tìm thấy: ${XLSX_PATH}`);
        process.exit(1);
    }

    const zip = readZip(fs.readFileSync(XLSX_PATH));

    // 1. Shared strings / Chuỗi dùng chung
    let shared = [];
    if (zip['xl/sharedStrings.xml']) {
        shared = [...zip['xl/sharedStrings.xml'].toString('utf8').matchAll(/<si>([\s\S]*?)<\/si>/g)]
            .map((m) => [...m[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((t) => t[1]).join(''))
            .map(decodeXml);
    }

    // 2. Resolve the "DS" sheet path via workbook.xml + rels
    //    Tìm đúng sheet "DS" qua workbook.xml + rels (không phụ thuộc thứ tự sheet)
    const workbook = zip['xl/workbook.xml'] && zip['xl/workbook.xml'].toString('utf8');
    if (!workbook) { console.error('Invalid xlsx: missing xl/workbook.xml'); process.exit(1); }

    const sheetTag = [...workbook.matchAll(/<sheet\b[^>]*>/g)]
        .map((m) => m[0])
        .find((tag) => tag.includes(`name="${SHEET_NAME}"`));
    if (!sheetTag) { console.error(`Sheet "${SHEET_NAME}" not found / Không tìm thấy sheet`); process.exit(1); }

    const ridM = sheetTag.match(/r:id="([^"]+)"/);
    const relsXml = zip['xl/_rels/workbook.xml.rels'] && zip['xl/_rels/workbook.xml.rels'].toString('utf8');
    const relM = ridM && relsXml && relsXml.match(new RegExp(`<Relationship\\b[^>]*Id="${ridM[1]}"[^>]*>`));
    const targetM = relM && relM[0].match(/Target="([^"]+)"/);
    if (!targetM) { console.error('Cannot resolve sheet target / Không xác định được đường dẫn sheet'); process.exit(1); }
    const sheetPath = targetM[1].startsWith('/')
        ? targetM[1].slice(1)
        : `xl/${targetM[1]}`;

    if (!zip[sheetPath]) { console.error(`Missing ${sheetPath} in xlsx`); process.exit(1); }

    // 3. Rows -> member objects / Hàng -> đối tượng thành viên
    const rows = sheetRows(zip[sheetPath].toString('utf8'), shared);
    if (rows.length < 2) { console.error('Sheet has no data rows / Sheet không có dữ liệu'); process.exit(1); }

    const header = rows[0];
    if (String(header[1] || '').trim().toLowerCase() !== 'full_name') {
        console.warn(`Warning / Cảnh báo: unexpected header (col B = "${header[1]}"), expected "full_name"`);
    }

    const members = rows.slice(1)
        .filter((r) => r.some((cell) => cell !== '' && cell !== null && cell !== undefined))
        .map((r) => ({
            id: String(r[0] ?? ''),
            fullName: String(r[1] ?? ''),
            name: String(r[2] ?? ''),
            nickName: String(r[3] ?? ''),
            position: String(r[4] ?? ''),
            group: String(r[5] ?? ''),
            year: String(r[6] ?? ''),
            note: String(r[7] ?? ''),
            img: String(r[8] ?? ''),
            sortOrder: Number(r[9]) || 0,
        }));

    if (members.length === 0) {
        console.error('No members found - aborting to avoid writing empty data / Không có thành viên - dừng để tránh ghi dữ liệu rỗng');
        process.exit(1);
    }

    // 4. Write JSON / Ghi JSON
    const out = {
        generatedAt: new Date().toISOString().slice(0, 10),
        source: 'data.xlsx',
        count: members.length,
        members,
    };
    fs.writeFileSync(JSON_PATH, JSON.stringify(out, null, 2) + '\n', 'utf8');

    // 5. Summary / Tổng kết
    const years = {};
    members.forEach((m) => { const y = m.year || 'Không rõ'; years[y] = (years[y] || 0) + 1; });
    console.log(`OK: ${members.length} members -> public/data.json`);
    console.log('Per year / Theo năm:', JSON.stringify(years));
})();
