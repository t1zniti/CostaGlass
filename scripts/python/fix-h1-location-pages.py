import os

pages = {
    'cerramientos-de-cristal': ('Cerramientos de Cristal', ['estepona','fuengirola','marbella','mijas','sotogrande']),
    'pergolas-bioclimaticas':   ('Pérgolas Bioclimáticas',  ['estepona','fuengirola','marbella','mijas','sotogrande']),
    'paraviento-de-cristal':    ('Paravientos de Cristal',  ['estepona','fuengirola','marbella','mijas','sotogrande']),
}

base = '/Users/noz/Desktop/development/costaGlass'
cities_display = {
    'estepona': 'Estepona', 'fuengirola': 'Fuengirola', 'marbella': 'Marbella',
    'mijas': 'Mijas', 'sotogrande': 'Sotogrande'
}

for prefix, (product, cities) in pages.items():
    for city in cities:
        filepath = os.path.join(base, f'{prefix}-{city}', 'index.html')
        city_name = cities_display[city]
        old = f'<h1>Cortinas de cristal y sistemas <span class="hero-accent">en {city_name}</span></h1>'
        new = f'<h1>{product} <span class="hero-accent">en {city_name}</span></h1>'
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        if old in content:
            content = content.replace(old, new)
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f'Fixed: {prefix}-{city}')
        else:
            print(f'Skipped (no match): {prefix}-{city}')
