from setuptools import setup, find_packages

setup(
    name="truetag-ai",
    version="1.0.0",
    packages=find_packages(),
    install_requires=[
        "fastapi==0.95.2",
        "uvicorn==0.22.0",
        "python-dotenv==1.0.0",
        "opencv-python-headless==4.7.0.72",
        "scikit-learn==1.2.2",
        "numpy==1.24.3",
        "pandas==2.0.2",
        "pymongo==4.3.3",
        "pytest==7.3.1",
        "python-multipart==0.0.6",
        "Pillow==9.5.0"
    ]
)