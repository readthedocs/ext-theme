import logging
from urllib.parse import urljoin

from django import template
from django.conf import settings
from django.templatetags.i18n import (
    language_name_local,
    language_name,
    language_name_translated,
)
from django.templatetags.static import StaticNode, PrefixNode
from django.forms import boundfield
from allauth.socialaccount.templatetags.socialaccount import (
    get_providers as base_get_providers,
)

log = logging.getLogger(__name__)
register = template.Library()


class WebpackStaticNode(StaticNode):

    """
    Like static template tag, but for Webpack dev server assets

    A wrapper around static template tag to optionally load static assets from
    a Webpack dev server instance. This enables live reloading for the theme
    assets.
    """

    @classmethod
    def handle_simple(cls, path):
        webpack_server = getattr(settings, "RTD_EXT_THEME_DEV_SERVER", None)
        if webpack_server is not None:
            return urljoin(
                PrefixNode.handle_simple("RTD_EXT_THEME_DEV_SERVER"),
                path,
            )
        else:
            return StaticNode.handle_simple(path)


@register.tag("webpack_static")
def do_webpack_static(parser, token):
    """
    Join the given path with the RTD_EXT_THEME_DEV_SERVER setting.
    Usage::
        {% webpack_static path [as varname] %}
    Examples::
        {% webpack_static "myapp/css/base.css" %}
        {% webpack_static variable_with_path %}
        {% webpack_static "myapp/css/base.css" as admin_base_css %}
        {% webpack_static variable_with_path as varname %}

    Extended from Django ``static`` templatetag.
    """
    return WebpackStaticNode.handle_token(parser, token)


@register.simple_tag(name="settings_dashboard")
def settings_dashboard():
    """
    Configure dashboard from application settings.

    This uses application settings and passes a dictionary to templates, for use
    in a `json_script` filter. The site JS loads this JSON configuration.
    """
    # Prefix for static URLs, either from Webpack dev server or the standard
    # static URL
    webpack_server = getattr(settings, "RTD_EXT_THEME_DEV_SERVER", None)
    static_url = getattr(settings, "STATIC_URL", None)
    public_path_prefix = (webpack_server or static_url).rstrip("/")

    return {
        "debug": getattr(settings, "DEBUG", False),
        "webpack_public_path": f"{public_path_prefix}/readthedocsext/theme/",
        "production_domain": settings.PRODUCTION_DOMAIN,
        "sentry": getattr(settings, "SENTRY_BROWSER", {}),
    }


@register.simple_tag(name="alter_field", takes_context=True)
def alter_field(context, field, data_bind=None, classes=None, label_classes=None):
    if not isinstance(field, boundfield.BoundField) and settings.DEBUG:
        raise Exception("data_bind got passed an invalid or inexistent field")
    if data_bind is not None:
        field.field.widget.attrs["data-bind"] = data_bind
    if classes is not None:
        field.field.widget.attrs["class"] = classes
    return ""


@register.filter(name="data_bind")
def add_data_bind(field, data_bind):
    """
    Adds data bind attribute to field

    Usage::

        {{ field|data_bind:"visible: is_visible" }}

    """
    if not isinstance(field, boundfield.BoundField) and settings.DEBUG:
        raise Exception("|data_bind got passed an invalid or inexistent field")
    field.field.widget.attrs["data-bind"] = data_bind
    return field


# TODO move this to the socialacccount app
@register.filter(name="get_account_username")
def get_account_username(socialaccount):
    """
    Return Allauth provider account username/email instead of default to_str()

    The default way that Allauth shows provider accounts is with a "display
    name", which can be a full name set up on the account profile. Instead, we
    always want to show the username or email attached to the account, not the
    name of the human attached to said account.
    """
    provider = socialaccount.get_provider()
    # SAML doesn't store the username in extra_data,
    # and extract_common_fields doesn't expect a dictionary, but an object.
    if provider.id == "saml":
        return socialaccount.user.email
    extra_fields = provider.extract_common_fields(socialaccount.extra_data)
    return extra_fields.get("username") or extra_fields.get("email")


@register.filter
def get_spam_score(project):
    try:
        from readthedocsext.spamfighting.utils import spam_score
    except ImportError:
        return 0

    return spam_score(project)


@register.simple_tag(takes_context=True)
def get_providers(context, process="login"):
    """
    Adds additional app setting support and sorting to the Allauth provider list tag.

    There are multiple app settings checked to determine if we show the
    provider to the user and which order:

    ``hidden`` (bool)
        This comes from the base Allauth tag

    ``hidden_on_login``/``hidden_on_connect``/``hidden_on_{process}`` (bool)
        Hide the provider from the Allauth process view

    ``priority``
        Priority order value for list of providers, higher values are lower in priority on the list.

    Additionally, filter out providers from the database -- applications that
    have a ``pk`` -- these are per-user applications like SAML.
    """
    # The base Allauth ``get_providers`` tag filters out providers marked as hidden in our settings file.
    providers = [
        provider
        for provider in base_get_providers(context)
        if not provider.app.settings.get(f"hidden_on_{process}", False)
        and not provider.app.pk
    ]
    return sorted(
        providers, key=lambda provider: provider.app.settings.get("priority", 100)
    )


# TODO remove this after we don't need to separate the providers with a modal
@register.simple_tag(takes_context=True)
def get_github_providers(context, process="login"):
    providers = get_providers(context, process)
    return list(filter(lambda provider: "github" in provider.id, providers))


# Simple solution to not supported "zh" language code.
#
# When `project.language="zh"` the Django `language_name_local` raises an exception and returns 500.
# This simple solution checks for this unsupported language code and replace it by "zh-cn" (Simplified Chinese).
# We need to decide what to do at the DB level still, but at least this approach solves the immediate issue.
@register.filter
def readthedocs_language_name(lang_code):
    try:
        if lang_code == "zh":
            return language_name("zh-cn")
        return language_name(lang_code)
    except Exception:
        log.exception("Error getting language name")
        return lang_code


@register.filter
def readthedocs_language_name_translated(lang_code):
    try:
        if lang_code == "zh":
            return language_name_translated("zh-cn")
        return language_name_translated(lang_code)
    except Exception:
        log.exception("Error getting language name")
        return lang_code


@register.filter
def readthedocs_language_name_local(lang_code):
    try:
        if lang_code == "zh":
            return language_name_local("zh-cn")
        return language_name_local(lang_code)
    except Exception:
        log.exception("Error getting language name")
        return lang_code
