import os
import re
from flask import (
    Flask, flash, request, redirect, url_for, render_template,
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
    return [ o for o in os.listdir(base) if os.path.isdir(os.path.join(base, o)) ]

def listfiles(base):
    return [ o for o in os.listdir(base) ]

def responselist(ret):
    if request.content_type == 'application/json':
        return jsonify(ret)
    else:
        return '<br/>'.join(ret)

@bp.route('')
def apiversionlist():
    return responselist(['v1'])

@bp.route('/v1')
def apitypeslist():
    return responselist(['p'])

@bp.route('/v1/p')
def patientlist():
    base = current_app.config['UPLOAD_FOLDER']
    return responselist(listsubdirs(base))

@bp.route('/v1/p/<int:patient>')
def sessionlist(patient):
    base = current_app.config['UPLOAD_FOLDER']
    path = os.path.join(base, str(patient))
    if not os.path.isdir(path):
        return abort(404)
    return responselist(listsubdirs(path))

@bp.route('/v1/p/<int:patient>/<int:session>')
def datalist(patient,session):
    base = current_app.config['UPLOAD_FOLDER']
    path = os.path.join(base, str(patient), str(session))
    if not os.path.isdir(path):
        return abort(404)
    files = listfiles(path)
    regex = re.compile(r'\.[0-9]+$')
    files = filter(lambda i: not regex.search(i), files)
    return responselist(files)

@bp.route('/v1/p/<int:patient>/<int:session>/<string:measure>')
def returnfile(patient, session, measure):
    base = current_app.config['UPLOAD_FOLDER']
    path = os.path.join(base, str(patient), str(session))
    if not os.path.isdir(path):
        return abort(404)
    return send_from_directory(path, secure_filename(measure))
