# pylint: disable=missing-docstring

from django.urls import re_path
from readthedocs.constants import pattern_opts

from .views import AvatarImageProjectView

urlpatterns = [
    re_path(
        r"avatar/project/(?P<project_slug>{project_slug})/$".format(**pattern_opts),
        AvatarImageProjectView.as_view(),
        name="theme_avatar_project",
    ),
]
