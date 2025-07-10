from __init__ import app, log
from app_config import host, port
# Not delete next line!
from view.routes import *

from sso.user_login_sso import *


if __name__ == "__main__":
    log.info(f'Application COURT starting. HOST: {host}, PORT: {port}')
    app.run(host=host, port=port, debug=debug)
