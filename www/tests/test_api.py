import pytest
import os
import shutil
from flask import g, session


def remove_user(app, userid):
    path = os.path.join(app.config['USER_FOLDER'], str(userid))
    shutil.rmtree(path, ignore_errors=True)


def load_user(app, userid, filename):
    path = os.path.join(app.config['USER_FOLDER'], str(userid))
    try:
        os.makedirs(path)
    except OSError:
        pass
    f = open(os.path.join(path,filename), 'w')
    f.write('a config')
    f.close()


def remove_patient(app, patient):
    path = os.path.join(app.config['UPLOAD_FOLDER'], str(patient))
    shutil.rmtree(path, ignore_errors=True)


def load_patient_session(app, patient, session, filename):
    path = os.path.join(app.config['UPLOAD_FOLDER'], str(patient))
    try:
        os.makedirs(path)
    except OSError:
        pass
    path = os.path.join(path, str(session))
    try:
        os.makedirs(path)
    except OSError:
        pass
    f = open(os.path.join(path,filename), 'w')
    f.write('a test')
    f.close()


@pytest.mark.parametrize(('path', 'is404', 'is404_after_login'), (
    ('/api',            False, False),
    ('/api/v0',         True,  False),
    ('/api/v1',         False, False),
    ('/api/v2',         True,  False),
    ('/api/v1/p',       False, False),
    ('/api/v1/p/1',     False, False),
    ('/api/v1/p/2',     False, True ),
    ('/api/v1/p/1/1',   False, False),
    ('/api/v1/p/1/2',   False, True ),
    ('/api/v1/u',       False, False),
    ('/api/v1/u/1',     False, True ),
    ('/api/v1/ver',     False, False),
    ('/api/v1/ver/web', False, False),
    ('/api/v1/ver/app', False, False),
))
def test_api_exists(client, app, auth, path, is404, is404_after_login):
    remove_user(app, 1);
    remove_patient(app, 1);
    load_patient_session(app, 1, 1, 'test.txt');
    load_user(app, 1, 'test.cfg');

    if is404:
        assert client.get(path).status_code == 404
        return

    auth.logout()
    response = client.get(path)
    assert response.status_code == 302
    assert response.headers['Location'] == 'http://localhost/auth/login'
    auth.login()
    if is404_after_login:
        assert client.get(path).status_code == 404
    else:
        assert client.get(path).status_code == 200


@pytest.mark.parametrize(('path', 'outputs'), (
    ('/api',                   [ b'v1' ]),
    ('/api/v1',                [ b'p', b'u', b'ver' ]),
    ('/api/v1/p',              [ b'1' ]),
    ('/api/v1/p/1',            [ b'1' ]),
    ('/api/v1/p/1/1',          [ b'test.txt' ]),
    ('/api/v1/p/1/1/test.txt', [ b'a test' ]),
    ('/api/v1/u',              [ b'test.cfg' ]),
    ('/api/v1/u/test.cfg',     [ b'a config' ]),
    ('/api/v1/ver',            [ b'web', b'app' ]),
    ('/api/v1/ver/web',        [ b'0.0.0w' ]),
    ('/api/v1/ver/app',        [ b'0.0.0a' ]),
))
def test_api_returns(client, app, auth, path, outputs):
    remove_user(app, 1);
    remove_patient(app, 1);
    load_patient_session(app, 1, 1, 'test.txt');
    load_user(app, 1, 'test.cfg');

    auth.login()
    response = client.get(path)
    assert response.status_code == 200
    for output in outputs:
       assert output in response.data
