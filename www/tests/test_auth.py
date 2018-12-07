import os, shutil
import pytest
from flask import g, session
from bikeshed.db import get_db



@pytest.mark.parametrize(('username', 'existing_dir'), (
    ('a', False),
    ('b', True),
))
def test_register(client, app, username, existing_dir):
    base = app.config['USER_FOLDER']
    path = os.path.join(base, str(3))
    shutil.rmtree(path, ignore_errors=True)
    if existing_dir:
       try:
           os.makedirs(path)
       except OSError:
           pass
    assert os.path.isdir(path) == existing_dir

    assert client.get('/auth/register').status_code == 200
    response = client.post(
        '/auth/register', data={'username': username, 'password': 'a', 'authorization': 'c'}
    )
    assert 'http://localhost/auth/login' == response.headers['Location']
    assert response.status_code == 303
    assert os.path.isdir(path)

    with app.app_context():
        row = get_db().execute(
            "select * from user where username = ?", (username)
        ).fetchone()
        assert response is not None
        assert row['id'] == 3


@pytest.mark.parametrize(('username', 'password', 'authorization', 'message'), (
    ('', '', '', b'Username is required.'),
    ('a', '', '', b'Password is required.'),
    ('a', 'a', '', b'Authorization key is required.'),
    ('a', 'a', 'a', b'Incorrect authorization key.'),
    ('test', 'test', 'a', b'Incorrect authorization key.'),
    ('test', 'test', 'c', b'already registered'),
))
def test_register_validate_input(client, username, password,
                                 authorization, message):
    response = client.post(
        '/auth/register',
        data={'username': username,
              'password': password,
              'authorization': authorization}
    )
    assert message in response.data


def test_login(client, auth):
    assert client.get('/auth/login').status_code == 401
    response = auth.login()
    assert response.headers['Location'] == 'http://localhost/'

    with client:
        client.get('/')
        assert session['user_id'] == 1
        assert g.user['username'] == 'test'


@pytest.mark.parametrize(('username', 'password', 'message'), (
    ('a', 'test', b'Incorrect username.'),
    ('test', 'a', b'Incorrect password.'),
))
def test_login_validate_input(auth, username, password, message):
    response = auth.login(username, password)
    assert message in response.data


def test_logout(client, auth):
    auth.login()

    with client:
        auth.logout()
        assert 'user_id' not in session
