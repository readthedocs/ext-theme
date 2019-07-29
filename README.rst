Read the Docs - ext-theme
=========================

Installation
------------

Update your settings::

    TEMPLATES = [{
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'OPTIONS': {
            'loaders': [
                'readthedocsext.theme.loaders.ExternalFilesystemLoader',
                'django.template.loaders.app_directories.Loader',
            ],
        },
    }]

    INSTALLED_APPS = [
        ...
        'readthedocsext.theme',
    ]
