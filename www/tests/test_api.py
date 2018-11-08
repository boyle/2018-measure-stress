import pytest
import os
import shutil
from flask import g, session


#def upload_patient_data(client, auth, patient, session, filename):
#    auth.login()
#    data = {'patient': patient, 'session': session}
#    data = {key: str(value) for key, value in data.items()} # int to str
#    data['file[]'] = (io.BytesIO(b'a test'), filename)
#    response = client.post(
#        '/upload/',
#        content_type='multipart/form-data',
#        data = data
#    )
#    assert response.status_code == 200
#    assert b'%s: stored'%(filename) in response.data
#    assert b'upload completed' in response.data

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
    ('/api',          False, False),
    ('/api/v0',       True,  False),
    ('/api/v1',       False, False),
    ('/api/v2',       True,  False),
    ('/api/v1/p',     False, False),
    ('/api/v1/p/1',   False, False),
    ('/api/v1/p/2',   False, True ),
    ('/api/v1/p/1/1', False, False),
    ('/api/v1/p/1/2', False, True ),
    ('/api/v1/u',     True,  False),
    ('/api/v1/ver',   True,  False),
))
def test_api_exists(client, app, auth, path, is404, is404_after_login):
    remove_patient(app, 1);
    load_patient_session(app, 1, 1, 'test.txt');

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
