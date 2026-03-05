import sys
sys.setrecursionlimit(5000)

import os
import tempfile
import shutil
import uuid
from pathlib import Path

import numpy as np
from PIL import Image
import xml.etree.ElementTree as ET
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import uvicorn

# Base paths
BASE_DIR = Path(__file__).resolve().parent
NDLOCR_DIR = BASE_DIR / "ndlocr-lite"
SRC_DIR = NDLOCR_DIR / "src"
MODEL_DIR = SRC_DIR / "model"
CONFIG_DIR = SRC_DIR / "config"

# Add src to path
sys.path.insert(0, str(SRC_DIR))

# Download models if not exist
def setup_models():
    """Download and extract model files if not present."""
    import urllib.request
    import tarfile

    # Check if models already exist
    required_models = [
        MODEL_DIR / "deim-s-1024x1024.onnx",
        MODEL_DIR / "parseq-ndl-16x256-30-tiny-192epoch-tegaki3.onnx",
        MODEL_DIR / "parseq-ndl-16x384-50-tiny-146epoch-tegaki2.onnx",
        MODEL_DIR / "parseq-ndl-16x768-100-tiny-165epoch-tegaki2.onnx",
    ]

    # Check if all models exist
    if all(m.exists() for m in required_models):
        print("Models already exist, skipping download.")
        return

    print("Downloading ndlocr-lite models...")

    # Create directories
    MODEL_DIR.mkdir(parents=True, exist_ok=True)

    # Download Linux release
    url = "https://github.com/ndl-lab/ndlocr-lite/releases/download/1.1.2/ndlocr_lite_v1.1.2_linux.tar.gz"
    tar_path = BASE_DIR / "ndlocr_lite_v1.1.2_linux.tar.gz"

    if not tar_path.exists():
        urllib.request.urlretrieve(url, tar_path)
        print("Downloaded ndlocr-lite Linux release")

    # Extract only the model and config files
    print("Extracting model files...")
    with tarfile.open(tar_path, 'r:gz') as tar:
        for member in tar.getmembers():
            if 'model/' in member.name or 'config/' in member.name:
                # Remove the ndlocr_lite_v1.1.2_linux prefix
                member.name = member.name.replace('ndlocr_lite_v1.1.2_linux/', '')
                tar.extract(member, SRC_DIR)

    print("Models extracted successfully.")

# Initialize models on startup
setup_models()

# Import ndlocr modules after setup
from deim import DEIM
from parseq import PARSEQ
from yaml import safe_load
from concurrent.futures import ThreadPoolExecutor
import time
import json
from reading_order.xy_cut.eval import eval_xml
from ndl_parser import convert_to_xml_string3


class RecogLine:
    def __init__(self, npimg: np.ndarray, idx: int, pred_char_cnt: int, pred_str: str = ""):
        self.npimg = npimg
        self.idx = idx
        self.pred_char_cnt = pred_char_cnt
        self.pred_str = pred_str

    def __lt__(self, other):
        return self.idx < other.idx


def process_cascade(alllineobj, recognizer30, recognizer50, recognizer100, is_cascade=True):
    targetdflist30 = []
    targetdflist50 = []
    targetdflist100 = []

    for lineobj in alllineobj:
        if lineobj.pred_char_cnt == 3 and is_cascade:
            targetdflist30.append(lineobj)
        elif lineobj.pred_char_cnt == 2 and is_cascade:
            targetdflist50.append(lineobj)
        else:
            targetdflist100.append(lineobj)

    targetdflistall = []
    with ThreadPoolExecutor(thread_name_prefix="thread") as executor:
        resultlines30, resultlines50, resultlines100 = [], [], []

        if len(targetdflist30) > 0:
            resultlines30 = executor.map(recognizer30.read, [t.npimg for t in targetdflist30])
            resultlines30 = list(resultlines30)

        for i in range(len(targetdflist30)):
            pred_str = resultlines30[i]
            lineobj = targetdflist30[i]
            if len(pred_str) >= 25:
                targetdflist50.append(lineobj)
            else:
                lineobj.pred_str = pred_str
                targetdflistall.append(lineobj)

        if len(targetdflist50) > 0:
            resultlines50 = executor.map(recognizer50.read, [t.npimg for t in targetdflist50])
            resultlines50 = list(resultlines50)

        for i in range(len(targetdflist50)):
            pred_str = resultlines50[i]
            lineobj = targetdflist50[i]
            if len(pred_str) >= 45:
                targetdflist100.append(lineobj)
            else:
                lineobj.pred_str = pred_str
                targetdflistall.append(lineobj)

        if len(targetdflist100) > 0:
            resultlines100 = executor.map(recognizer100.read, [t.npimg for t in targetdflist100])
            resultlines100 = list(resultlines100)

        for i in range(len(targetdflist100)):
            pred_str = resultlines100[i]
            lineobj = targetdflist100[i]
            lineobj.pred_str = pred_str
            targetdflistall.append(lineobj)

        targetdflistall = sorted(targetdflistall)
        resultlinesall = [t.pred_str for t in targetdflistall]

    return resultlinesall


class OCRProcessor:
    def __init__(self):
        self.detector = None
        self.recognizer100 = None
        self.recognizer30 = None
        self.recognizer50 = None
        self._initialize_models()

    def _initialize_models(self):
        """Initialize OCR models."""
        print("Initializing OCR models...")

        # Model paths
        det_weights = str(MODEL_DIR / "deim-s-1024x1024.onnx")
        det_classes = str(CONFIG_DIR / "ndl.yaml")
        rec_weights30 = str(MODEL_DIR / "parseq-ndl-16x256-30-tiny-192epoch-tegaki3.onnx")
        rec_weights50 = str(MODEL_DIR / "parseq-ndl-16x384-50-tiny-146epoch-tegaki2.onnx")
        rec_weights = str(MODEL_DIR / "parseq-ndl-16x768-100-tiny-165epoch-tegaki2.onnx")
        rec_classes = str(CONFIG_DIR / "NDLmoji.yaml")

        # Load detector
        self.detector = DEIM(
            model_path=det_weights,
            class_mapping_path=det_classes,
            score_threshold=0.2,
            conf_threshold=0.25,
            iou_threshold=0.2,
            device="cpu"
        )

        # Load recognizers
        with open(rec_classes, encoding="utf-8") as f:
            charobj = safe_load(f)
        charlist = list(charobj["model"]["charset_train"])

        self.recognizer100 = PARSEQ(model_path=rec_weights, charlist=charlist, device="cpu")
        self.recognizer30 = PARSEQ(model_path=rec_weights30, charlist=charlist, device="cpu")
        self.recognizer50 = PARSEQ(model_path=rec_weights50, charlist=charlist, device="cpu")

        print("OCR models initialized successfully.")

    def process_image(self, image_path: str) -> dict:
        """Process a single image and return OCR results."""
        pil_image = Image.open(image_path).convert('RGB')
        img = np.array(pil_image)
        img_h, img_w = img.shape[:2]

        # Detection
        detections = self.detector.detect(img)
        classeslist = list(self.detector.classes.values())

        # Build XML structure
        resultobj = [dict(), dict()]
        resultobj[0][0] = []
        for i in range(17):
            resultobj[1][i] = []

        for det in detections:
            xmin, ymin, xmax, ymax = det["box"]
            conf = det["confidence"]
            if det["class_index"] == 0:
                resultobj[0][0].append([xmin, ymin, xmax, ymax])
            resultobj[1][det["class_index"]].append([xmin, ymin, xmax, ymax, conf])

        xmlstr = convert_to_xml_string3(img_w, img_h, os.path.basename(image_path), classeslist, resultobj)
        xmlstr = "<OCRDATASET>" + xmlstr + "</OCRDATASET>"

        root = ET.fromstring(xmlstr)
        eval_xml(root, logger=None)

        # Extract lines
        alllineobj = []
        for idx, lineobj in enumerate(root.findall(".//LINE")):
            xmin = int(lineobj.get("X"))
            ymin = int(lineobj.get("Y"))
            line_w = int(lineobj.get("WIDTH"))
            line_h = int(lineobj.get("HEIGHT"))
            try:
                pred_char_cnt = float(lineobj.get("PRED_CHAR_CNT"))
            except:
                pred_char_cnt = 100.0

            lineimg = img[ymin:ymin + line_h, xmin:xmin + line_w, :]
            linerecogobj = RecogLine(lineimg, idx, pred_char_cnt)
            alllineobj.append(linerecogobj)

        # Recognition
        resultlinesall = process_cascade(
            alllineobj, self.recognizer30, self.recognizer50, self.recognizer100, is_cascade=True
        )

        # Update XML with recognized text
        for idx, lineobj in enumerate(root.findall(".//LINE")):
            lineobj.set("STRING", resultlinesall[idx])

        # Build response
        alltextlist = []
        resjsonarray = []

        for idx, lineobj in enumerate(root.findall(".//LINE")):
            xmin = int(lineobj.get("X"))
            ymin = int(lineobj.get("Y"))
            line_w = int(lineobj.get("WIDTH"))
            line_h = int(lineobj.get("HEIGHT"))
            try:
                conf = float(lineobj.get("CONF"))
            except:
                conf = 0

            jsonobj = {
                "boundingBox": [[xmin, ymin], [xmin, ymin + line_h], [xmin + line_w, ymin], [xmin + line_w, ymin + line_h]],
                "id": idx,
                "isVertical": "true",
                "text": resultlinesall[idx],
                "isTextline": "true",
                "confidence": conf
            }
            resjsonarray.append(jsonobj)

        alltextlist.append("\n".join(resultlinesall))

        return {
            "text": "\n".join(resultlinesall),
            "lines": resjsonarray,
            "image_info": {
                "width": img_w,
                "height": img_h
            }
        }


# Create FastAPI app
app = FastAPI(title="NDLOCR-Lite API", description="OCR API using ndlocr-lite")

# Global OCR processor
ocr_processor = None


@app.on_event("startup")
async def startup_event():
    global ocr_processor
    ocr_processor = OCRProcessor()


@app.get("/")
async def root():
    return {"message": "NDLOCR-Lite OCR API", "status": "running"}


@app.get("/health")
async def health():
    return {"status": "healthy"}


@app.post("/ocr")
async def ocr(file: UploadFile = File(...)):
    """Process an image and return OCR text."""
    if ocr_processor is None:
        raise HTTPException(status_code=500, detail="OCR processor not initialized")

    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/tiff", "image/bmp"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: {', '.join(allowed_types)}"
        )

    # Create temp directory
    temp_dir = tempfile.mkdtemp()
    temp_input = None
    temp_output = tempfile.mkdtemp()

    try:
        # Save uploaded file
        file_ext = os.path.splitext(file.filename)[1].lower()
        if not file_ext:
            file_ext = ".jpg"

        temp_input = os.path.join(temp_dir, f"input{uuid.uuid4()}{file_ext}")
        content = await file.read()
        with open(temp_input, "wb") as f:
            f.write(content)

        # Process image
        result = ocr_processor.process_image(temp_input)

        return JSONResponse(content=result)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        # Cleanup temp files
        if temp_dir and os.path.exists(temp_dir):
            shutil.rmtree(temp_dir, ignore_errors=True)
        if temp_output and os.path.exists(temp_output):
            shutil.rmtree(temp_output, ignore_errors=True)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run(app, host="0.0.0.0", port=port)
