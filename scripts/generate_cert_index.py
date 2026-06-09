#!/usr/bin/env python3
import os
import json

ROOT = os.path.dirname(os.path.dirname(__file__))
CERT_DIR = os.path.join(ROOT, 'Certificates')
OUT_FILE = os.path.join(CERT_DIR, 'index.json')

def is_asset(fname):
    low = fname.lower()
    return any(low.endswith(ext) for ext in ('.html', '.pdf', '.png', '.jpg', '.jpeg', '.svg'))

def title_from_name(name):
    base = os.path.splitext(name)[0]
    return base.replace('_', ' ').replace('-', ' ').title()

def main():
    if not os.path.isdir(CERT_DIR):
        print('Certificates directory not found:', CERT_DIR)
        return

    items = []
    for fname in sorted(os.listdir(CERT_DIR)):
        if fname.startswith('.'):
            continue
        if is_asset(fname):
            items.append({
                'src': os.path.join('Certificates', fname).replace('\\', '/'),
                'title': title_from_name(fname)
            })

    with open(OUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(items, f, indent=2)

    print('Wrote', OUT_FILE)

if __name__ == '__main__':
    main()
