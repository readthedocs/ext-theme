"""
readthedocsext-theme doc extensions
"""

import os
import subprocess
from pathlib import Path

from sphinx.util import logging

logger = logging.getLogger(__name__)


def build_init(app):
    from sphinx.builders.html import StandaloneHTMLBuilder

    # ``npm bin`` was removed in npm 9, so resolve the path ourselves
    path_pkg = (Path(__file__).parent / "..").resolve()
    path_bin = path_pkg / "node_modules" / ".bin"
    path_jsdoc = path_bin / "jsdoc"
    logger.info("Path for jsdoc is: %s", str(path_jsdoc))
    os.environ["PATH"] += os.pathsep + str(path_bin)
    logger.info("PATH is: %s", os.environ["PATH"])

    if isinstance(app.builder, StandaloneHTMLBuilder):
        logger.info("Path for package-lock.json is: %s", str(path_pkg))
        if not path_jsdoc.exists():
            subprocess.run(["npm", "ci"], text=True, cwd=path_pkg)


def setup(app):
    app.connect("builder-inited", build_init)
    return {"parallel_read_safe": True}
