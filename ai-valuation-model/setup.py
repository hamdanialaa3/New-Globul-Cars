#!/usr/bin/env python3
"""
Setup script for Bulgarian Car Valuation AI Model
"""

from setuptools import setup, find_packages

with open("requirements.txt") as f:
    requirements = f.read().splitlines()

with open("README.md", "r", encoding="utf-8") as f:
    long_description = f.read()

setup(
    name="bulgarian-car-valuation",
    version="1.0.0",
    author="Globul Cars Team",
    author_email="team@globul-cars.com",
    description="AI-powered car valuation model for Bulgarian market",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/globul-cars/ai-valuation-model",
    packages=find_packages(),
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Topic :: Scientific/Engineering :: Artificial Intelligence",
    ],
    python_requires=">=3.8",
    install_requires=requirements,
    extras_require={
        "dev": ["pytest>=7.0", "black", "flake8"],
        "gpu": ["tensorflow-gpu>=2.10.0"],
    },
    entry_points={
        "console_scripts": [
            "bulgarian-car-valuation-train=train_model:main",
            "bulgarian-car-valuation-predict=predict:main",
        ],
    },
)