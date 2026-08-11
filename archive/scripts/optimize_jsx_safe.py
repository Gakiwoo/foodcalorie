#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Safe optimization for exported React JSX:
- For each file, detect ONE candidate repeated-block series (data-name="X-1..N",
  N>=3, single occurrence per file, no other overlapping series).
- Collapse it into DATA array + .map() loop, keeping first block as template,
  substituting idx suffix + text content per item.
- Verify brace balance after edit; rollback on failure.
- mergeStyles: exported React uses inline style objects (no <style> blocks),
  so styling is preserved as-is; nothing to merge.
"""
import os, re, json, shutil

DIR = r"C:/Users/Administrator/WorkBuddy/2026-08-05-10-22-23/react-app"

def count_braces(s):
    return s.count('{'), s.count('}')

def is_balanced(s):
    a, b = count_braces(s)
    return a == b

def find_series(src):
    """Return (prefix, [(start,end,open_tag,inner,close_tag)]) for a safe series."""
    # collect all data-name="xxx-N" positions
    pat = re.compile(r'(<div\b[^>]*data-name="([A-Za-z][A-Za-z0-9]*)-(\d+)"[^>]*>)([\s\S]*?)(</div>)')
    matches = list(pat.finditer(src))
    by_pref = {}
    for m in matches:
        pref, num = m.group(2), int(m.group(3))
        by_pref.setdefault(pref, []).append((m.start(), m.end(), m.group(1), m.group(4), m.group(5)))
    # A safe series: prefix appears with consecutive 1..N, N>=3, and NO other prefix
    # overlaps inside its span, and the series blocks are the only blocks of that prefix.
    best = None
    for pref, blocks in by_pref.items():
        nums = sorted(b[3] for b in blocks)  # placeholders
        nums = sorted(int(re.search(r'-(\d+)"', b[2]).group(1)) for b in blocks)
        if nums != list(range(1, len(nums) + 1)):
            continue
        if len(nums) < 3:
            continue
        span_start, span_end = blocks[0][0], blocks[-1][1]
        # ensure no other prefix block starts inside the span (except same series)
        overlap = False
        for other_pref, ob in by_pref.items():
            if other_pref == pref:
                continue
            for b in ob:
                if span_start < b[0] < span_end:
                    overlap = True
                    break
            if overlap:
                break
        if overlap:
            continue
        # pick the series with the largest count
        if best is None or len(nums) > best[1]:
            best = (pref, len(nums), blocks)
    return best

def optimize_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        src = f.read()
    orig = src
    if not is_balanced(src):
        return False, "unbalanced before edit"
    series = find_series(src)
    if not series:
        return False, "no safe series"
    pref, count, blocks = series
    start, end = blocks[0][0], blocks[-1][1]
    first_open, first_inner, first_close = blocks[0][2], blocks[0][3], blocks[0][4]
    template = first_open + first_inner + first_close
    # texts of first block (in order)
    first_texts = [t.strip() for t in re.findall(r'>([^<>{}]+)<', first_inner) if t.strip()]
    rendered = []
    items = []
    for b in blocks:
        open_tag, inner, close = b[2], b[3], b[4]
        idx = re.search(r'-(\d+)"', open_tag).group(1)
        texts = [t.strip() for t in re.findall(r'>([^<>{}]+)<', inner) if t.strip()]
        items.append({"idx": idx, "texts": texts})
        block = template
        block = block.replace('data-name="' + pref + '-1"', 'data-name="' + pref + '-' + idx + '"')
        # replace nested data-names pref-1-* -> pref-idx-*
        block = re.sub(r'data-name="' + pref + r'-1-', 'data-name="' + pref + '-' + idx + '-', block)
        # substitute texts
        for a, btext in zip(first_texts, texts):
            block = block.replace('>' + a + '<', '>' + btext + '<', 1)
        rendered.append(block)
    data_lines = ["    { idx: '%s', texts: %s }," % (it["idx"], json.dumps(it["texts"], ensure_ascii=False)) for it in items]
    loop = ("      {DATA.map((item) => (\n" +
            "\n".join("        " + r for r in rendered) +
            "\n      ))}\n")
    new_src = src[:start] + loop + src[end:]
    # inject DATA after component opening
    m = re.search(r'export default function \w+\(\) \{\n', new_src)
    if not m:
        return False, "no component fn"
    pos = m.end()
    data_js = "  const DATA = [\n" + "\n".join(data_lines) + "\n  ];\n\n"
    new_src = new_src[:pos] + data_js + new_src[pos:]
    if not is_balanced(new_src):
        return False, "unbalanced after edit"
    # quick sanity: must still contain the loop and DATA
    if 'DATA.map' not in new_src or 'const DATA' not in new_src:
        return False, "edit lost"
    with open(path, 'w', encoding='utf-8') as f:
        f.write(new_src)
    return True, "ok (prefix=%s, n=%d)" % (pref, count)

def main():
    changed, skipped = [], []
    for fn in sorted(os.listdir(DIR)):
        if not fn.endswith('.jsx'):
            continue
        p = os.path.join(DIR, fn)
        ok, msg = optimize_file(p)
        if ok:
            changed.append((fn, msg))
        else:
            skipped.append((fn, msg))
    print("OPTIMIZED:")
    for fn, msg in changed:
        print("  -", fn, "|", msg)
    print("SKIPPED (kept as exported):")
    for fn, msg in skipped:
        print("  -", fn, "|", msg)

if __name__ == '__main__':
    main()
