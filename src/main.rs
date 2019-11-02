mod ocr;
mod preprocess;

use base64;
use log::*;
use serde::{Deserialize, Serialize};
use serde_json::{from_str, to_string};
use simplelog::{Config, LevelFilter, SimpleLogger, WriteLogger};
use std::convert::TryInto;
use std::error::Error;
use std::io::{self, Read, Write};

#[derive(Serialize, Deserialize, Debug)]
struct Message {
    payload: String,
}

#[derive(Serialize, Debug)]
struct ErrorRes {
    error: String,
}

fn main() -> Result<(), Box<dyn Error>> {
    if cfg!(debug_assertions) {
        let file = std::fs::File::create("./process.log")?;
        WriteLogger::init(LevelFilter::Debug, Config::default(), file)?;
        debug!("Started");
    } else {
        SimpleLogger::init(LevelFilter::Off, Config::default())?;
    }

    loop {
        debug!("Ready: waiting for message from STDIN...");

        // Parse message length (first 4 bytes)
        let handle = io::stdin().take(4);
        let bytes: Vec<u8> = handle.bytes().map(|i| i.unwrap()).collect();
        let size = u32::from_le_bytes(bytes.as_slice().try_into().unwrap());
        debug!("Message: size={}", size);

        // Read payload and decode PNG
        let mut buf = String::new();
        let mut handle = io::stdin().take(size as u64);
        let len = handle.read_to_string(&mut buf)?;
        // TODO: check expected length and received length
        debug!("Message: received={}", len);
        let message: Message = from_str(&buf)?;
        trace!("Message: body={}", message.payload);
        let png = base64::decode(&message.payload)?;

        // Preprocessing and OCR
        let img = preprocess::normalize(&png);
        let raw = ocr::scan(img).expect("Failed to recognize code");
        debug!("OCR: raw={}", raw);

        let res = match ocr::sanitize(&raw) {
            Ok(code) => to_string(&Message { payload: code }),
            Err(_) => to_string(&ErrorRes {
                error: "scan".into(),
            }),
        }?;

        // Send response
        io::stdout().write_all(&u32::to_le_bytes(res.len() as u32))?;
        write!(io::stdout(), "{}", res)?;
        io::stdout().flush()?;

        debug!("Done: res={}", res);
    }
}
