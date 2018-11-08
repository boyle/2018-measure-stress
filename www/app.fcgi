#! /usr/bin/python3

import site
import os
site.addsitedir('/var/www/html/venv/lib/python3.6/site-packages')
os.environ["BIKESHED_SETTINGS"] = "/var/www/rawdata/config.py"

from flipflop import WSGIServer
from bikeshed import create_app

if __name__ == '__main__':
   WSGIServer(create_app()).run()
