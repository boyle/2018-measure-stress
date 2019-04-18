import os
import sqlite3

import click
from flask import current_app, g
from flask.cli import with_appcontext
from werkzeug.security import generate_password_hash


def get_db():
    if 'db' not in g:
        g.db = sqlite3.connect(
            current_app.config['DATABASE'],
            detect_types=sqlite3.PARSE_DECLTYPES
        )
        g.db.row_factory = sqlite3.Row

    return g.db


def close_db(e=None):
    db = g.pop('db', None)

    if db is not None:
        db.close()


def init_db():
    db = get_db()

    with current_app.open_resource('schema.sql') as f:
        db.executescript(f.read().decode('utf8'))


@click.command('initdb')
@with_appcontext
def init_db_command():
    init_db()
    click.echo('Initialized the database.')


@click.command('adduser')
@click.option('--username', prompt="Username", help='Username')
@click.option('--password', prompt="Password", help='Passowrd')
@with_appcontext
def adduser_command(username, password):
    db = get_db()

    cur = db.cursor()
    cur.execute(
        'INSERT OR REPLACE INTO user (username, password) VALUES (?, ?)',
        (username, generate_password_hash(password))
    )
    db.commit()
    userid = cur.lastrowid
    cur.close()
    base = current_app.config['USER_FOLDER']
    path = os.path.join(base, str(userid))
    try:
        os.makedirs(path)
    except OSError:
        pass

    click.echo('Added user#%d: %s.'%(userid,username))


@click.command('users')
@with_appcontext
def users_command():
    db = get_db()

    cur = db.cursor()
    cur.execute(
        'SELECT * FROM user',
    )
    db.commit()
    for x in cur.fetchall():
        click.echo("#%d %s"%(x[0],x[1]))
    cur.close()


def init_app(app):
    app.teardown_appcontext(close_db)
    app.cli.add_command(init_db_command)
    app.cli.add_command(adduser_command)
    app.cli.add_command(users_command)
