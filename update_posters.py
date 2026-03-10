import os
import json

def update_posters():
    """
    Reads the 'assets/Posters' directory and creates a new 'data.js' file.
    This enables you to just add new images to the folder, run this script,
    and your webapp will automatically display them without manual coding.
    """
    poster_dir = os.path.join('assets', 'Posters')
    
    # Check if directory exists
    if not os.path.exists(poster_dir):
        print(f"Error: Directory '{poster_dir}' not found. Please create it and add some posters.")
        return

    # Filter for image extensions typically used for posters
    valid_extensions = ('.png', '.jpg', '.jpeg', '.gif', '.webp')
    
    # List files and filter
    files = []
    for f in os.listdir(poster_dir):
        # Ignore case while checking extensions
        if f.lower().endswith(valid_extensions):
            files.append(f)
            
    # Write to data.js
    js_content = f"const POSTERS = {json.dumps(files, indent=4)};\n"
    
    with open('data.js', 'w', encoding='utf-8') as f:
        f.write(js_content)
        
    print(f"Successfully updated 'data.js' with {len(files)} new poster(s).")
    print(f"If running on GitHub Pages or Firebase, you can safely commit and push these changes.")

if __name__ == '__main__':
    update_posters()
