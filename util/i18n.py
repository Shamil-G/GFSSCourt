from typing import List, Any
import os.path
from flask import session
from gfss_parameter import platform, BASE
from util.logger import log
from app_config import src_lang, language
from db.connect import get_connection


class I18N:
    file_names: List[Any] = []
    files: List[Any] = []
    objects: List[Any] = []

    def get_resource(self, lang, resource_name):
        if not resource_name: return ''
        file_object = ''
        return_value = ''
        file_name = f'{BASE}/i18n.{lang}'
        if platform == 'unix':
            file_name = f'{BASE}/i18nu.{lang}'
        n_objects = 0

        for f_name in self.file_names:
            if f_name == file_name:
                file_object = self.objects[n_objects]
                break
            n_objects = n_objects + 1

        if file_object == '' and os.path.exists(file_name):
            file = open(file_name, "r")
            if file is not None:
                self.file_names.append(file_name)
                self.files.append(file)
                file_object = file.read()
                self.objects.append(file_object)

        if file_object != '':
            for line in file_object.splitlines():
                if resource_name in line:
                    return_value = line.split('=', 1)[1]
                    break
        if return_value == '':
            return_value = resource_name
        return return_value

    def close(self):
        log.info("I18N. CLOSE")
        for file in self.files:
            file.close()
        self.file_names.clear()
        self.files.clear()
        self.objects.clear()


i18n = I18N()

def get_i18n_value(res_name):
    if 'language' in session:
        lang = session['language']
    else:
        lang = language
        session['language'] = language
    if src_lang == 'db':
        with get_connection().cursor() as cursor:
            return_value = cursor.callfunc("i18n.get_value", str, [lang, res_name])
    if src_lang == 'file':
        return_value = i18n.get_resource(lang, res_name)
    return return_value