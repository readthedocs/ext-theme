"""
readthedocsext-theme doc extensions
"""

import glob
import os
import re
import subprocess
from pathlib import Path

from docutils import nodes
from docutils.parsers.rst import directives
from docutils.statemachine import StringList
from sphinx.util import logging
from sphinx.util.docutils import SphinxDirective, switch_source_input
from sphinx.util.nodes import nested_parse_with_titles

logger = logging.getLogger(__name__)


class BaseCommentAnalyzer:
    """
    Pull reStructuredText out of comment blocks in a source file.

    Subclasses define what a comment block starts and ends with. Everything
    between the two markers is yielded line by line, with the indentation of
    the opening marker removed. Adapted from sphinxcontrib-autoanysrc.
    """

    comment_starts_with = None
    comment_ends_with = None

    def process(self, content):
        in_comment_block = False
        comment_block_indent_len = 0

        for lineno, srcline in enumerate(content.split("\n")):
            line = srcline.lstrip()

            if not in_comment_block and line.startswith(self.comment_starts_with):
                in_comment_block = True
                comment_block_indent_len = len(srcline) - len(line)
                continue

            if not in_comment_block:
                continue

            if line.startswith(self.comment_ends_with):
                in_comment_block = False
                yield "", lineno
                continue

            indent_len = len(srcline) - len(line) - comment_block_indent_len
            if srcline and indent_len:
                line = srcline[0] * indent_len + line

            yield line, lineno


class CommonAnalyzer(BaseCommentAnalyzer):
    def process(self, content):
        first_indent = None

        for line, lineno in super().process(content):
            line_stripped = line.lstrip()

            # Get the initial indent from the first comment line
            if first_indent is None:
                first_indent = len(line) - len(line_stripped)

            # In normal cases, comment blocks should be indented 2 characters.
            # So, first_indent == 2
            # Check that the indent is all whitespace
            line_indent = line[0:first_indent]
            if len(line_indent.strip()) != 0:
                raise Exception(
                    f"Line {lineno} is missing some indentation. "
                    f"Try indenting the block inner text once."
                )

            line_content = line[first_indent:]

            # Conditionally left strip comment lines out
            if hasattr(self, "strip_comment"):
                line_content = self.strip_comment(line_content)

            yield (line_content, lineno)


class DjangoTemplateAnalyzer(CommonAnalyzer):
    comment_starts_with = '{% comment "rst" %}'
    comment_ends_with = "{% endcomment %}"


class CSSAnalyzer(CommonAnalyzer):
    comment_starts_with = "/*"
    comment_ends_with = "*/"

    def strip_comment(self, line):
        return re.sub(r"^\s?\*\s?", "", line)


ANALYZERS = {
    "html": DjangoTemplateAnalyzer,
    "css": CSSAnalyzer,
}


class AnySrcDirective(SphinxDirective):
    """
    Render the reStructuredText found in comment blocks of source files.

    .. code:: rst

        .. autoanysrc:: remove_button
            :src: ../readthedocsext/theme/templates/includes/crud/remove_button.html
            :analyzer: html

    The argument is only a label. ``src`` is a glob, relative to the docs
    directory, and ``analyzer`` picks how comment blocks are found.
    """

    required_arguments = 1
    option_spec = {
        "src": directives.unchanged_required,
        "analyzer": directives.unchanged_required,
    }

    def run(self):
        analyzer = ANALYZERS[self.options["analyzer"]]()
        pattern = self.options["src"]
        if not os.path.isabs(pattern):
            pattern = os.path.join(self.env.srcdir, pattern)

        content = StringList()
        for path in sorted(glob.glob(pattern)):
            self.env.note_dependency(path)
            logger.info("    <autoanysrc> %s", path)
            text = Path(path).read_text(encoding="utf-8")
            for line, lineno in analyzer.process(text):
                content.append(line, path, lineno)

        # Parse as a section so the comment blocks can contain their own titles
        node = nodes.section()
        node.document = self.state.document
        with switch_source_input(self.state, content):
            nested_parse_with_titles(self.state, content, node)
        return node.children


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
    app.add_directive("autoanysrc", AnySrcDirective)
    app.connect("builder-inited", build_init)
    return {"parallel_read_safe": True}
