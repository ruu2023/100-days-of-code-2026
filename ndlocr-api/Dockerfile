FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    wget \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Copy ndlocr-lite source
COPY ndlocr-lite /app/ndlocr-lite

# Copy requirements and install Python dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Install ndlocr-lite dependencies
RUN pip install --no-cache-dir \
    dill==0.3.8 \
    lxml==5.4.0 \
    networkx==3.3 \
    onnxruntime==1.23.2 \
    pillow==12.1.1 \
    ordered-set==4.1.0 \
    protobuf==6.31.1 \
    pyparsing==3.1.2 \
    PyYAML==6.0.1 \
    tqdm==4.66.4 \
    reportlab==4.2.5 \
    pypdfium2==4.30.0 \
    numpy==2.2.2 \
    opencv-python-headless==4.11.0.86

# Copy main.py
COPY main.py /app/

# Set environment variables
ENV PYTHONPATH=/app
ENV PORT=8080

# Expose port
EXPOSE 8080

# Run the application
CMD ["python", "main.py"]
