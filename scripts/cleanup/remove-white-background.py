#!/usr/bin/env python3
"""
Remove white background from logo and make it transparent
Professional logo processing for Koli One branding
"""

from PIL import Image
import os
import sys

def remove_white_background(input_path, output_path, threshold=240):
    """
    Remove white background from image and make it transparent
    
    Args:
        input_path: Path to input PNG image
        output_path: Path to save output PNG with transparency
        threshold: White color threshold (0-255). Pixels brighter than this become transparent
    """
    print(f"🎨 Processing logo: {os.path.basename(input_path)}")
    
    # Open the image
    img = Image.open(input_path)
    img = img.convert("RGBA")
    
    # Get pixel data
    datas = img.getdata()
    
    new_data = []
    pixels_changed = 0
    
    for item in datas:
        # Check if pixel is close to white (all RGB channels > threshold)
        if item[0] > threshold and item[1] > threshold and item[2] > threshold:
            # Make it transparent
            new_data.append((255, 255, 255, 0))
            pixels_changed += 1
        else:
            # Keep the pixel as is
            new_data.append(item)
    
    # Update image data
    img.putdata(new_data)
    
    # Crop to remove excess transparent space and make logo appear larger
    # Get bounding box of non-transparent pixels
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        print(f"✅ Cropped to content: {bbox}")
    
    # Save the image
    img.save(output_path, "PNG")
    
    print(f"✅ Removed white background: {pixels_changed:,} pixels made transparent")
    print(f"✅ Final size: {img.size[0]} x {img.size[1]} pixels")
    print(f"✅ Saved to: {output_path}")
    
    return img.size

def main():
    # Paths
    input_logo = r"C:\Users\hamda\Desktop\New Globul Cars\Pic\koli one logo\Gemini_Generated_Image_d0obsed0obsed0ob.png"
    output_logo = r"C:\Users\hamda\Desktop\New Globul Cars\public\koli-one-transparent.png"
    
    print("╔════════════════════════════════════════════════════════════════╗")
    print("║     🎨 KOLI ONE LOGO - BACKGROUND REMOVAL PROCESSOR           ║")
    print("╚════════════════════════════════════════════════════════════════╝")
    print()
    
    # Check if input exists
    if not os.path.exists(input_logo):
        print(f"❌ Error: Input file not found: {input_logo}")
        sys.exit(1)
    
    # Process the logo
    try:
        size = remove_white_background(input_logo, output_logo, threshold=240)
        
        print()
        print("📋 Next steps:")
        print("   1. Copy transparent logo to all locations")
        print("   2. Update component styles for better display")
        print("   3. Test on all pages")
        
        # Also create copies with standard names
        public_dir = r"C:\Users\hamda\Desktop\New Globul Cars\public"
        
        from shutil import copy
        copy(output_logo, os.path.join(public_dir, "koli-one.png"))
        copy(output_logo, os.path.join(public_dir, "Logo.png"))
        copy(output_logo, os.path.join(public_dir, "Logo1.png"))
        
        print()
        print("✅ Copied transparent logo to:")
        print("   • public/koli-one.png")
        print("   • public/Logo.png")
        print("   • public/Logo1.png")
        
    except Exception as e:
        print(f"❌ Error processing logo: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
