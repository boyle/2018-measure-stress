import os
import re
import json
from flask import (
    request, session, escape,
    send_from_directory, jsonify, Blueprint, current_app, abort
)
from werkzeug import secure_filename

from bikeshed.auth import login_required

bp = Blueprint('api', __name__, url_prefix='/api')


@bp.before_request
@login_required
def before_request():
    pass


def listsubdirs(base):
    return [o for o in
            os.listdir(base)
            if os.path.isdir(os.path.join(base, o))]


def listfiles(base):
    return [o for o in os.listdir(base)]


def responselist(ret):
    if request.is_json:
        return jsonify(escape(ret))
    else:
        return '<br/>'.join(ret)


@bp.route('')
def apiversionlist():
    return responselist(['v1'])


@bp.route('/v1')
def apitypeslist():
    return responselist(['p', 'ver'])


@bp.route('/v1/p')
def patientlist():
    base = current_app.config['UPLOAD_FOLDER']
    return responselist(listsubdirs(base))


def patient_dir(patient, session):
    base = current_app.config['UPLOAD_FOLDER']
    # <int:x> is always unsigned x, see https://github.com/pallets/flask/issues/2643
    if not patient < 1000:
        abort(404)
    if session:
        if not session < 1000:
            abort(404)
        path = os.path.join(base, str(patient), str(session))
    else:
        path = os.path.join(base, str(patient))
    if request.method == 'PUT':
        if os.path.isdir(path):
            return (path, 204)
        try:
            os.makedirs(path)
            return (path, 201)
        except OSError:
            pass
    if not os.path.isdir(path):
        abort(404)
    return (path, 200)


@bp.route('/v1/p/<int:patient>',
          methods=['GET', 'PUT'])
def sessionlist(patient):
    (path, code) = patient_dir(patient, None)
    if code != 200:
        return ('', code)
    return responselist(listsubdirs(path))


@bp.route('/v1/p/<int:patient>/<int:session>',
          methods=['GET', 'PUT'])
def datalist(patient, session):
    (path, code) = patient_dir(patient, session)
    if code != 200:
        return ('', code)
    files = listfiles(path)
    regex = re.compile(r'\.[0-9]+$')
    files = filter(lambda i: not regex.search(i), files)
    return responselist(files)


def put_replace_file(path, fn):
    code = 201  # created
    if os.path.isfile(os.path.join(path, fn)):  # collision
        code = 204 # replaced
        i = 0
        while os.path.isfile(os.path.join(path, fn + '.' + str(i))):
            i += 1
        os.rename(os.path.join(path, fn),
                  os.path.join(path, fn + '.' + str(i)))
    return code


@bp.route('/v1/p/<int:patient>/<int:session>/<string:measure>',
          methods=['GET', 'PUT'])
def returnfile(patient, session, measure):
    (path, code) = patient_dir(patient, session)
    code = 200
    fn = secure_filename(measure)
    pathfile = os.path.join(path, fn)
    if request.method == 'GET':
        if not os.path.isfile(pathfile):
            abort(404)
        if request.is_json:
            with open(pathfile, 'r') as infile:
                data = json.load(infile)
            return jsonify(data)
        else:
            return send_from_directory(path, fn)

    # must be PUT
    if request.is_json:
        if '.json' not in fn:
            abort(422)
        code = put_replace_file(path, fn)
        data = request.get_json()
        with open(pathfile, 'w') as outfile:
            json.dump(data, outfile)
    else: # form/html put
        if 'files' not in request.files:
            abort(422)
        filelist = request.files.getlist("files")
        if len(filelist) != 1:
            abort(422)
        code = put_replace_file(path, fn)
        f = filelist[0]
        f.save(os.path.join(path, fn))

    return ('', code)


@bp.route('/v1/ver')
def version():
    return responselist(['web', 'app'])


@bp.route('/v1/ver/web')
def version_website():
    ver = current_app.config['WEBSITE_VERSION']
    return responselist([ver])


@bp.route('/v1/ver/app')
def version_application():
    ver = current_app.config['APPLICATION_VERSION']
    return responselist([ver])
