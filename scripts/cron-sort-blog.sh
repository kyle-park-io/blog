#!/bin/sh

mkdir -p sort

output_file="sort/sorted_md_files.txt"

echo "[" >$output_file

git ls-files md | while read file; do
    last_commit_date=$(git log -1 --format="%ci" -- $file)
    filename=$(basename "$file")
    echo "$last_commit_date $filename"
done | sort | awk '{print "\""$4"\","}' >>$output_file

echo "]" >>$output_file

cp -r sort /usr/src/app
