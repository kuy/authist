# Authist

Automatic 2FA/MFA assistant with OCR your smartphone.

## What's this?

Authist is a Chrome extension that recognizes an authentication code shown
in the authenticator app of your smartphone via web camera and inputs it instead of you.

_NOTE: Supported only **Authy Authenticator + macOS + Google Chrome**_

## Install

Unfortunately, no friendly installer yet. Please follow [instructions to install](https://github.com/kuy/authist/blob/master/docs/INSTALL.md).

## Usage

1. Proceed to a step of two-factor authentication
2. Click "Allow" to permit using FaceTime camera when Chrome ask
3. Open the authenticator app in your smartphone and turn the screen toward FaceTime camera
4. Done!

## Supported services

- Google
- Amazon Web Service
- GitHub
- Twitter
- Instagram (coming soon)
- Amazon.co.jp
- bitFlyer (coming soon)
- Coincheck
- _Lots of missing services... PRs are welcome! :)_

## Extra features

- Scan code anywhere and copy to clipboard (WIP)

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

## License

MIT

## Author

Yuki Kodama / [@kuy](https://twitter.com/kuy)
