from __future__ import print_function
from flask import (
    request, session, escape,
    send_from_directory, jsonify, Blueprint, current_app, abort
)
from werkzeug import secure_filename

from bikeshed.auth import login_required

bp = Blueprint('uploadchunk', __name__, url_prefix='/uploadchunk')

@bp.before_request
@login_required
def before_request():
    pass

@bp.route('/', methods = ['GET', 'POST'])
@login_required
def uploadchunk():
    if request.method == 'GET':
        print('GET')
        print(request.args)
    else:
        print('POST')
        print(request.args)

    return ('', 200)
