from flask import request
import json
from util.logger import log


def extract_payload():
    # GET-запросы не имеют тела — берём параметры из query string
    if request.method == 'GET':
        return request.args.to_dict()

    # Для POST — разбираем Content-Type
    content_type = request.headers.get('Content-Type', '')
    raw = request.data or b''

    if 'application/json' in content_type:
        data = request.get_json(silent=True)
        if isinstance(data, dict):
            return data
        try:
            return json.loads(raw.decode('utf-8'))
        except Exception:
            return {}

    if 'application/x-www-form-urlencoded' in content_type:
        return request.form.to_dict()

    # Если тело пустое — возвращаем пустой dict
    if not raw.strip():
        return {}

    # fallback: пробуем JSON
    try:
        return json.loads(raw.decode('utf-8'))
    except Exception:
        return {}

