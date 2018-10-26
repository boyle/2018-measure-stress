#! /usr/bin/python3

import site
site.addsitedir('/var/www/html/venv/lib/python3.6/site-packages')

from flipflop import WSGIServer
from bikeshed import create_app

if __name__ == '__main__':
   WSGIServer(create_app()).run()
