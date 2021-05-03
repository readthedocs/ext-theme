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
        webpack_server = getattr(settings, 'RTD_EXT_THEME_DEV_SERVER', None)
        if webpack_server is not None:
            return urljoin(
                PrefixNode.handle_simple('RTD_EXT_THEME_DEV_SERVER'),
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


@register.simple_tag(name="alter_field", takes_context=True)
def alter_field(context, field, data_bind=None, classes=None, label_classes=None):
    if not isinstance(field, boundfield.BoundField) and settings.DEBUG:
        raise Exception("data_bind got passed an invalid or inexistent field")
    if data_bind is not None:
        field.field.widget.attrs['data-bind'] = data_bind
    if classes is not None:
        field.field.widget.attrs['class'] = classes
    return ''


@register.filter(name="data_bind")
def add_data_bind(field, data_bind):
    """
    Adds data bind attribute to field

    Usage::

        {{ field|data_bind:"visible: is_visible" }}

    """
    if not isinstance(field, boundfield.BoundField) and settings.DEBUG:
        raise Exception("|data_bind got passed an invalid or inexistent field")
    field.field.widget.attrs['data-bind'] = data_bind
    return field