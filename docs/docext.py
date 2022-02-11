"""
readthedocsext-theme doc extensions
"""

from sphinxcontrib.autoanysrc import analyzers


class DjangoTemplateAnalyzer(analyzers.BaseCommentAnalyzer):

    """There are a few errors with this docstring
    but black will not reformat any of this"""

    # domain = ''

    comment_starts_with = '{% comment "rst" %}'
    comment_ends_with = "{% endcomment %}"
