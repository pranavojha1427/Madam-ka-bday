import urllib.request
import os

assets_dir = 'assets'
os.makedirs(assets_dir, exist_ok=True)

for i in range(1, 16):
    file_path = os.path.join(assets_dir, f'polaroid{i}.jpg')
    if not os.path.exists(file_path):
        url = f'https://picsum.photos/seed/{i}/400/500'
        print(f'Downloading {url} to {file_path}...')
        try:
            urllib.request.urlretrieve(url, file_path)
        except Exception as e:
            print(f'Failed to download {file_path}: {e}')

print('Done downloading placeholders.')
