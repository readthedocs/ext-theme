"""
readthedocsext-theme doc extensions
"""

import os
import subprocess
from pathlib import Path

from sphinx.util import logging
from sphinxcontrib.autoanysrc import analyzers

logger = logging.getLogger(__name__)


class DjangoTemplateAnalyzer(analyzers.BaseCommentAnalyzer):

    """There are a few errors with this docstring
    but black will not reformat any of this"""

    comment_starts_with = '{% comment "rst" %}'
    comment_ends_with = "{% endcomment %}"

    def process(self, content):
        first_indent = None

        for (line, lineno) in super().process(content):
            line_stripped = line.lstrip()

            # Get the initial indent from the first comment line
            if first_indent is None:
                first_indent = len(line) - len(line_stripped)

            # In normal cases, comment blocks should be indented 2 characters.
            # So, first_indent == 2
            # Check that the indent is all whitespace
            line_indent = line[0:first_indent]
            assert len(line_indent.strip()) == 0

            yield (line[first_indent:], lineno)


def build_init(app):
    from sphinx.builders.html import StandaloneHTMLBuilder

    cmd_npm = subprocess.run(["npm", "bin"], text=True, capture_output=True)
    path_bin = Path(cmd_npm.stdout.strip())
    path_jsdoc = path_bin / "jsdoc"
    logger.info("Path for jsdoc is: %s", str(path_jsdoc))
    os.environ["PATH"] += os.pathsep + str(path_bin)
    logger.info("PATH is: %s", os.environ["PATH"])

    if isinstance(app.builder, StandaloneHTMLBuilder):
        path_pkg = (Path() / "..").resolve()
        logger.info("Path for package-lock.json is: %s", str(path_pkg))
        if not path_jsdoc.exists():
            subprocess.run(["npm", "ci"], text=True, cwd=path_pkg)


def setup(app):
    app.connect("builder-inited", build_init)
