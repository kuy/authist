mod extension;
mod ocr;
mod preprocess;

use anyhow::Result;
use base64;
use extension::Message;
use log::*;
use simplelog::{Config, LevelFilter, SimpleLogger, WriteLogger};

fn main() -> Result<()> {
    setup_logger()?;
    debug!("Started");

    loop {
        debug!("Ready: waiting for message from STDIN...");
        let payload = match extension::receive()? {
            Message::Payload { payload } => {
                trace!("Message: body={}", payload);
                payload
            }
            _ => continue,
        };
        let png = base64::decode(&payload)?;

        let img = preprocess::normalize(&png);
        let raw = ocr::scan(img).expect("Failed to recognize code");
        debug!("OCR: raw={}", raw);

        let msg = match ocr::sanitize(&raw) {
            Ok(code) => Message::Payload { payload: code },
            Err(_) => Message::Error {
                error: "scan".into(),
            },
        };
        extension::send(&msg)?;
        debug!("Done: res={:?}", msg);
    }
}

fn setup_logger() -> Result<()> {
    if cfg!(debug_assertions) {
        let file = std::fs::File::create("./process.log")?;
        WriteLogger::init(LevelFilter::Debug, Config::default(), file)?;
    } else {
        SimpleLogger::init(LevelFilter::Off, Config::default())?;
    }
    Ok(())
}
