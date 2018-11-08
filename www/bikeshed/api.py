import os
import re
from flask import (
    Flask, flash, request, redirect, url_for, render_template,
    send_from_directory, jsonify, Blueprint, current_app
)
from werkzeug import secure_filename

from bikeshed.auth import login_required

bp = Blueprint('api', __name__, url_prefix='/api')


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
@login_required
def apiversionlist():
    return responselist(['v1'])

@bp.route('/v1')
@login_required
def apitypeslist():
    return responselist(['p'])

@bp.route('/v1/p')
@login_required
def patientlist():
    base = current_app.config['UPLOAD_FOLDER']
    return responselist(listsubdirs(base))

@bp.route('/v1/p/<int:patient>')
@login_required
def sessionlist(patient):
    base = current_app.config['UPLOAD_FOLDER']
    path = os.path.join(base, str(patient))
    return responselist(listsubdirs(path))

@bp.route('/v1/p/<int:patient>/<int:session>')
@login_required
def datalist(patient,session):
    base = current_app.config['UPLOAD_FOLDER']
    files = listfiles(os.path.join(base,
                                   str(patient),
                                   str(session)))
    regex = re.compile(r'\.[0-9]+$')
    files = filter(lambda i: not regex.search(i), files)
    return responselist(files)

@bp.route('/v1/p/<int:patient>/<int:session>/<string:measure>')
@login_required
def returnfile(patient, session, measure):
    base = current_app.config['UPLOAD_FOLDER']
    return send_from_directory(os.path.join(base,
                                            str(patient),
                                            str(session)),
                               secure_filename(measure))
