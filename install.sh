#!/bin/bash

CHROME=~/Library/Application\ Support/Google/Chrome
if [[ ! -d $CHROME  ]]; then
  echo "ERROR: Chrome directory not found"
  exit 1
fi

echo "Download latest release..."
TEMP=$(mktemp -d)
DIST_URL="https://github.com/kuy/authist/releases/download/v0.0.0/authist-dist-darwin.zip"
echo "TEMP=$TEMP"
curl --silent -L -o "$TEMP/authist-dist.zip" "$DIST_URL"
if [[ $? != 0 ]]; then
  echo "ERROR: Failed to download archive"
  exit 1
fi

echo "Extract downloaded archive..."
unzip -q -d "$TEMP" "$TEMP/authist-dist.zip"
if [[ $? != 0 ]]; then
  echo "ERROR: Failed to extract files from archive"
  exit 1
fi

echo "Install native app..."
APP_NAME="authist"
APP_DEST="$HOME/.authist"
if [[ ! -d $APP_DEST ]]; then
  echo "Create '.authist' directory"
  mkdir -p "$APP_DEST"
fi

mv -f "$TEMP/dist/$APP_NAME" "$APP_DEST/$APP_NAME"
chmod a+x "$APP_DEST/$APP_NAME"

echo "Install manifest file..."
MANIFEST_NAME="net.endflow.authist.json"
MANIFEST_DEST="$CHROME/NativeMessagingHosts"
if [[ ! -d $MANIFEST_DEST ]]; then
  echo "Create 'NativeMessagingHosts' directory"
  mkdir -p "$MANIFEST_DEST"
fi
mv -f "$TEMP/dist/$MANIFEST_NAME" "$MANIFEST_DEST/$MANIFEST_NAME"
LOGIN_USER=$(echo $USER)
sed -i '' "s/##USERNAME##/${LOGIN_USER}/" "$MANIFEST_DEST/$MANIFEST_NAME"

echo "Done"
