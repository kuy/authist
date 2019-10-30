use std::convert::TryInto;
use std::fs::File;
use std::io::{Read, Write};

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let handle = std::io::stdin().take(4);
    let bytes: Vec<u8> = handle.bytes().map(|i| i.unwrap()).collect();
    let size = u32::from_le_bytes(bytes.as_slice().try_into().unwrap());

    let mut file = File::create("/Users/kuy/Work/au2far-ocr/size.txt")?;
    write!(file, "SIZE: {}", size)?;
    file.flush()?;

    let mut buf = String::new();
    std::io::stdin().read_line(&mut buf)?;
    let mut file = File::create("/Users/kuy/Work/au2far-ocr/output.txt")?;
    write!(file, "{}", buf)?;
    file.flush()?;

    write!(std::io::stdout(), "OK\r\n")?;
    std::io::stdout().flush()?;

    Ok(())
}
