import sys

def fix_paths(path, is_subfolder=True):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    prefix = '../' if is_subfolder else ''

    replacements = [
        ('href="index.html"', f'href="{prefix}"'),
        ('href="blog.html"', f'href="{prefix}blog.html"'),
        ('href="contact.html"', f'href="{prefix}contact.html"'),
        ('href="company.html"', f'href="{prefix}company.html"'),
        ('href="bioclimatic.html"', f'href="{prefix}bioclimatic.html"'),
        ('href="glass-curtain-walls.html"', f'href="{prefix}glass-curtain-walls.html"'),
        ('href="guillotine-glass.html"', f'href="{prefix}guillotine-glass.html"'),
        ('href="zip-screen.html"', f'href="{prefix}zip-screen.html"'),
        ('href="retractable-pvc-roof.html"', f'href="{prefix}retractable-pvc-roof.html"'),
        ('href="paravientos-de-cristal.html"', f'href="{prefix}paravientos-de-cristal.html"'),
        ('href="permiso-comunidad-cerrar-terraza-andalucia.html"', f'href="{prefix}permiso-comunidad-cerrar-terraza-andalucia.html"'),
        ('href="cerramientos-de-terrazas-cristal-precio-m2/"', f'href="{prefix}cerramientos-de-terrazas-cristal-precio-m2/"'),
        ('href="cortinas-de-cristal-inconvenientes.html"', f'href="{prefix}cortinas-de-cristal-inconvenientes.html"'),
        ('href="pergola-bioclimatica-vs-toldo-tradicional-costa-del-sol.html"', f'href="{prefix}pergola-bioclimatica-vs-toldo-tradicional-costa-del-sol.html"'),
        ('href="politica-de-privacidad.html"', f'href="{prefix}politica-de-privacidad.html"'),
    ]

    for old, new in replacements:
        content = content.replace(old, new)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'Fixed: {path}')

if __name__ == '__main__':
    fix_paths(sys.argv[1])
