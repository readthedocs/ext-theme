import os

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "readthedocsext.theme.settings.test")
from django.core import management

if __name__ == "__main__":
    management.execute_from_command_line()
