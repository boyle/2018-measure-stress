#! /usr/bin/python3
from flipflop import WSGIServer
from bikeshed import app

if __name__ == '__main__':
   WSGIServer(app).run()
