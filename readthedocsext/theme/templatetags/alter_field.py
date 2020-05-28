import re

from django import template
from django.template import Context
from django.template.loader import get_template
from django.forms import boundfield

from crispy_forms.utils import TEMPLATE_PACK

register = template.Library()


@register.simple_tag(name="alter_field", takes_context=True)
def alter_field(context, field, data_bind=None, classes=None):
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
