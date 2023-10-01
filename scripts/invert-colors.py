from PIL import Image, ImageOps

def invert_image(input_path, output_path):
    # Open the image
    img = Image.open(input_path)
    
    # Invert the image colors
    inverted_img = ImageOps.invert(img.convert('RGB'))
    
    # Save the inverted image to the specified output path
    inverted_img.save(output_path)

# Replace 'input.jpg' with the path to your image
# Replace 'output.jpg' with the desired path for the inverted image
invert_image('logoWithName.jpg', 'inverted-logo-colors.jpg')
