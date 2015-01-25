#!/usr/bin/env bash
DIRECTORY="/Applications/nwjs.app"
TARGET="build/sketchfab-uploader.app"

if [ -d "$DIRECTORY" ]; then
    rm -rf "$TARGET"
    cp -r "$DIRECTORY" "$TARGET"
    cat build.txt | xargs -I % cp -R % "$TARGET/Contents/Resources/app.nw/"
    cp assets/icon.icns "$TARGET/Contents/Resources/nw.icns"
else
    echo "Runtime $DIRECTORY can not be found"
fi
