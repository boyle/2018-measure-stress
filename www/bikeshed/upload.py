from __future__ import print_function

import os
from flask import (
    Blueprint, request, redirect, url_for, send_from_directory,
    render_template, current_app
)
from werkzeug.utils import secure_filename

from bikeshed.auth import login_required

bp = Blueprint('upload', __name__, url_prefix='/upload')


@bp.before_request
@login_required
def before_request():
    pass


def store_file(patient, session, filelist):
    base = current_app.config['UPLOAD_FOLDER']
    path = os.path.join(base, str(patient), str(session))
    try:
        os.makedirs(path)
    except OSError:
        pass
    s = 'patient {}, session {}<br/><br/>'.format(patient, session)
    for f in filelist:
        fn = secure_filename(f.filename)
        if fn == '':
            s += '{}: skipped<br/>'.format(f.filename)
            continue
        s += fn + ': stored<br/>'
        if os.path.isfile(os.path.join(path, fn)):  # collision
            i = 0
            while os.path.isfile(os.path.join(path, fn + '.' + str(i))):
                i += 1
            os.rename(os.path.join(path, fn),
                      os.path.join(path, fn + '.' + str(i)))
        f.save(os.path.join(path, fn))
    return s+'<br/>upload completed'


def str_to_id(arg, low, high):
    try:
        tmp = int(arg)
        if low <= tmp <= high:
            return tmp
        else:
            return None
    except (TypeError, ValueError):
        return None


@bp.route('/', methods=['GET', 'POST'])
def upload():
    if request.method == 'POST':
        flowChunkNumber = int(request.form.get('flowChunkNumber', '1'))
        flowTotalChunks = int(request.form.get('flowTotalChunks', '1'))
        flowChunkSize = int(request.form.get('flowChunkSize', '1'))
        flowCurrentChunkSize = int( request.form.get('flowCurrentChunkSize', '1'))
        flowTotalSize = int(request.form.get('flowTotalSize', '-1'))
        flowRelativePath = request.form.get('flowRelativePath')
        flowFilename = request.form.get('flowFilename')
        flowIdentifier = request.form.get('flowIdentifier')

        filelist = request.files.getlist('file')
        patient = str_to_id(request.form.get('patient'), 0, 1000)
        session = str_to_id(request.form.get('session'), 1, 1000)

        #if not flowFilename:
        #    return ('missing filename', 400)
        #if not flowRelativePath:
        #    return ('missing path', 400)
        #if not flowIdentifier:
        #    return ('missing UUID', 400)
        print('POST: chunk#%d/%d, (%dB/chunk, currently %dB/chunk, %dB total) %s/%s UUID:%s files:%s patient#%s session#%s'%(
            flowChunkNumber, flowTotalChunks,
            flowChunkSize, flowCurrentChunkSize, flowTotalSize,
            flowRelativePath, flowFilename, flowIdentifier,
            str(filelist), str(patient), str(session)
            ))

        if (not filelist) or (len(filelist) < 1) or ('' in filelist):
            return ('no files', 400)
        if not patient:
            return ('no Patient number', 400)
        if not session:
            return ('no Session number', 400)
        if flowTotalChunks > 1 and len(filelist) > 1:
            return ('flow.js implementation error: totalchunks > 1, but len(filelist) > 1 -- one name per file', 400)

        if flowTotalChunks > 1: # is using flow.js
            return ('', 200) # TODO

        store_file(patient, session, filelist)
        return ('', 200)

    else: # GET
        flowIdentifier = request.args.get('flowIdentifier')
        print('GET: UUID:%s'%(str(flowIdentifier)))
        if flowIdentifier: # flow.js response
            return ('GET not implemented', 500)
        else: # HTML response
            return render_template('upload.html')
