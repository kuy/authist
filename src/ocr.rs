use anyhow::{anyhow, Context, Result};
use leptess::capi::pixReadMemPng;
use leptess::leptonica;
use leptess::tesseract::TessApi;

pub fn scan(img: image::GrayImage) -> Result<String> {
    // Export image as PNG format to in-memory buffer
    let mut buf = vec![];
    let enc = image::png::PNGEncoder::new(&mut buf);
    let w = img.width();
    let h = img.height();
    enc.encode(img.into_raw().as_slice(), w, h, image::ColorType::Gray(8))
        .with_context(|| "Failed to encode PNG in-memory")?;

    // Load image as PIX representation from in-memory buffer
    let ptr = buf.as_ptr();
    let raw = unsafe { pixReadMemPng(ptr, buf.len()) };
    if raw.is_null() {
        Err(anyhow!("Failed to load PNG from buffer"))
    } else {
        // Run OCR
        let pix = leptonica::Pix { raw };
        let mut api = TessApi::new(None, "eng").unwrap();
        api.set_image(&pix);
        let text = api.get_utf8_text()?;
        Ok(text)
    }
}
