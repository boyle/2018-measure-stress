import pytest
import os
import shutil
import json
from io import BytesIO


def remove_patient(app, patient):
    path = os.path.join(app.config['UPLOAD_FOLDER'], str(patient))
    shutil.rmtree(path, ignore_errors=True)


def load_patient_session(app, patient, session, filename, content='a test'):
    base = app.config['UPLOAD_FOLDER']
    path = os.path.join(base, str(patient), str(session))
    try:
        os.makedirs(path)
    except OSError:
        pass
    f = open(os.path.join(path, filename), 'w')
    f.write(content)
    f.close()


@pytest.mark.parametrize(('path', 'is404', 'is404_after_login'), (
    ('/api',            False, False),
    ('/api/v0',         True,  False),
    ('/api/v1',         False, False),
    ('/api/v2',         True,  False),
    ('/api/v1/p',       False, False),
    ('/api/v1/p/1',     False, False),
    ('/api/v1/p/2',     False, True),
    ('/api/v1/p/1000',  False, True),
    ('/api/v1/p/1/1',   False, False),
    ('/api/v1/p/1/1/missing.txt', False, True),
    ('/api/v1/p/1/2',   False, True),
    ('/api/v1/p/1/1000', False, True),
    ('/api/v1/u',       True, True),
    ('/api/v1/u/1',     True, True),
    ('/api/v1/ver',     False, False),
    ('/api/v1/ver/web', False, False),
    ('/api/v1/ver/app', False, False),
))
def test_api_exists(client, app, auth, path, is404, is404_after_login):
    remove_patient(app, 1)
    load_patient_session(app, 1, 1, 'test.txt')
    load_patient_session(app, 1, -1, 'dummy.txt')
    load_patient_session(app, -1, 1, 'dummy.txt')
    load_patient_session(app, 1000, 1, 'dummy.txt')
    load_patient_session(app, 1, 1000, 'dummy.txt')

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
        return
    assert client.get(path).status_code == 200
    response = client.get(path, content_type='application/json')
    assert response.status_code == 200
    assert response.is_json


def test_dir_permissions(client, app, auth):
    path = '/api/v1/p/1'
    remove_patient(app, 1)
    base = app.config['UPLOAD_FOLDER']
    os.chmod(base, 0o400)
    auth.login()
    assert client.get(path).status_code == 404
    assert client.put(path).status_code == 404
    assert client.get(path).status_code == 404
    os.chmod(base, 0o770)
    assert client.put(path).status_code == 201
    assert client.get(path).status_code == 200


@pytest.mark.parametrize(('path', 'outputs'), (
    ('/api',                   [b'v1']),
    ('/api/v1',                [b'p', b'ver']),
    ('/api/v1/p',              [b'1']),
    ('/api/v1/p/1',            [b'1']),
    ('/api/v1/p/1/1',          [b'test.txt']),
    ('/api/v1/p/1/1/test.txt', [b'a test']),
    ('/api/v1/p/1/1/test.json', [b'a test']),
    ('/api/v1/ver',            [b'web', b'app']),
    ('/api/v1/ver/web',        [b'0.0.0w']),
    ('/api/v1/ver/app',        [b'0.0.0a']),
))
def test_api_returns(client, app, auth, path, outputs):
    remove_patient(app, 1)
    if '.json' in path:
        load_patient_session(app, 1, 1, 'test.json', json.dumps({'data': str(outputs)}))
    else:
        load_patient_session(app, 1, 1, 'test.txt')

    auth.login()
    if '.json' in path:
        response = client.get(path, content_type='application/json')
    else:
        response = client.get(path)
    assert response.status_code == 200
    for output in outputs:
        assert output in response.data


@pytest.mark.parametrize(('path', 'code'), (
    ('/api',                   405),
    ('/api/v1',                405),
    ('/api/v1/p',              405),
    ('/api/v1/p/1',            201),
    ('/api/v1/p/1',            204),
    ('/api/v1/p/1/1',          201),
    ('/api/v1/p/1/1',          204),
    ('/api/v1/p/1/1/test.txt', 201),
    ('/api/v1/p/1/1/test.txt', 204),
    ('/api/v1/p/1/1/test.txt', 422), # malformed form data
    ('/api/v1/p/1/1/double.txt', 422), # multiple files
    ('/api/v1/p/1/1/test.json', 201),
    ('/api/v1/p/1/1/test.json', 204),
    ('/api/v1/p/1/1/test.jsn', 422), # bad extension
    ('/api/v1/ver',            405),
    ('/api/v1/ver/web',        405),
    ('/api/v1/ver/app',        405),
))
def test_api_put(client, app, auth, path, code):
    remove_patient(app, 1)
    content = 'abc'
    if code == 204:
        fn = base=os.path.basename(path)
        load_patient_session(app, 1, 1, fn, content)
        load_patient_session(app, 1, 1, fn+'.0', content)
        content = 'def'

    data = {'files': (BytesIO(content.encode('utf-8')), 'test.txt')}
    if '/double.txt' in path:
        data = {'files': [(BytesIO(content.encode('utf-8')), 'test.txt'), (BytesIO(content.encode('utf-8')), 'test1.txt')]}
    elif code == 422:
        data = {'asdf': 'ddd'}

    auth.login()
    if any(x in path for x in ['.json', '.jsn']):
        response = client.put(path, json={'data': content})
    else:
        response = client.put(path, data=data, content_type='multipart/form-data')
    assert response.status_code == code

    if code < 400:
        response = client.get(path)
        assert response.status_code == 200
        if any(x in path for x in ['.txt', '.json']):
            assert content.encode('utf-8') in response.data
