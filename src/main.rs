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
        write!(
            file,
            "size={}\nread={}\ndata={}",
            size, len, message.payload
        )?;
        file.flush()?;

        // Send response
        let res = "{\"payload\":\"123456\"}";
        io::stdout().write_all(&u32::to_le_bytes(res.len() as u32))?;
        write!(io::stdout(), "{}", res)?;
        io::stdout().flush()?;
    }
}
