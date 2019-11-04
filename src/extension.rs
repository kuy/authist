use anyhow::Result;
use log::*;
use serde::{Deserialize, Serialize};
use serde_json;
use std::convert::TryInto;
use std::io::{self, Read, Write};

#[derive(Serialize, Deserialize, Debug)]
#[serde(untagged)]
pub enum Message {
    Payload { payload: String },
    Error { error: String },
}

pub fn receive() -> Result<Message> {
    // Parse message length (first 4 bytes)
    let handle = io::stdin().take(4);
    let bytes: Vec<u8> = handle.bytes().map(|i| i.unwrap()).collect();
    let size = u32::from_le_bytes(bytes.as_slice().try_into().unwrap());
    debug!("size={}", size);

    // Read payload and decode PNG
    let mut buf = String::new();
    let mut handle = io::stdin().take(size as u64);
    let len = handle.read_to_string(&mut buf)?;
    // TODO: check expected length and received length
    debug!("received={}", len);
    let message: Message = serde_json::from_str(&buf)?;

    if cfg!(feature = "trace") {
        let dir = std::path::Path::new("./process");
        std::fs::create_dir_all(dir).expect("create dir");
        let path = dir.join("payload");
        let mut file = std::fs::File::create(path).expect("create file");
        file.write_all(&u32::to_le_bytes(size))?;
        write!(file, "{}", buf)?;
        file.flush()?;
    }

    Ok(message)
}

pub fn send(msg: &Message) -> Result<()> {
    let data = serde_json::to_string(msg)?;
    io::stdout().write_all(&u32::to_le_bytes(data.len() as u32))?;
    write!(io::stdout(), "{}", data)?;
    io::stdout().flush()?;
    Ok(())
}
