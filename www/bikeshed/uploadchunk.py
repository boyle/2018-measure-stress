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
        return ('GET not implemented', 500)
    else:
        flowChunkNumber = int(request.form.get('flowChunkNumber','1'))
        flowTotalChunks = int(request.form.get('flowTotalChunks','1'))
        flowChunkSize = int(request.form.get('flowChunkSize','1'))
        flowCurrentChunkSize = int( request.form.get('flowCurrentChunkSize','1'))
        flowTotalSize = int(request.form.get('flowTotalSize','-1'))
        flowRelativePath = request.form.get('flowRelativePath')
        flowFilename = request.form.get('flowFilename')
        flowIdentifier = request.form.get('flowIdentifier')

        #if not flowFilename:
        #    return ('missing filename', 400)
        #if not flowRelativePath:
        #    return ('missing path', 400)
        #if not flowIdentifier:
        #    return ('missing UUID', 400)

        print('POST: chunk#%d/%d, (%dB/chunk, currently %dB/chunk, %dB total) %s/%s UUID:%s'%(
            flowChunkNumber, flowTotalChunks,
            flowChunkSize, flowCurrentChunkSize, flowTotalSize,
            flowRelativePath, flowFilename, flowIdentifier
            ))

    return ('', 200)
