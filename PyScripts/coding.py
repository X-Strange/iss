# coding=utf-8
__author__ = 'daniel'
import sys

reload(sys)
sys.setdefaultencoding("utf-8")
import unicodedata


def remove_accents(input_str):
    nkfd_form = unicodedata.normalize('NFKD', unicode(input_str))
    return u"".join([c for c in nkfd_form if not unicodedata.combining(c)])

