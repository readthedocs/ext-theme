"""
Sphinx directive that renders reStructuredText found in source file comments.

Vendored from sphinxcontrib-autoanysrc 0.2.0, by Evgeniy Tatarkin, BSD licensed:
https://github.com/sphinx-contrib/autoanysrc

The upstream package is unmaintained, caps Sphinx below 8, and ships a
``sphinxcontrib/__init__.py`` that imports ``pkg_resources``, which no longer
exists in setuptools 81 and later. Only the parts this project uses are kept.
``BaseCommentAnalyzer`` is unchanged apart from formatting. The ``autoanysrc``
directive was an autodoc ``Documenter`` subclass upstream and is rewritten here
as a plain ``SphinxDirective``, so it doesn't depend on autodoc internals.

Usage is the same as upstream:

.. code:: rst

    .. autoanysrc:: remove_button
        :src: ../readthedocsext/theme/templates/includes/crud/remove_button.html
        :analyzer: html

The argument is only a label. ``src`` is a glob relative to the docs directory,
and ``analyzer`` is a key in the ``autoanysrc_analyzers`` config value, which
maps keys to dotted paths of ``BaseCommentAnalyzer`` subclasses.
"""

import glob
import importlib
import os
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
    the opening marker removed.
    """

    comment_starts_with = None
    comment_ends_with = None

    def process(self, content):
        if not self.comment_starts_with or not self.comment_ends_with:
            raise RuntimeError(
                "comment_starts_with or comment_ends_with must be defined"
            )

        in_comment_block = False
        comment_block_indent_len = 0

        for lineno, srcline in enumerate(content.split("\n")):
            # remove indent
            line = srcline.lstrip()

            # check block begins
            if not in_comment_block and line.startswith(self.comment_starts_with):
                in_comment_block = True
                comment_block_indent_len = len(srcline) - len(line)
                continue  # goto next line

            # skip if line is not a docs
            if not in_comment_block:
                continue

            # check blocks ends
            if line.startswith(self.comment_ends_with):
                in_comment_block = False
                yield "", lineno  # empty line in docs
                continue  # goto next line

            # calculate indent
            indent_len = len(srcline) - len(line) - comment_block_indent_len
            if srcline and indent_len:
                indent_char = srcline[0]
                line = indent_char * indent_len + line

            yield line, lineno


def import_class(path):
    module, class_name = path.rsplit(".", 1)
    return getattr(importlib.import_module(module), class_name)


class AnySrcDirective(SphinxDirective):
    """Render the reStructuredText found in comment blocks of source files."""

    required_arguments = 1
    option_spec = {
        "src": directives.unchanged_required,
        "analyzer": directives.unchanged_required,
    }

    def run(self):
        analyzers = self.config.autoanysrc_analyzers or {}
        analyzer = import_class(analyzers[self.options["analyzer"]])()

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


def setup(app):
    app.add_config_value("autoanysrc_analyzers", None, "env")
    app.add_directive("autoanysrc", AnySrcDirective)
    return {"parallel_read_safe": True}
