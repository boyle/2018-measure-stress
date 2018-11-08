import pytest
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


@pytest.mark.parametrize(('path', 'url_exists'), (
    ('/api',      True),
    ('/api/v0',   False),
    ('/api/v1',   True),
    ('/api/v2',   False),
    ('/api/v1/p', True),
    ('/api/v1/u', False),
))
def test_api_exists(client, auth, path, url_exists):
    if not url_exists:
        assert client.get(path).status_code == 404
        return
    auth.logout()
    response = client.get(path)
    assert response.status_code == 302
    assert response.headers['Location'] == 'http://localhost/auth/login'
    auth.login()
    assert client.get(path).status_code == 200
