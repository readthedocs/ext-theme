from urllib.parse import urljoin

from django import template
from django.conf import settings
from django.templatetags.static import StaticNode, PrefixNode
from django.forms import boundfield


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


@register.simple_tag(name="get_webpack_static_prefix")
def do_get_webpack_static_prefix():
    """
    Emulates what {% get_static_prefix %} does considering local dev server.

    If the local dev webpack server is being used, it return this prefix.
    Otherwise, it fallbacks to regular STATIC_URL setting.
    """
    webpack_server = getattr(settings, "RTD_EXT_THEME_DEV_SERVER", None)
    static_url = getattr(settings, "STATIC_URL", None)
    return (webpack_server or static_url).rstrip("/")


@register.simple_tag(name="debug_enabled")
def debug_enabled():
    """
    Helper for testing for debug mode, minus INTERNAL_IPS.
    """
    return getattr(settings, "DEBUG", False)


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
    extra_fields = provider.extract_common_fields(socialaccount.extra_data)
    return extra_fields.get("username") or extra_fields.get("email")
