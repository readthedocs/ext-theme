import sys
import os

sys.path.insert(0, os.path.abspath('.'))

import docext

project = 'readthedocsext-theme'
copyright = '2022, Read the Docs, Inc'
author = 'Read the Docs, Inc'

release = '1.0rc1'
version = release

extensions = [
    'sphinxcontrib.autoanysrc',
]

templates_path = ['_templates']
html_static_path = ['_static']

exclude_patterns = ['_build', 'Thumbs.db', '.DS_Store']

autoanysrc_analyzers = {
    'html': 'docext.DjangoTemplateAnalyzer',
}

html_theme = 'sphinx_rtd_theme'
