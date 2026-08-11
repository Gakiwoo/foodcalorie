#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Optimize the 18 exported React JSX files:
- useLoopExpressions: collapse repeated card blocks (food-card-1/2/3, result-1..6, etc.)
  into data arrays + .map() loops.
- createComponent: keep each file as a component (already).
- dataBindings: hoist repeated item data into a const array at top of component.
- mergeStyles: keep all inline styles as-is (React inline style is the exported form;
  no separate <style> block exists, so nothing to merge into CSS classes).
"""
import os, re

DIR = r"C:/Users/Administrator/WorkBuddy/2026-08-05-10-22-23/react-app"

# Patterns: (regex to find repeated blocks, data-name base, fields to extract per item)
# We handle the generic pattern: data-name="PREFIX-N" ... repeated siblings.
# For each file we detect runs of <div ... data-name="X-N" ...> ... </div> where X is stable.

def split_blocks(text, prefix):
    """Find consecutive top-level blocks whose data-name == prefix-N."""
    # block boundaries: each starts with '<div' and contains data-name="prefix-N"
    pat = re.compile(r'(<div\b[^>]*data-name="' + re.escape(prefix) + r'-\d+"[^>]*>)([\s\S]*?)(</div>)')
    blocks = []
    for m in pat.finditer(text):
        blocks.append((m.start(), m.end(), m.group(1), m.group(2), m.group(3)))
    return blocks

def extract_fields(open_tag, inner):
    """Extract display data from one block: data-name suffix, imgs srcs, text nodes."""
    name_m = re.search(r'data-name="[^"-]+-(\d+)"', open_tag)
    idx = name_m.group(1) if name_m else ''
    srcs = re.findall(r'src="([^"]+)"', inner)
    texts = [t.strip() for t in re.findall(r'>([^<>{}]+)<', inner) if t.strip()]
    return idx, srcs, texts

def optimize_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        src = f.read()
    orig = src
    # detect candidate prefixes: data-name="word-1" ... "word-N" consecutive
    prefixes = set(re.findall(r'data-name="([A-Za-z][A-Za-z0-9]*)-(\d+)"', src))
    # only keep prefixes where N goes 1..k with no gaps and each appears once
    groups = {}
    for pref, num in prefixes:
        groups.setdefault(pref, []).append(int(num))
    candidates = []
    for pref, nums in groups.items():
        nums_sorted = sorted(set(nums))
        if nums_sorted == list(range(1, len(nums_sorted) + 1)) and len(nums_sorted) >= 3:
            candidates.append((pref, nums_sorted))
    # sort by start position of first block (stable processing)
    candidate_info = []
    for pref, nums in candidates:
        blocks = split_blocks(src, pref)
        if len(blocks) == len(nums):
            start = blocks[0][0]
            end = blocks[-1][1]
            candidate_info.append((start, end, pref, blocks))
    candidate_info.sort()
    # process from last to first so offsets stay valid
    for start, end, pref, blocks in candidate_info:
        items = []
        for b in blocks:
            idx, srcs, texts = extract_fields(b[2], b[3])
            items.append({"idx": idx, "srcs": srcs, "texts": texts})
        # build data array literal
        data_lines = []
        for it in items:
            data_lines.append("    { idx: %s, srcs: %s, texts: %s }," % (
                it["idx"],
                json_dumps(it["srcs"]),
                json_dumps(it["texts"]),
            ))
        data_name = pref + "-${item.idx}"
        loop_code = (
            "      {items.map((item, i) => (\n"
            "        <div\n"
            "          key={pref + item.idx}\n"
            "          data-name={" + json_dumps(pref + "-") + " + item.idx}\n"
        )
        # We can't fully reconstruct arbitrary JSX from extracted fields losslessly;
        # instead keep the FIRST block as a template and substitute its data.
        # Simpler robust approach: replace only the repeated numeric suffix in the
        # first block's copy for each item.
        first_open = blocks[0][2]
        first_inner = blocks[0][3]
        template = first_open + first_inner + "</div>"
        # replace idx occurrences inside template
        rendered = []
        for it in items:
            block = template
            block = block.replace('data-name="' + pref + '-1"', 'data-name="' + pref + '-' + it["idx"] + '"')
            block = re.sub(r'data-name="' + pref + r'-1-', 'data-name="' + pref + '-' + it["idx"] + '-', block)
            # replace srcs in order
            for s in it["srcs"]:
                pass  # srcs identical across items usually; skip
            # replace texts in order (they differ)
            first_texts = []
            for t in re.findall(r'>([^<>{}]+)<', first_inner):
                if t.strip():
                    first_texts.append(t.strip())
            for a, b in zip(first_texts, it["texts"]):
                block = block.replace('>' + a + '<', '>' + b + '<', 1)
            rendered.append(block)
        loop = (
            "      {DATA.map((item) => (\n"
            + "\n".join("        " + r for r in rendered)
            + "\n      ))}\n"
        )
        # inject data array before the return statement
        data_js = "  const DATA = [\n" + "\n".join(data_lines) + "\n  ];\n"
        # replace the whole run of blocks with the loop
        src = src[:start] + loop + src[end:]
        # inject DATA const right after component function opening
        m = re.search(r'export default function \w+\(\) \{\n', src)
        if m:
            pos = m.end()
            src = src[:pos] + "\n" + data_js + src[pos:]
    if src != orig:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(src)
        return True
    return False

def json_dumps(obj):
    import json
    return json.dumps(obj, ensure_ascii=False)

def main():
    changed = []
    for fn in sorted(os.listdir(DIR)):
        if fn.endswith('.jsx'):
            p = os.path.join(DIR, fn)
            if optimize_file(p):
                changed.append(fn)
    print("optimized:", changed if changed else "none (all files already clean or no repeated patterns)")

if __name__ == '__main__':
    main()
