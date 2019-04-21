from __future__ import print_function
# from flask import (
#     request, session, escape,
#     send_from_directory, jsonify, Blueprint, current_app, abort
# )
from flask import (request, Blueprint)
# from werkzeug import secure_filename

from bikeshed.auth import login_required

bp = Blueprint('uploadchunk', __name__, url_prefix='/uploadchunk')


@bp.before_request
@login_required
def before_request():
    pass


@bp.route('/', methods=['GET', 'POST'])
@login_required
def uploadchunk():
    if request.method == 'GET':
        print('GET:  ' + str(request.args.get('')))
    else:
        flowChunkNumber = int(request.form.get('flowChunkNumber'))
        flowTotalChunks = int(request.form.get('flowTotalChunks'))
        flowChunkSize = int(request.form.get('flowChunkSize'))
        flowCurrentChunkSize = int( request.form.get('flowCurrentChunkSize'))
        flowTotalSize = int(request.form.get('flowTotalSize'))
        flowRelativePath = str(request.form.get('flowRelativePath'))
        flowFilename = str(request.form.get('flowFilename'))
        flowIdentifier = str(request.form.get('flowIdentifier'))

        print('POST: chunk#%d/%d, (%dB/chunk, currently %dB/chunk, %dB total) %s/%s UUID:%s'%(
            flowChunkNumber, flowTotalChunks,
            flowChunkSize, flowCurrentChunkSize, flowTotalSize,
            flowRelativePath, flowFilename, flowIdentifier
            ))

    return ('', 200)
