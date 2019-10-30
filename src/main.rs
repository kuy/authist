use std::fs::File;
use std::io::{Read, Write};

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let mut file = File::create("/Users/kuy/Work/au2far-ocr/started.txt")?;
    write!(file, "STARTED")?;
    file.flush()?;

    let handle = std::io::stdin().take(4);
    let mut size = 0;
    for (i, val) in handle.bytes().enumerate() {
        let val = val.unwrap();
        size += 256u32.pow(i as u32) * val as u32
    }

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
