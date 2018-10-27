import pytest
from flask import g, session
from bikeshed.db import get_db


def test_index(client, app):
    response = client.get('/')
    assert response.status_code == 200
    assert b'De-identified data' not in response.data
    assert b'A Master List will be created' not in response.data
    assert b'The goal of this research is to' in response.data


def test_privacy(client, app):
    response = client.get('/privacy')
    assert response.status_code == 200
    assert b'De-identified data' in response.data
    assert b'A Master List will be created' in response.data
    assert b'The goal of this research is to' not in response.data
