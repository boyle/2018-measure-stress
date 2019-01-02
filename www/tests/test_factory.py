import os
import shutil

from bikeshed import create_app


def test_config():
    assert not create_app().testing
    assert create_app({'TESTING': True}).testing


def test_hello(client):
    response = client.get('/hello')
    assert response.data == b'Hello, World!'

def load_letsencrypt(filename, content='letsencryptTEST'):
    path = os.path.join('.well-known', 'acme-challenge')
    try:
        os.makedirs(path)
    except OSError:
        pass
    f = open(os.path.join(path, filename), 'w')
    f.write(content)
    f.close()


def test_letsencrypt(client):
    filename = '3LiFv2E6SH0G82EFUhdPuFDDNoFtUnj4J8bHiRM2c_g'
    load_letsencrypt(filename)

    response = client.get('/.well-known/acme-challenge/' + filename)
    assert response.data == b'letsencryptTEST'

    response = client.get('/api/.well-known/acme-challenge/' + filename)
    assert response.data == b'letsencryptTEST'
