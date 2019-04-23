import io
import os
import shutil
import pytest
from flask import g, session, url_for
from bikeshed.db import get_db

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
    data = {k: str(v) for k, v in data.items() if v is not None} # int to str
    data['file'] = (io.BytesIO(b'a test'), file)
    response = client.post(
        '/upload/',
        content_type='multipart/form-data',
        data = data
    )
    assert message in response.data


def test_empty_post(client, auth):
    auth.login()
    data = {'patient': 1, 'session': 1}
    data = {key: str(value) for key, value in data.items()} # int to str
    data['file'] = list()
    response = client.post(
        '/upload/',
        content_type='multipart/form-data',
        data = data
    )
    assert b'no file' in response.data


def test_good_post(client, auth, app):
    patient = 10
    session = 11
    base = app.config['UPLOAD_FOLDER']
    path = os.path.join(base, str(patient))
    shutil.rmtree(path, ignore_errors=True)

    auth.login()
    data = {'patient': patient, 'session': session}
    data = {key: str(value) for key, value in data.items()} # int to str
    data['file'] = (io.BytesIO(b'a test'), 'test.txt')
    response = client.post(
        '/upload/',
        content_type='multipart/form-data',
        data = data
    )
    assert response.status_code == 200
    #assert b'test.txt: stored' in response.data
    #assert b'upload completed' in response.data
    path = os.path.join(base, str(patient), str(session))
    assert os.path.isfile(os.path.join(path, 'test.txt'))

    data = {'patient': patient, 'session': session}
    data = {key: str(value) for key, value in data.items()} # int to str
    data['file'] = (io.BytesIO(b'a test'), 'test.txt')
    response = client.post(
        '/upload/',
        content_type='multipart/form-data',
        data = data
    )
    assert response.status_code == 200
    #assert b'test.txt: stored' in response.data
    #assert b'upload completed' in response.data
    assert os.path.isfile(os.path.join(path, 'test.txt.0'))

    data = {'patient': patient, 'session': session}
    data = {key: str(value) for key, value in data.items()} # int to str
    data['file'] = (io.BytesIO(b'a test'), '../..')
    response = client.post(
        '/upload/',
        content_type='multipart/form-data',
        data = data
    )
    assert response.status_code == 200 # TODO should report 400 (bad filename)
    #assert b'../..: skipped' in response.data
    #assert b'upload completed' in response.data
    base = app.config['UPLOAD_FOLDER']
    path = os.path.join(base, str(patient), str(session))
    assert not os.path.isfile(os.path.join(path, 'test.txt.1'))

    data = {'patient': patient, 'session': session}
    data = {key: str(value) for key, value in data.items()} # int to str
    data['file'] = [(io.BytesIO(b'a test'), 'test.txt'), (io.BytesIO(b'a test 2'), 'test2.txt')]
    response = client.post(
        '/upload/',
        content_type='multipart/form-data',
        data = data
    )
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


def test_flowjs_get(client, auth):
    auth.login()
    data = {'flowIdentifier': 'test'}
#    data = {key: str(value) for key, value in data.items()} # int to str
    assert client.get('/upload/', query_string = data).status_code == 500

def test_flowjs_post(client, auth):
    auth.login()
    data = {'patient': 1, 'session': 1, 'flowTotalChunks': 2}
    data = {key: str(value) for key, value in data.items()} # int to str
    data['file'] = (io.BytesIO(b'a test'), 'test.txt')
    assert client.post('/upload/', data = data).status_code == 200

def test_flowjs_post_too_many_files(client, auth):
    auth.login()
    data = {'patient': 1, 'session': 1, 'flowTotalChunks': 2}
    data = {key: str(value) for key, value in data.items()} # int to str
    data['file'] = [(io.BytesIO(b'a test'), 'test.txt'), (io.BytesIO(b'a test 2'), 'test2.txt')]
    assert client.post('/upload/',
                       content_type='multipart/form-data',
                       data = data).status_code == 400
