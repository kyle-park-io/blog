#!/bin/sh

cd /blog || exit 1

mkdir -p sort

output_file="sort/sorted_md_files.txt"
output_10_file="sort/sorted_md_10_files.txt"

echo "[" >$output_file
git ls-files md | while read file; do
    last_commit_date=$(git log -1 --format="%ci" -- $file)
    filename=$(basename "$file")
    title=$(head -n 1 "$file")
    title=$(echo "$title" | cut -c 3-)
    echo "$last_commit_date|$filename|$title"
done | sort -r | while IFS="|" read -r sorted_date sorted_filename sorted_title; do
    echo "{\"filename\": \"$sorted_filename\", \"title\": \"$sorted_title\", \"date\": \"$sorted_date\"}," >>"$output_file"
done
sed -i '$ s/,$//' $output_file
echo "]" >>$output_file

echo "[" >$output_10_file
git ls-files md | while read file; do
    last_commit_date=$(git log -1 --format="%ci" -- $file)
    filename=$(basename "$file")
    title=$(head -n 1 "$file")
    title=$(echo "$title" | cut -c 3-)
    echo "$last_commit_date|$filename|$title"
done | sort -r | head -n 10 | while IFS="|" read -r sorted_date sorted_filename sorted_title; do
    echo "{\"filename\": \"$sorted_filename\", \"title\": \"$sorted_title\", \"date\": \"$sorted_date\"}," >>"$output_10_file"
done
sed -i '$ s/,$//' $output_10_file
echo "]" >>$output_10_file

cp -r sort /usr/src/app
