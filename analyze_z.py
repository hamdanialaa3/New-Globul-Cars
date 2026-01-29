#!/usr/bin/env python
# -*- coding: utf-8 -*-
import csv
from collections import defaultdict
import os

csv_file = r'c:\Users\hamda\Desktop\New Globul Cars\z.csv'

rows = []
file_extensions = defaultdict(lambda: {'count': 0, 'size': 0})

print("\nReading CSV file...")
with open(csv_file, encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        try:
            rows.append({
                'path': row['Name'],
                'files': int(row['Files']),
                'folders': int(row['Folders']),
                'physical_size': int(row['Physical Size'])
            })
            
            # Extract file extension from path
            filename = os.path.basename(row['Name'])
            if '.' in filename:
                ext = filename.split('.')[-1].lower()
                file_extensions[ext]['count'] += 1
                file_extensions[ext]['size'] += int(row['Physical Size'])
        except Exception as e:
            pass

# Top 10 largest folders
print("\n" + "="*80)
print("TOP 10 LARGEST FOLDERS")
print("="*80)
sorted_rows = sorted([r for r in rows if r['folders'] > 0], key=lambda x: x['physical_size'], reverse=True)

for i, row in enumerate(sorted_rows[:10], 1):
    size_gb = row['physical_size'] / (1024.0**3)
    size_mb = row['physical_size'] / (1024.0**2)
    path = row['path'].replace(r'c:\Users\hamda\Desktop\New Globul Cars\\', '').replace(r'c:\Users\hamda\Desktop\New Globul Cars', 'ROOT')
    if not path or path == '':
        path = 'ROOT (Main Project)'
    print(f"\n{i}) {path}")
    print(f"   Size: {size_gb:.2f} GB ({size_mb:.0f} MB)")
    print(f"   Files: {row['files']:,} | Folders: {row['folders']:,}")

# Top 15 file extensions by size
print("\n" + "="*80)
print("TOP 15 FILE TYPES BY SIZE")
print("="*80)
sorted_ext = sorted(file_extensions.items(), key=lambda x: x[1]['size'], reverse=True)

total_size = sum(ext[1]['size'] for ext in sorted_ext)
for i, (ext, data) in enumerate(sorted_ext[:15], 1):
    size_gb = data['size'] / (1024.0**3)
    size_mb = data['size'] / (1024.0**2)
    percentage = (data['size'] / total_size * 100) if total_size > 0 else 0
    ext_display = ext if ext else '[NO EXTENSION]'
    print(f"\n{i}) .{ext_display}")
    print(f"   Size: {size_gb:.2f} GB ({size_mb:.0f} MB) - {percentage:.1f}% of total")
    print(f"   Files: {data['count']:,}")

print("\n" + "="*80)
print(f"SUMMARY: Total size: {total_size / (1024.0**3):.2f} GB | Total files tracked: {len([r for r in rows if r['files'] > 0])}")
print("="*80)
