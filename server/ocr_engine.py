import sys
import json
import fitz  # PyMuPDF
import os

# Suppress Paddle logs
os.environ["PPOCR_LOG"] = "0"
from paddleocr import PaddleOCR

def extract_text_with_ocr(file_path):
    try:
        ocr = PaddleOCR(use_angle_cls=True, lang='en', show_log=False)
        doc = fitz.open(file_path)
        full_text = []

        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            pix = page.get_pixmap()
            
            # Save temporary image for OCR
            img_path = f"{file_path}_page_{page_num}.png"
            pix.save(img_path)

            try:
                result = ocr.ocr(img_path, cls=True)
                if result and result[0]:
                    page_text = " ".join([line[1][0] for line in result[0]])
                    full_text.append(page_text)
            finally:
                # Cleanup temp image
                if os.path.exists(img_path):
                    os.remove(img_path)
        
        doc.close()
        return " ".join(full_text)
    except Exception as e:
        return f"Error: {str(e)}"

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No file path provided"}))
        sys.exit(1)
    
    file_path = sys.argv[1]
    if not os.path.exists(file_path):
        print(json.dumps({"error": "File not found"}))
        sys.exit(1)

    text = extract_text_with_ocr(file_path)
    print(json.dumps({"text": text}))
