# Authist

## Development

### Native App

#### Requirements

- [Rust toolchain](https://www.rust-lang.org/tools/install) `1.38.0` or later
- [tesseract](https://github.com/tesseract-ocr/tesseract)
  - `brew install tesseract`
- [leptonica](https://github.com/DanBloomberg/leptonica)
  - `brew install leptonica`
- [LLVM](https://llvm.org/)
  - `brew install llvm`

_...Did you found missing deps? Tell me or send me PR :)_

#### Build

To build debug binary, just run:

```
cargo build
```

To see the process of normalization, use `trace` feature flag:

```
cargo build --features "trace"
```

### Chrome Extension

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
