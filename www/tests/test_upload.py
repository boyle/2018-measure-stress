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


@pytest.mark.parametrize(('files', 'patient', 'session', 'message'), (
    ('', '', '', b'no file'),
    ('a', '', '', b'no patient ID'),
    ('a', 'a', '', b'no session number'),
    ('a', 'a', 'a', b'non-numeric patient ID'),
    ('a', '1', 'a', b'non-numeric session number'),
    ('a', '-1', '1', b'bad patient ID'),
    ('a', '1', '-1', b'bad session number'),
))
def test_bad_post(client, auth, files, patient, session, message):
    auth.login()
    data = {'patient': patient, 'session': session}
    data = {key: str(value) for key, value in data.items()} # int to str
    data['files'] = (io.BytesIO(b'a test'), files)
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
    data['files'] = list()
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
    data['files'] = (io.BytesIO(b'a test'), 'test.txt')
    response = client.post(
        '/upload/',
        content_type='multipart/form-data',
        data = data
    )
    assert response.status_code == 200
    assert b'test.txt: stored' in response.data
    assert b'upload completed' in response.data
    path = os.path.join(base, str(patient), str(session))
    assert os.path.isfile(os.path.join(path, 'test.txt'))

    data = {'patient': patient, 'session': session}
    data = {key: str(value) for key, value in data.items()} # int to str
    data['files'] = (io.BytesIO(b'a test'), 'test.txt')
    response = client.post(
        '/upload/',
        content_type='multipart/form-data',
        data = data
    )
    assert response.status_code == 200
    assert b'test.txt: stored' in response.data
    assert b'upload completed' in response.data
    assert os.path.isfile(os.path.join(path, 'test.txt.0'))

    data = {'patient': patient, 'session': session}
    data = {key: str(value) for key, value in data.items()} # int to str
    data['files'] = (io.BytesIO(b'a test'), '../..')
    response = client.post(
        '/upload/',
        content_type='multipart/form-data',
        data = data
    )
    assert response.status_code == 200
    assert b'../..: skipped' in response.data
    assert b'upload completed' in response.data
    base = app.config['UPLOAD_FOLDER']
    path = os.path.join(base, str(patient), str(session))
    assert not os.path.isfile(os.path.join(path, 'test.txt.1'))
