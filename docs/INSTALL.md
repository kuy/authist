## Install

### System requirements

- Authy 24.0.0 or later
- macOS Mojave 10.14 or Catalina 10.15
  - with Homebrew (`brew`) and `curl`
- Google Chrome 77 or later

### 1. Install required libraries

```
brew install tesseract leptonica
```

### 2. Install native app

Run command below:

```
curl -sSf https://raw.githubusercontent.com/kuy/authist/master/install.sh | sh
```

or [manual installation](#manual-installation).

### 3. Install Chrome extension

1. Download latest extension file (`authist-x.x.x.crx`) from [releases page](https://github.com/kuy/authist/releases)
2. Open "Extensions" page in your Chrome browser (Menu: `Window` > `Extensions`)
3. Drag and drop the extension file into Chrome window
4. Click "Add extension" button to install the extension

#### Troubleshooting: Gatekeeper

Get errors from Gatekeeper? Allow it in `Security & Privacy` > `General`.

### 4. Test your installation

1. Go to [https://rust-lang.org](https://rust-lang.org)
2. Chrome asks to use FaceTime camera. Allow it
3. Authist starts scanning. Open Authy in your smartphone
4. Turn your smartphone to FaceTime camera
5. Authist detects a code and shows you it!

_NOTE: [Rust](https://rust-lang.org) website is just an example. No relation with this application, of course._

![install-result](https://raw.githubusercontent.com/kuy/authist/master/docs/assets/result.png)

## Manual installation

See https://github.com/kuy/authist/blob/master/install.sh

## Uninstall

1. Uninstall Chrome extension
2. Delete `~/.authist` directory
3. Delete `~/Library/Application Support/Google/Chrome/NativeMessagingHosts/net.endflow.authist.json`
