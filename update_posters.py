import os
import re

def update_posters():
    """
    Reads the 'assets/Posters' directory and creates a new 'data.js' file.
    This version cleverly merges new files while preserving the manually 
    added { poster: "...", type: "..." } objects you created!
    """
    poster_dir = os.path.join('assets', 'Posters')
    if not os.path.exists(poster_dir):
        print(f"Error: Directory '{poster_dir}' not found. Please create it and add some posters.")
        return

    valid_extensions = ('.png', '.jpg', '.jpeg', '.gif', '.webp')
    
    # Identify what is currently in data.js to preserve custom types
    existing_items = {} # Maps filename to its full JS string representation
    try:
        if os.path.exists('data.js'):
            with open('data.js', 'r', encoding='utf-8') as f:
                content = f.read()
                # Find the array content
                match = re.search(r'const\s+POSTERS\s*=\s*\[(.*?)\];', content, re.DOTALL)
                if match:
                    array_content = match.group(1)
                    # Split by comma but respect object nesting
                    # Easiest way is to just find strings and objects
                    # Extract strings
                    strings = re.findall(r'"([^"]+)"', array_content)
                    for s in strings:
                        # Only grab actual file names, not keys like "type" or "poster"
                        if s.lower().endswith(valid_extensions):
                            if s not in existing_items:
                                existing_items[s] = f'"{s}"'
                    
                    # Extract objects
                    objects = re.findall(r'\{[^}]+\}', array_content)
                    for obj in objects:
                        poster_match = re.search(r'poster\s*:\s*"([^"]+)"', obj)
                        if poster_match:
                            filename = poster_match.group(1)
                            existing_items[filename] = obj
    except Exception as e:
        print("Warning: Could not parse existing data.js properly, generating fresh.", e)

    # Get actual files in directory
    files = []
    for f in os.listdir(poster_dir):
        if f.lower().endswith(valid_extensions):
            files.append(f)
            
    # Build new JS array string
    js_items = []
    for f in files:
        if f in existing_items:
            js_items.append("    " + existing_items[f]) # Keep existing string/object
        else:
            js_items.append(f'    "{f}"') # Add new file as normal string (Movies logic applies by default)
            
    js_array = ",\n".join(js_items)
    js_content = f"const POSTERS = [\n{js_array}\n];\n"
    
    with open('data.js', 'w', encoding='utf-8') as f:
        f.write(js_content)
        
    print(f"Successfully updated 'data.js' with {len(files)} total poster(s), preserving your custom types.")

if __name__ == '__main__':
    update_posters()
