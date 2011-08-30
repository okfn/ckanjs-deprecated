#!/bin/bash
#
# this is the make script
# it requires installation of node.js with the following
# modules installed:
#
# - jshint, for checking the js syntax
# - uglify-js, for js minification
# - markdown-js, for translation of readme.md to index.html
#
# Usage: 
# just run ./make and be happy
#

set -e
BUILD=build
OUTFILE=$BUILD/ckanjs.js
MINFILE=$BUILD/ckanjs.min.js

echo "Checking JS files"
while read LINE
do
    echo Skipping $LINE
    # jshint $LINE
done < manifest

echo "Combining JS files"
DATE=`date +%s`
TMP=tmp_$DATE
TMPFILE=$TMP/tmp.js
mkdir $TMP
touch $TMPFILE

while read LINE
do
    cat $LINE >> $TMPFILE
done < manifest

mkdir -p $BUILD
cp $TMPFILE $OUTFILE

echo "Compressing JS files"
uglifyjs -o $MINFILE $TMPFILE

# remove temporary folder
rm -Rf $TMP

