import logging
from logging.handlers import RotatingFileHandler
from app_config import LOG_PATH
from gfss_parameter import app_name, debug


def init_logger():
    logger = logging.getLogger('AKTUAR-GFSS')
    # logging.getLogger('PDD').addHandler(logging.StreamHandler(sys.stdout))
    # Console
    logging.getLogger('AKTUAR-GFSS').addHandler(logging.StreamHandler())
    if debug:
        logger.setLevel(logging.DEBUG)
    else:
        logger.setLevel(logging.INFO)
        
    fh = logging.FileHandler(f"{LOG_PATH}/{app_name.lower()}.log", encoding="UTF-8")

    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    fh.setFormatter(formatter)

    logger.addHandler(fh)
    logger.info('Протокол для расчета провизии стартован...')
    return logger


log = init_logger()