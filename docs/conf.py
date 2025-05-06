import os
import sys

sys.path.insert(0, os.path.abspath("."))

import docext  # noqa

project = "readthedocsext-theme"
copyright = "2025, Read the Docs, Inc"
author = "Read the Docs, Inc"

release = "1.0rc1"
version = release

extensions = [
    "docext",
    "sphinx.ext.autodoc",
    "sphinxcontrib.autoanysrc",
    "sphinx_js",
]

templates_path = ["_templates"]
html_static_path = ["_static"]

exclude_patterns = ["_build", "Thumbs.db", ".DS_Store"]

autoanysrc_analyzers = {
    "html": "docext.DjangoTemplateAnalyzer",
    "css": "docext.CSSAnalyzer",
}

js_source_path = "../src/js"
jsdoc_config_path = "jsdoc.json"
primary_domain = "js"

html_theme = "sphinx_rtd_theme"
