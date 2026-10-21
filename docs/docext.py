"""
readthedocsext-theme doc extensions
"""

import codecs
import glob
import importlib
import os
import re
import subprocess
from pathlib import Path

from sphinx.ext.autodoc import Documenter
from sphinx.util import logging
from sphinx.util.console import bold

logger = logging.getLogger(__name__)


# The ``autoanysrc`` directive and the comment analyzer below are adapted from
# sphinxcontrib-autoanysrc 0.2.0 (BSD licensed). That package is unmaintained,
# caps Sphinx at < 8, and ships a ``sphinxcontrib/__init__.py`` that imports
# ``pkg_resources``, which no longer exists in recent setuptools releases.


class BaseCommentAnalyzer:
    """General analyzer for fishing docs from comment blocks."""

    # These must be overridden in subclasses
    comment_starts_with = None
    comment_ends_with = None

    def __init__(self, documenter):
        self.documenter = documenter

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
                continue

            # skip if line is not a docs
            if not in_comment_block:
                continue

            # check block ends
            if line.startswith(self.comment_ends_with):
                in_comment_block = False
                yield "", lineno  # empty line in docs
                continue

            # calculate indent
            indent_len = len(srcline) - len(line) - comment_block_indent_len
            if srcline and indent_len:
                indent_char = srcline[0]
                line = indent_char * indent_len + line

            yield line, lineno


class AnySrcDocumenter(Documenter):
    """Autodoc documenter that pulls docs from comment blocks in any source file."""

    objtype = "anysrc"
    content_indent = ""
    titles_allowed = True

    option_spec = {
        "src": lambda x: x,
        "analyzer": lambda x: x,
    }

    analyzer_by_key = {}

    @classmethod
    def can_document_member(cls, *args, **kwargs):
        return False  # stop documenters chain

    @classmethod
    def register_analyzer(cls, key, analyzer_class):
        cls.analyzer_by_key[key] = analyzer_class

    @classmethod
    def setup_analyzers(cls, config):
        def import_class(path):
            module, class_name = path.rsplit(".", 1)
            return getattr(importlib.import_module(module), class_name)

        for key, value in (config.autoanysrc_analyzers or {}).items():
            cls.register_analyzer(key, import_class(value))

    def info(self, msg):
        logger.info("    <autoanysrc> %s", msg)

    def collect_files(self):
        arg = self.options.src
        if arg is None:
            return []
        if not os.path.isabs(arg):
            arg = os.path.join(self.directive.env.srcdir, arg)
        self.info("collect by: " + bold(arg))
        return glob.glob(arg)

    def process(self):
        """Process files one by one with the analyzer."""
        for filepath in self.collect_files():
            self.info(
                "%s processing: " % self.analyzer.__class__.__name__ + bold(filepath)
            )
            self.directive.env.note_dependency(filepath)

            with codecs.open(filepath, "r", "utf-8") as f:
                content = f.read()

            for line, lineno in self.analyzer.process(content):
                self.add_line(line, filepath, lineno)

    def generate(
        self,
        more_content=None,
        real_modname=None,
        check_module=False,
        all_members=False,
    ):
        analyzer_class = self.analyzer_by_key.get(self.options.analyzer)
        if not analyzer_class:
            self.info("Analyzer not defined for: %s" % self.options.analyzer)
            return
        self.analyzer = analyzer_class(self)

        self.add_line("", "<autoanysrc>")

        # set default domain if it is specified in the analyzer
        if hasattr(self.analyzer, "domain"):
            self.add_line(
                ".. default-domain:: %s" % self.analyzer.domain, "<autoanysrc>"
            )
            self.add_line("", "<autoanysrc>")

        self.process()


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


def setup_custom_analyzers(app):
    AnySrcDocumenter.setup_analyzers(app.builder.config)


def setup(app):
    app.setup_extension("sphinx.ext.autodoc")
    app.add_config_value("autoanysrc_analyzers", None, False)
    app.add_autodocumenter(AnySrcDocumenter)
    app.connect("builder-inited", setup_custom_analyzers)
    app.connect("builder-inited", build_init)
    return {"parallel_read_safe": True}
