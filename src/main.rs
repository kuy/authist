mod imageutil;
mod ocr;

use base64::decode;
use regex::Regex;
use serde::{Deserialize, Serialize};
use std::convert::TryInto;
use std::error::Error;
use std::fs::File;
use std::io::{self, Read, Write};

#[derive(Serialize, Deserialize, Debug)]
struct Message {
    payload: String,
}

#[derive(Serialize, Debug)]
struct ErrorResponse {
    error: String,
}

fn main() -> Result<(), Box<dyn Error>> {
    loop {
        // Check length of message (first 4 bytes)
        let handle = io::stdin().take(4);
        let bytes: Vec<u8> = handle.bytes().map(|i| i.unwrap()).collect();
        let size = u32::from_le_bytes(bytes.as_slice().try_into().unwrap());

        // Receive message body
        let mut buf = String::new();
        let mut handle = io::stdin().take(size as u64);
        let len = handle.read_to_string(&mut buf)?;

        let message: Message = serde_json::from_str(&buf)?;

        let mut file = File::create("/Users/kuy/Work/au2far-ocr/output.txt")?;
        write!(file, "size={}\nread={}", size, len)?;
        file.flush()?;

        let png = decode(&message.payload)?;

        // Normalize image
        imageutil::normalize(&png);

        // Scan code
        let code = ocr::scan().expect("Failed to recognize code");

        let mut file = File::create("/Users/kuy/Work/au2far-ocr/ocr.txt")?;
        write!(file, "raw={}\n", code)?;
        file.flush()?;

        // Sanitize result
        let re = Regex::new(r"[\d\s]{6,}").unwrap();
        let res = match re.find(&code) {
            Some(code) => {
                let raw = String::from(code.as_str());
                let re = Regex::new(r"[^\d]").unwrap();
                let code = String::from(re.replace_all(&raw, ""));
                serde_json::to_string(&Message { payload: code }).unwrap()
            }
            None => serde_json::to_string(&ErrorResponse {
                error: "scan".into(),
            })
            .unwrap(),
        };

        write!(file, "code={}\n", res)?;
        file.flush()?;

        // Send response
        io::stdout().write_all(&u32::to_le_bytes(res.len() as u32))?;
        write!(io::stdout(), "{}", res)?;
        io::stdout().flush()?;
    }
}
