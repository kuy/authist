# Authist

Automatic 2FA/MFA assistant with OCR your smartphone.

## What's this?

Authist is a Chrome extension that recognizes an authentication code shown
in the authenticator app of your smartphone via web camera and inputs it instead of you.

_NOTE: Supported only_ **Authy Authenticator + macOS + Google Chrome**

## Install

See [instructions to install](https://github.com/kuy/authist/blob/master/docs/INSTALL.md).

## Usage

### Basic

1. Proceed to a step of two-factor authentication
2. Click "Allow" to permit using FaceTime camera when Chrome ask
3. Open the authenticator app in your smartphone and turn the screen toward FaceTime camera
4. Done!

### Advanced

Start scanner anywhere by clicking Authist toolbar button.
The recognized code will be copied in clipboard.

## Supported services

- Google
- Amazon Web Service
- GitHub
- Twitter
- Instagram (coming soon)
- Amazon.co.jp
- bitFlyer
- Coincheck
- _Lots of missing services... PRs are welcome! :)_

## Extra features

- Scan anywhere and input focused text field (WIP)

## Options

- Hide camera preview (coming soon)

## Development

### Native app

#### Requirements

- [Rust toolchain](https://www.rust-lang.org/tools/install) `1.38.0` or later
- [tesseract](https://github.com/tesseract-ocr/tesseract)
  - `brew install tesseract`
- [leptonica](https://github.com/DanBloomberg/leptonica)
  - `brew install leptonica`
- [LLVM](https://llvm.org/)
  - `brew install llvm`

#### Build

To build debug binary, just run:

```
cargo build
```

To see the process of normalization, use `trace` feature flag:

```
cargo build --features "trace"
```

### Chrome extension

#### Requirements

- [PAX](https://github.com/nathan/pax)
  - `cargo install pax`

#### Build

```
px src/main.js dist/bundle.js -w
```

### Release steps

1. Bump version `Cargo.toml`
2. Build native app with release flag `cargo build --release`
3. Create zip archive `zip -j authist-x86_64-apple-darwin.zip target/release/authist crx/net.endflow.authist.json`
4. Bump `VERSION` in `install.sh` with a new version
5. Bump version `crx/manifest.json`
6. Build JavaScript `cd crx && px src/main.js dist/bundle.js && cd ..`
7. Pack extension with Chrome and rename it to `authist-x.x.x.crx`
8. Commit changes, tag with `vx.x.x`, and push to github
9. Upload `authist-x86_64-apple-darwin.zip` and `authist-x.x.x.crx` into a new release on github
10. Write release note and publish

## License

MIT

## Author

Yuki Kodama / [@kuy](https://twitter.com/kuy)
