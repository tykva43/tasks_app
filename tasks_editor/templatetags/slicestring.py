from django import template
from django.template.defaultfilters import stringfilter

register = template.Library()

@register.filter(name='slicestring')
@stringfilter
def slicestring(value, arg):
    """usage: "mylongstring"|slicestring:"2:4" """
    els = arg.split(':')
    return value[int(els[0]):int(els[1])]
