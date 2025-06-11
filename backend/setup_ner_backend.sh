#!/bin/bash

# Script to set up NER backend environment
# Run with: bash setup_ner_backend.sh

set -e  # Exit on any error

echo "Creating conda environment 'ner_backend' with Python 3.9..."
conda create -n ner_backend python=3.9 -y

echo "Activating the environment..."
source $(conda info --base)/etc/profile.d/conda.sh
conda activate ner_backend

echo "Installing packages via conda where available..."
# Install packages available through conda-forge (excluding pytorch for now)
conda install -c conda-forge fastapi uvicorn sqlalchemy -y
conda install -c conda-forge passlib bcrypt -y

echo "Installing PyTorch and related packages via pip to avoid compatibility issues..."
# Install PyTorch via pip to ensure compatibility with gliner
pip install torch --index-url https://download.pytorch.org/whl/cpu

echo "Installing remaining packages via pip..."
# These packages are not readily available in conda or need specific versions
pip install "python-jose[cryptography]"
pip install gliner

echo "Verifying installation..."
python -c "import fastapi; import gliner; import torch; import sqlalchemy; print('All packages installed successfully!')"

echo "Environment 'ner_backend' setup complete!"
echo "To activate the environment in the future, run: conda activate ner_backend"