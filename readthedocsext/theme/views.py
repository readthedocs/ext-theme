import random

from django.http.response import HttpResponseRedirect
from django.shortcuts import get_object_or_404
from django.views.generic.base import TemplateView
from readthedocs.projects.models import Project


class AvatarImageBaseView(TemplateView):

    """
    Base view for project, organization, team or user avatars.
    """

    http_method_names = ["get", "head", "options"]

    template_name = "theme/images/avatar.svg"
    content_type = "image/svg+xml"

    COLORS = [
        "#0993af",
        "#0090b7",
        "#008bbe",
        "#0087c5",
        "#0081cb",
        "#007bcf",
        "#1d73d1",
        "#446bd0",
        "#6060cc",
        "#7854c5",
    ]

    def get(self, request, *args, **kwargs):
        self.object = self.get_object()
        remote_avatar_url = self.get_remote_avatar_url()
        if remote_avatar_url:
            return HttpResponseRedirect(remote_avatar_url)
        else:
            context = self.get_context_data()
            return self.render_to_response(context)

    def get_object(self):
        raise NotImplementedError

    def get_queryset(self):
        raise NotImplementedError

    def get_remote_avatar_url(self):
        raise NotImplementedError

    def get_avatar_color(self):
        random.seed(self.object.pk)
        return random.choice(self.COLORS)

    def get_avatar_letters(self):
        raise NotImplementedError

    def get_context_data(self):
        # Truncate letters, we want a max of 4
        letters = self.get_avatar_letters()[0:5]
        return {
            "letters": letters.lower(),
            # Font size is proportional to the number of letters
            "font_size": 55 - (max(0, len(letters)) * 5),
            "background_color": self.get_avatar_color(),
        }


class AvatarImageProjectView(AvatarImageBaseView):
    def get_queryset(self):
        return Project.objects.public(self.request.user)

    def get_object(self):
        queryset = self.get_queryset()
        project_slug = self.kwargs.get("project_slug")
        return get_object_or_404(
            queryset,
            slug=project_slug,
        )

    def get_remote_avatar_url(self):
        try:
            return self.object.remote_repository.avatar_url
        except (AttributeError, ValueError):
            return

    def get_avatar_letters(self):
        # Try using the project name first, as the slug could have an organization slug
        # prepended to the project slug (this leads to redundant acronyms).
        words = self.object.name.split(" ")
        # However, some project names are just something machine readable
        # anyways. See if the slug produces a longer acronym
        slug_words = self.object.slug.split("-")
        if len(slug_words) > len(words):
            words = slug_words
        # Don't make the acronym too long, truncate it
        return "".join([word[0:1] for word in words])
