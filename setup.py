"""
Read the Docs extension - Theme

Next generation theme for Read the Docs
"""

import sys

from setuptools import find_namespace_packages, setup

# Catch me in setup.cfg
setup(
    packages=find_namespace_packages(include=['readthedocsext.*'])
)
