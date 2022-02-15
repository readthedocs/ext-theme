"""
readthedocsext-theme doc extensions
"""

from sphinxcontrib.autoanysrc import analyzers


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
