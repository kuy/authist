use leptess::LepTess;

pub fn scan() -> Result<String, std::str::Utf8Error> {
    let mut lt = LepTess::new(None, "eng").unwrap();
    lt.set_image("/Users/kuy/Work/au2far-ocr/process/bnw.png");
    lt.get_utf8_text()
}
