import sqlite3

import pytest
from bikeshed.db import get_db


def test_get_close_db(app):
    with app.app_context():
        db = get_db()
        assert db is get_db()

    with pytest.raises(sqlite3.ProgrammingError) as e:
        db.execute('SELECT 1')

    assert 'closed' in str(e)


def test_init_db_command(runner, monkeypatch):
    class Recorder(object):
        called = False

    def fake_init_db():
        Recorder.called = True

    monkeypatch.setattr('bikeshed.db.init_db', fake_init_db)
    result = runner.invoke(args=['initdb'])
    assert 'Initialized' in result.output
    assert Recorder.called
    assert result.exit_code == 0

    result = runner.invoke(args=['users'])
    assert '#1 test'  in result.output
    assert '#2 other' in result.output
    assert '#3 test1' not in result.output
    assert '#4 test2' not in result.output
    assert result.exit_code == 0

    result = runner.invoke(args=['adduser'], input='test1\nasdf1\n')
    assert 'Added user' in result.output
    assert result.exit_code == 0

    result = runner.invoke(args=['users'])
    assert '#1 test'  in result.output
    assert '#2 other' in result.output
    assert '#3 test1' in result.output
    assert '#4 test2' not in result.output
    assert result.exit_code == 0

    result = runner.invoke(args=['adduser'], input='test2\nasdf2\n')
    assert 'Added user' in result.output
    assert result.exit_code == 0

    result = runner.invoke(args=['users'])
    assert '#1 test'  in result.output
    assert '#2 other' in result.output
    assert '#3 test1' in result.output
    assert '#4 test2' in result.output
    assert result.exit_code == 0
