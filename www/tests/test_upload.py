import io
import os
import shutil
from time import time
import pytest


def test_login_required(client, auth):
    auth.logout()
    response = client.get('/upload/')
    assert response.status_code == 302
    assert response.headers['Location'] == 'http://localhost/auth/login'
    response = client.post('/upload/')
    assert response.status_code == 302
    assert response.headers['Location'] == 'http://localhost/auth/login'


def test_redirect(client, auth):
    auth.logout()
    response = client.get('/upload', follow_redirects=False)
    assert response.status_code == 301
    assert response.headers['Location'] == 'http://localhost/upload/'
    response = client.post('/upload', follow_redirects=False)
    assert response.status_code == 301
    assert response.headers['Location'] == 'http://localhost/upload/'


def test_get(client, auth):
    auth.login()
    assert client.get('/upload/').status_code == 200


@pytest.mark.parametrize(('file', 'patient', 'session', 'message'), (
    (None, None, None, b'no file'),
    ('', None, None, b'no file'),
    ('a', None, None, b'no Patient number'),
    ('a', '', None, b'no Patient number'),
    ('a', '1', None, b'no Session number'),
    ('a', '1', '', b'no Session number'),
    ('a', 'a', '1', b'no Patient number'),
    ('a', '1', 'a', b'no Session number'),
    ('a', '-1', '1', b'no Patient number'),
    ('a', '1', '-1', b'no Session number'),
))
def test_bad_post(client, auth, file, patient, session, message):
    auth.login()
    data = {'patient': patient, 'session': session}
    data = {k: str(v) for k, v in data.items() if v is not None}  # int to str
    data['file'] = (io.BytesIO(b'a test'), file)
    response = client.post('/upload/', content_type='multipart/form-data',
                           data=data)
    assert message in response.data


def test_empty_post(client, auth):
    auth.login()
    data = {'patient': 1, 'session': 1}
    data = {key: str(value) for key, value in data.items()}  # int to str
    data['file'] = list()
    response = client.post('/upload/', content_type='multipart/form-data',
                           data=data)
    assert b'no file' in response.data


def test_good_post(client, auth, app):
    patient = 10
    session = 11
    base = app.config['UPLOAD_FOLDER']
    path = os.path.join(base, str(patient))
    shutil.rmtree(path, ignore_errors=True)

    auth.login()
    data = {'patient': patient, 'session': session}
    data = {key: str(value) for key, value in data.items()}  # int to str
    data['file'] = (io.BytesIO(b'a test'), 'test.txt')
    response = client.post('/upload/', content_type='multipart/form-data',
                           data=data)
    assert response.status_code == 200
    #assert b'test.txt: stored' in response.data
    #assert b'upload completed' in response.data
    path = os.path.join(base, str(patient), str(session))
    assert os.path.isfile(os.path.join(path, 'test.txt'))

    data = {'patient': patient, 'session': session}
    data = {key: str(value) for key, value in data.items()}  # int to str
    data['file'] = (io.BytesIO(b'a test'), 'test.txt')
    response = client.post('/upload/', content_type='multipart/form-data',
                           data=data)
    assert response.status_code == 200
    #assert b'test.txt: stored' in response.data
    #assert b'upload completed' in response.data
    assert os.path.isfile(os.path.join(path, 'test.txt.0'))

    data = {'patient': patient, 'session': session}
    data = {key: str(value) for key, value in data.items()}  # int to str
    data['file'] = (io.BytesIO(b'a test'), '../..')
    response = client.post('/upload/', content_type='multipart/form-data',
                           data=data)
    assert response.status_code == 200 # TODO should report 400 (bad filename)
    #assert b'../..: skipped' in response.data
    #assert b'upload completed' in response.data
    base = app.config['UPLOAD_FOLDER']
    path = os.path.join(base, str(patient), str(session))
    assert not os.path.isfile(os.path.join(path, 'test.txt.1'))

    data = {'patient': patient, 'session': session}
    data = {key: str(value) for key, value in data.items()} # int to str
    data['file'] = [(io.BytesIO(b'a test'), 'test.txt'), (io.BytesIO(b'a test 2'), 'test2.txt')]
    response = client.post('/upload/', content_type='multipart/form-data',
                           data=data)
    assert response.status_code == 200
    assert os.path.isfile(os.path.join(path, 'test.txt.1'))
    assert os.path.isfile(os.path.join(path, 'test2.txt'))
    assert not os.path.isfile(os.path.join(path, 'test.txt.2'))
    assert not os.path.isfile(os.path.join(path, 'test2.txt.0'))

def test_flowjs_login_required(client, auth):
    auth.logout()
    response = client.get('/upload/')
    assert response.status_code == 302
    assert response.headers['Location'] == 'http://localhost/auth/login'
    response = client.post('/upload/')
    assert response.status_code == 302
    assert response.headers['Location'] == 'http://localhost/auth/login'


def test_flowjs_redirect(client, auth):
    auth.logout()
    response = client.get('/upload', follow_redirects=False)
    assert response.status_code == 301
    assert response.headers['Location'] == 'http://localhost/upload/'
    response = client.post('/upload', follow_redirects=False)
    assert response.status_code == 301
    assert response.headers['Location'] == 'http://localhost/upload/'


@pytest.mark.parametrize(('chunknum','size','filename','code'), (
    (1, 6, 'test.txt', 200),
    (1, 1, 'test.txt', 400),
    (1, 6, 'test123.txt', 404),
    (2, 6, 'test.txt', 200),
    (2, 1, 'test.txt', 400),
    (2, 6, 'test123.txt', 404),
))
def test_flowjs_get(client, auth, chunknum, size, filename, code):
    auth.login()
    for n in range(0, chunknum):
        test_flowjs_post(client, auth, n+1, 6, 200)
    data = {'patient': 1, 'session': 1,
            'flowFilename': filename,
            'flowTotalChunks': 2,
            'flowCurrentChunkSize': size,
            'flowTotalSize': size*2,
            'flowChunkNumber': chunknum,
    }
    response = client.get('/upload/', query_string = data)
    print(str(response.data))
    assert response.status_code == code

@pytest.mark.parametrize(('chunknum','size','code'), (
    (2, 6, 400),
    (1, 1, 400),
    (1, 6, 200),
    (2, 1, 400),
    (2, 6, 200),
))
def test_flowjs_post(client, auth, chunknum, size, code, filename='test.txt'):
    auth.login()
    data = {'patient': 1, 'session': 1,
            'flowTotalChunks': 2,
            'flowCurrentChunkSize': size,
            'flowTotalSize': size*2,
            'flowChunkNumber': chunknum,
    }
    data = {key: str(value) for key, value in data.items()} # int to str
    data['file'] = (io.BytesIO(b'a test'), filename)
    response = client.post('/upload/', data = data)
    print(str(response.data))
    assert response.status_code == code

def test_flowjs_post_inconsistent_filename(client, auth):
    auth.login()
    data = {'patient': 1, 'session': 1,
            'flowFilename': 'abc.txt',
    }
    data = {key: str(value) for key, value in data.items()} # int to str
    data['file'] = (io.BytesIO(b'a test'), 'test.txt')
    response = client.post('/upload/', data=data)
    print(str(response.data))
    assert response.status_code == 400
    assert b'error: flowFilename != file' in response.data

def test_flowjs_post_too_many_files(client, auth):
    auth.login()
    data = {'patient': 1, 'session': 1, 'flowTotalChunks': 2}
    data = {key: str(value) for key, value in data.items()} # int to str
    data['file'] = [(io.BytesIO(b'a test'), 'test.txt'), (io.BytesIO(b'a test 2'), 'test2.txt')]
    assert client.post('/upload/',
                       content_type='multipart/form-data',
                       data = data).status_code == 400


def test_flowjs_cleanup(client, app, auth):
    auth.login()
    base = app.config['UPLOAD_FOLDER']
    tmppath = os.path.join(base, 'tmp')
    shutil.rmtree(tmppath, ignore_errors=True)
    test_flowjs_post(client, auth, 1, 6, 200, 'test1.txt')
    test_flowjs_post(client, auth, 1, 6, 200, 'test2.txt')
    test_flowjs_post(client, auth, 1, 6, 200, 'test3.txt')
    test_flowjs_post(client, auth, 2, 6, 200, 'test3.txt')
    print(tmppath)
    assert os.path.isdir(tmppath)
    assert os.path.isfile(os.path.join(tmppath,'1-1-test1.txt.part1'))
    assert os.path.isfile(os.path.join(tmppath,'1-1-test2.txt.part1'))
    assert not os.path.isfile(os.path.join(tmppath,'1-1-test3.txt.part1'))

    now = time()
    mtime = now - 10 * 86400;  # - 10 days in the past
    atime = mtime
    os.utime(os.path.join(tmppath,'1-1-test1.txt.part1'), (atime, mtime))

    test_flowjs_post(client, auth, 1, 6, 200, 'test3.txt')
    test_flowjs_post(client, auth, 2, 6, 200, 'test3.txt')
    assert not os.path.isfile(os.path.join(tmppath,'1-1-test1.txt.part1'))
    assert os.path.isfile(os.path.join(tmppath,'1-1-test2.txt.part1'))
    assert not os.path.isfile(os.path.join(tmppath,'1-1-test3.txt.part1'))

# TODO hitting cleanup exception (file removed by another process) requires mocking using pytest
