# -*- coding: utf-8 -*-

import re

project = 'RTD Redesign'
slug = re.sub(
    r'[-]+',
    '-',
    re.sub(
        r'[^a-z0-9]+',
        '-',
        project.lower()
    ).strip('-')
)
copyright = '2019, Read the Docs, Inc'
author = 'Read the Docs, Inc'
version = '1.0'
release = '1.0'
language = None

extensions = []

templates_path = ['_templates']
source_suffix = '.rst'
master_doc = 'index'
exclude_patterns = ['_build', 'Thumbs.db', '.DS_Store']
pygments_style = None

html_theme = 'alabaster'
html_static_path = ['_static']
htmlhelp_basename = slug

latex_documents = [
    (master_doc, f'{slug}.tex', project, author, 'manual'),
]

man_pages = [
    (master_doc, slug, project, [author], 1),
]

texinfo_documents = [
    (master_doc, slug, project, author, slug, project, 'Miscellaneous'),
]

epub_title = project
epub_exclude_files = ['search.html']
