"""Custom template loader"""

import os

from django.template.loaders.filesystem import Loader


class ExternalFilesystemLoader(Loader):

    """Loader that loads external template directories before others"""

    def get_dirs(self):
        from readthedocsext import theme
        dirs = super(ExternalFilesystemLoader, self).get_dirs()
        path = os.path.join(os.path.dirname(theme.__file__), 'templates')
        try:
            return [path] + dirs
        except TypeError:
            return [path]
