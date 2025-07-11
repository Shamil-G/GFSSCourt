from flask import  request
from gfss_parameter import platform, http_ip_context
from main_app import log

def ip_addr():
    if platform=='unix':
        log.info(f"UNIX. IP_ADDR: {request.environ.get(http_ip_context, '')}\n\http_ip_context: {http_ip_context}t")
        return request.environ.get(http_ip_context, '')
    else:
        log.info(f"NOT UNIX. IP_ADDR: {request.environ.get(http_ip_context, '')}")
        return request.remote_addr