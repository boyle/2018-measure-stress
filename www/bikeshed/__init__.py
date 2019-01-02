import os

from flask import Flask, send_from_directory
from werkzeug.security import generate_password_hash


def create_app(test_config=None):
    # create and configure the app
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_mapping(
        SECRET_KEY='dev',
        AUTHORIZATION_KEY_RAW = 'devauthkey',
        DATABASE=os.path.join(app.instance_path, 'bikeshed.db'),
        # TODO was UPLOAD_FOLDER = '/var/www/rawdata/db/'
        UPLOAD_FOLDER = os.path.join(app.instance_path, 'data'),
        USER_FOLDER = os.path.join(app.instance_path, 'user'),
        MAX_CONTENT_LENGTH = 500 * 1024 * 1024, # 500 MB
        WEBSITE_VERSION = '0.0.0w',
        APPLICATION_VERSION = '0.0.0a',
    )
    from werkzeug.contrib.fixers import LighttpdCGIRootFix
    app.wsgi_app = LighttpdCGIRootFix(app.wsgi_app)

    if test_config is None:
        # load the instance config, if it exists, when not testing
        # BIKESHED_SETTINGS=/dir/config.py from environment
        app.config.from_envvar('BIKESHED_SETTINGS', silent=True)
    else:
        # load the test config if passed in
        app.config.from_mapping(test_config)

    app.config.update(
        AUTHORIZATION_KEY = generate_password_hash(app.config['AUTHORIZATION_KEY_RAW']),
        AUTHORIZATION_KEY_RAW = '',
    )

    # ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    try:
        os.makedirs(app.config['UPLOAD_FOLDER'])
    except OSError:
        pass

    try:
        os.makedirs(app.config['USER_FOLDER'])
    except OSError:
        pass

    # a simple page that says hello
    @app.route('/hello')
    def hello():
        return 'Hello, World!'

    # pass-through for Let's Encrypt updates which are installed in the
    # /.well-known/ static directory
    @app.route('/.well-known/acme-challenge/<path:path>')
    @app.route('/api/.well-known/acme-challenge/<path:path>')
    def send_letsencrypt(path):
        root = os.path.join(app.root_path, '..', '.well-known', 'acme-challenge')
        return send_from_directory(root, path)

    from . import db
    db.init_app(app)

    from . import auth
    app.register_blueprint(auth.bp)

    from . import cover
    app.register_blueprint(cover.bp)
    app.add_url_rule('/', endpoint='index')

    from . import upload
    app.register_blueprint(upload.bp)

    from . import api
    app.register_blueprint(api.bp)

    return app
