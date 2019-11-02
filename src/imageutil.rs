use image::imageops::colorops::invert;
use image::{load_from_memory_with_format as load, FilterType, ImageFormat, Luma, Rgb};
use imageproc::contrast::threshold;
use imageproc::edges::canny;
use imageproc::geometric_transformations::{rotate_about_center, Interpolation};
use imageproc::hough::{detect_lines, draw_polar_lines, LineDetectionOptions, PolarLine};
use imageproc::map::map_colors;
use imageproc::stats;
use log::*;

#[cfg(feature = "trace")]
fn debug_image<P, C>(name: &'static str, image: &image::ImageBuffer<P, C>)
where
    P: image::Pixel<Subpixel = u8> + 'static,
    C: std::ops::Deref<Target = [u8]>,
{
    let dir = std::path::Path::new("./process");
    std::fs::create_dir_all(dir).expect("failed to create dir");
    let path = dir.join(format!("{}.png", name));
    image.save(&path).expect("failed to save image")
}

#[cfg(feature = "trace")]
macro_rules! debug_image {
    ($name:expr,$image:expr) => {
        debug_image($name, $image);
    };
}

#[cfg(not(feature = "trace"))]
macro_rules! debug_image {
    ($name:expr,$image:expr) => {
        ();
    };
}

pub fn normalize(png: &Vec<u8>) -> image::GrayImage {
    // Load and resize image, then convert to grayscale
    let orig_image = load(png, ImageFormat::PNG).expect("Failed to load image");
    let gray_image = orig_image.resize(256, 256, FilterType::Triangle).to_luma();
    debug_image!("01-gray", &gray_image);

    // Calc percentile
    let percentile = stats::percentile(&gray_image, 50);
    debug!("percentile={}", percentile);

    // Detect edges using Canny algorithm
    let edge_image = canny(&gray_image, 50.0, 100.0);
    debug_image!("02-edge", &edge_image);

    // Detect lines using Hough transform
    let options = LineDetectionOptions {
        vote_threshold: 80,
        suppression_radius: 8,
    };
    let lines: Vec<PolarLine> = detect_lines(&edge_image, options);
    debug!("lines={:?}", lines);

    if cfg!(feature = "trace") {
        // Draw lines on top of edge image
        let white = Rgb([255, 255, 255]);
        let green = Rgb([0, 255, 0]);
        let black = Rgb([0, 0, 0]);
        let color_edges = map_colors(&edge_image, |p| if p[0] > 0 { white } else { black });
        let _lines_image = draw_polar_lines(&color_edges, &lines, green);
        debug_image!("03-lines", &_lines_image);
    }

    // Calculate angle for rotation
    let selected: Vec<f32> = lines
        .iter()
        .map(|l| l.angle_in_degrees as f32)
        .filter(|a| 0.0 <= *a && *a <= 45.0 || 135.0 <= *a && *a <= 180.0)
        .map(|a| if a >= 90.0 { a - 180.0 } else { a })
        .collect();
    debug!("selected={:?}", selected);
    let average = selected.iter().fold(0.0, |acc, a| acc + a) / selected.len() as f32;
    let counter = -1.0 * average;
    debug!("angle[deg]={}, counter[deg]={}", average, counter);
    let rad = core::f32::consts::PI * counter / 180.0;
    debug!("counter[rad]={}", rad);

    // Rotate original image without resizing
    let black = Luma([0]);
    let gray_image = orig_image.to_luma();
    let rotated_image = rotate_about_center(&gray_image, rad, Interpolation::Bilinear, black);
    debug_image!("04-rotated", &rotated_image);

    // Binarize image
    let mut norm_image = threshold(&rotated_image, 160);
    if percentile < 100 {
        invert(&mut norm_image);
        debug!("inverted=true");
    } else {
        debug!("inverted=false");
    }
    debug_image!("05-norm", &norm_image);
    norm_image
}
