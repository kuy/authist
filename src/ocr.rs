use leptess::capi::pixReadMemPng;
use leptess::leptonica;
use leptess::tesseract::TessApi;
use std::fs::File;
use std::io::Write;

pub fn scan(img: image::GrayImage) -> Result<String, std::str::Utf8Error> {
    let mut buf = vec![];
    let enc = image::png::PNGEncoder::new(&mut buf);
    let w = img.width();
    let h = img.height();
    if enc
        .encode(img.into_raw().as_slice(), w, h, image::ColorType::Gray(8))
        .is_ok()
    {
        let mut file = File::create("/Users/kuy/Work/au2far-ocr/encode.txt")
            .expect("Failed to create log file");
        write!(file, "encoded=true").expect("Failed to write log file");
    } else {
        panic!("panic on encoding");
    }

    let ptr = buf.as_ptr();
    let raw = unsafe { pixReadMemPng(ptr, buf.len()) };
    if raw.is_null() {
        let mut file = File::create("/Users/kuy/Work/au2far-ocr/unsafe.txt")
            .expect("Failed to create log file");
        write!(file, "raw.is_null=true").expect("Failed to write log file");
    }

    let pix = leptonica::Pix { raw };

    let mut api = TessApi::new(None, "eng").unwrap();
    api.set_image(&pix);
    api.get_utf8_text()
}
