import re

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Replace the SVG block with the Image tag
    # The SVG block is enclosed in a div.w-8.h-8
    pattern_svg = re.compile(r'<div className="w-8 h-8 bg-\[#00B150\] rounded-lg flex items-center justify-center">\s*<svg.*?</svg>\s*</div>', re.DOTALL)
    img_tag = '<img src="/litterpin-logo.png" alt="LitterPin Logo" className="w-8 h-8 object-contain" />'
    content = pattern_svg.sub(img_tag, content)

    # 2. Make the "Pin" green
    # In Header.tsx: <span className="... hidden sm:inline">LitterPin</span>
    content = content.replace('>LitterPin</span>', '>Litter<span className="text-[#00B150]">Pin</span></span>')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Fixed {filepath}")

fix_file('src/app/components/Header.tsx')
fix_file('src/app/pages/Landing.tsx')
