from PIL import Image

def remove_black_background(image_path, output_path):
    img = Image.open(image_path)
    img = img.convert("RGBA")

    datas = img.getdata()

    new_data = []
    for item in datas:
        # Check if pixel is black or near black
        if item[0] < 50 and item[1] < 50 and item[2] < 50:
            # Change all black (or near black) pixels to transparent
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)

    img.putdata(new_data)
    img.save(output_path, "PNG")

# usage
remove_black_background('inverted-logo-colors.jpg', 'output_image.png')
