#!/bin/sh

mkdir -p sort

output_file="sort/sorted_md_files.txt"
output_10_file="sort/sorted_md_10_files.txt"

echo "[" >$output_file

git ls-files md | while read file; do
    last_commit_date=$(git log -1 --format="%ci" -- $file)
    filename=$(basename "$file")
    echo "$last_commit_date $filename"
done | sort -r | awk '{print "\""$4"\","}' >>$output_file

echo "]" >>$output_file

echo "[" >$output_10_file

git ls-files md | while read file; do
    last_commit_date=$(git log -1 --format="%ci" -- $file)
    filename=$(basename "$file")
    echo "$last_commit_date $filename"
done | sort -r | head -n 10 | awk '{print "\""$4"\","}' >>$output_10_file

echo "]" >>$output_10_file

cp -r sort /usr/src/app
