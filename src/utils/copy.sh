#!/bin/sh
cd /Users/Administrator/Desktop/blog-pro/logs
cp access.log $(data +%Y-%m-%d-%H).access.log
echo "" > access.log