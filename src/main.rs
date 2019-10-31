use std::convert::TryInto;
use std::error::Error;
use std::fs::File;
use std::io::{self, Read, Write};

fn main() -> Result<(), Box<dyn Error>> {
    loop {
        // Check length of message (first 4 bytes)
        let handle = io::stdin().take(4);
        let bytes: Vec<u8> = handle.bytes().map(|i| i.unwrap()).collect();
        let size = u32::from_le_bytes(bytes.as_slice().try_into().unwrap());

        let mut file = File::create("/Users/kuy/Work/au2far-ocr/size.txt")?;
        write!(file, "SIZE: {}", size)?;
        file.flush()?;

        // Receive message body
        let mut buf = String::new();
        let mut handle = io::stdin().take(size as u64);
        handle.read_to_string(&mut buf)?;

        let mut file = File::create("/Users/kuy/Work/au2far-ocr/output.txt")?;
        write!(file, "{}", buf)?;
        file.flush()?;

        // Send response
        let res = "{\"res\":\"OK\"}";
        io::stdout().write_all(&u32::to_le_bytes(res.len() as u32))?;
        write!(io::stdout(), "{}", res)?;
        io::stdout().flush()?;
    }
}
