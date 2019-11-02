use image::imageops::colorops::invert;
use image::{load_from_memory_with_format as load, FilterType, ImageFormat, Luma, Rgb};
use imageproc::contrast::threshold;
use imageproc::edges::canny;
use imageproc::geometric_transformations::{rotate_about_center, Interpolation};
use imageproc::hough::{detect_lines, draw_polar_lines, LineDetectionOptions, PolarLine};
use imageproc::map::map_colors;
use imageproc::stats::percentile;
use std::fs::File;
use std::io::Write;
use std::path::Path;

pub fn normalize(png: &Vec<u8>) -> image::GrayImage {
    // Load and resize image, then convert to grayscale
    let orig_image = load(png, ImageFormat::PNG).expect("Failed to load image");

    // Save grayscale image in output directory
    let output_dir = Path::new("/Users/kuy/Work/au2far-ocr/process");
    let gray_path = output_dir.join("gray.png");
    let gray_image = orig_image.resize(256, 256, FilterType::Triangle).to_luma();
    gray_image.save(&gray_path).unwrap();

    // Calc percentile
    let pth_intensity = percentile(&gray_image, 50);

    let log_path = output_dir.join("process.log");
    let mut log = File::create(log_path).expect("Failed to create log file");
    write!(log, "percentile={}\n", pth_intensity).expect("Failed to write log file");

    // Detect edges using Canny algorithm
    let edges = canny(&gray_image, 50.0, 100.0);
    let canny_path = output_dir.join("canny.png");
    edges.save(&canny_path).unwrap();

    // Detect lines using Hough transform
    let options = LineDetectionOptions {
        vote_threshold: 80,
        suppression_radius: 8,
    };
    let lines: Vec<PolarLine> = detect_lines(&edges, options);

    let white = Rgb([255, 255, 255]);
    let green = Rgb([0, 255, 0]);
    let black = Rgb([0, 0, 0]);

    // Convert edge image to colour
    let color_edges = map_colors(&edges, |p| if p[0] > 0 { white } else { black });

    // Draw lines on top of edge image
    let lines_image = draw_polar_lines(&color_edges, &lines, green);
    let lines_path = output_dir.join("lines.png");
    lines_image.save(&lines_path).unwrap();

    write!(log, "lines={:?}\n", lines).expect("Failed to write log file");

    // Calculate angle of rotation
    let selected: Vec<f32> = lines
        .iter()
        .map(|l| l.angle_in_degrees as f32)
        .filter(|a| 0.0 <= *a && *a <= 45.0 || 135.0 <= *a && *a <= 180.0)
        .map(|a| if a >= 90.0 { a - 180.0 } else { a })
        .collect();
    write!(log, "selected={:?}\n", selected).expect("Failed to write log file");

    let sum = selected.iter().fold(0.0, |acc, a| acc + a);
    let angle = sum / selected.len() as f32;
    let adjust = -1.0 * angle;
    write!(log, "deg={}\nadjust={}\n", angle, adjust).expect("Failed to write log file");

    // Convert DEG to RAD
    let rad = core::f32::consts::PI * adjust / 180.0;
    write!(log, "rad={}\n", rad).expect("Failed to write log file");

    // Rotate original image without resizing
    let black = Luma([0]);
    let gray_image = orig_image.to_luma();
    let rotated_image = rotate_about_center(&gray_image, rad, Interpolation::Bilinear, black);
    let rotated_path = output_dir.join("rotated.png");
    rotated_image.save(&rotated_path).unwrap();

    // Binarize image
    let mut bnw_image = threshold(&rotated_image, 160);
    if pth_intensity < 100 {
        invert(&mut bnw_image);
        write!(log, "inverted=true\n").expect("Failed to write log file");
    } else {
        write!(log, "inverted=false\n").expect("Failed to write log file");
    }
    let bnw_path = output_dir.join("bnw.png");
    bnw_image.save(&bnw_path).unwrap();
    bnw_image
}
