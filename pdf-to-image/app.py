from flask import Flask, request, jsonify
from flask_cors import CORS  # Import CORS
import fitz  # PyMuPDF
import base64
import io

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/convert', methods=['POST'])
def convert_pdf_to_images():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    try:
        # Read the PDF file as bytes
        pdf_bytes = file.read()

        # Load the PDF into pymupdf
        pdf_document = fitz.open(stream=pdf_bytes, filetype="pdf")
        image_data = []

        # Increase quality by setting a higher scale (e.g., 3.0 means 300% resolution)
        scale = 3.0  # Adjust for higher or lower quality
        matrix = fitz.Matrix(scale, scale)

        # Convert each page to an image
        for page in pdf_document:
            pix = page.get_pixmap(matrix=matrix)  # Apply scaling for higher DPI
            img = io.BytesIO(pix.tobytes("jpeg"))  # Convert to JPEG format
            encoded_image = base64.b64encode(img.getvalue()).decode('utf-8')
            image_data.append(f"data:image/jpeg;base64,{encoded_image}")

        return jsonify({'message': 'Conversion successful', 'images': image_data}), 200

    except Exception as e:
        return jsonify({'error': f'Conversion failed: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
