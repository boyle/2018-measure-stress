#from __future__ import print_function

import os
from time import (time, sleep)
from flask import (
    Blueprint, request,
    render_template, current_app
)
from werkzeug.utils import secure_filename

from bikeshed.auth import login_required

bp = Blueprint('upload', __name__, url_prefix='/upload')


@bp.before_request
@login_required
def before_request():
    pass


def chunk_store(patient, session, data, chunk_num):
    tmppath = mk_tmp_dir()
    chunk_fn = secure_filename(
        str(patient) + '-' +
        str(session) + '-' +
        data.filename + '.part' + str(chunk_num)
    )
    save_location = os.path.join(tmppath, chunk_fn)
    data.save(save_location)
    size = os.stat(save_location).st_size
    return size


# delete files older than N days
def chunk_clean():
    N = 7
    tmppath = mk_tmp_dir()
    now = time()
    for fn in os.listdir(tmppath):
        f = os.path.join(tmppath, fn)
        try:
            isfile = os.path.isfile(f)
            mtime = os.stat(f).st_mtime
            if isfile and (mtime < now - N * 86400):
                os.remove(f)
        except FileNotFoundError:
            continue  # no worries: file deleted/moved


def chunk_coalesce(patient, session, filename, chunk_num, total_size, total_chunks):
    tmppath = mk_tmp_dir()
    chunk_fns = [
        os.path.join(tmppath, secure_filename(
            str(patient) + '-' +
            str(session) + '-' +
            filename + '.part' + str(chunk_num+1))
        ) for chunk_num in range(0, total_chunks)
    ]
    size = 0
    for fn in chunk_fns:
        if not os.path.isfile(fn):
            return 0  # missing chunks
        size += os.stat(fn).st_size

    if size == total_size:  # HAPPY
        path = mk_data_dir(patient, session)
        final_fn = os.path.join(path, secure_filename(filename))
        shift_file(path, final_fn)
        open(final_fn, mode='wb').close()  # zero byte file
        for fn in chunk_fns:
            f = open(fn, mode='rb')
            contents = f.read()
            f.close()
            f = open(final_fn, mode='ab+')
            f.write(contents)
            f.close()

        for fn in chunk_fns:
            os.remove(fn)

    return size


def chunk_test(patient, session, filename, chunk_num):
    tmppath = mk_tmp_dir()
    chunk_fn = \
        os.path.join(tmppath, secure_filename(
            str(patient) + '-' +
            str(session) + '-' +
            filename + '.part' + str(chunk_num))
        )
    if not os.path.isfile(chunk_fn):
        return None
    return os.stat(chunk_fn).st_size


def file_test(patient, session, filename):
    path = mk_data_dir(patient, session)
    fn = os.path.join(path, secure_filename(filename))
    if not os.path.isfile(fn):
        return None
    return os.stat(fn).st_size


def store_file(patient, session, filelist):
    path = mk_data_dir(patient, session)
    s = 'patient {}, session {}<br/><br/>'.format(patient, session)
    for f in filelist:
        fn = secure_filename(f.filename)
        if fn == '':
            s += '{}: skipped<br/>'.format(f.filename)
            continue
        s += fn + ': stored<br/>'
        shift_file(path, fn)
        f.save(os.path.join(path, fn))
    return s+'<br/>upload completed'


def shift_file(path, fn):
    if os.path.isfile(os.path.join(path, fn)):  # collision
        i = 0
        while os.path.isfile(os.path.join(path, fn + '.' + str(i))):
            i += 1
        os.rename(os.path.join(path, fn),
                  os.path.join(path, fn + '.' + str(i)))


def mk_data_dir(patient, session):
    base = current_app.config['UPLOAD_FOLDER']
    path = os.path.join(base, str(patient), str(session))
    try:
        os.makedirs(path)
    except OSError:
        pass
    return path


def mk_tmp_dir():
    base = current_app.config['UPLOAD_FOLDER']
    tmppath = os.path.join(base, 'tmp')
    try:
        os.makedirs(tmppath)
    except OSError:
        pass
    return tmppath


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
        flowCurrentChunkSize = int( request.form.get('flowCurrentChunkSize', '1'))
        flowTotalSize = int(request.form.get('flowTotalSize', '-1'))
        flowFilename = request.form.get('flowFilename')

        filelist = request.files.getlist('file')
        patient = str_to_id(request.form.get('patient'), 0, 1000)
        session = str_to_id(request.form.get('session'), 1, 1000)

        #print('POST: chunk#%d/%d, (%dB of %dB total) %s files:%s patient#%s session#%s'%(
        #    flowChunkNumber, flowTotalChunks,
        #    flowCurrentChunkSize, flowTotalSize,
        #    flowFilename,
        #    str(filelist), str(patient), str(session)
        #    ))

        if (not filelist) or (len(filelist) < 1) or ('' in filelist):
            return ('no files', 400)
        if not patient:
            return ('no Patient number', 400)
        if not session:
            return ('no Session number', 400)
        if flowTotalChunks > 1 and len(filelist) > 1:
            return ('flow.js implementation error: ' +
                'totalchunks > 1, but len(filelist) > 1 -- one name per file', 400)
        if flowFilename and flowFilename != filelist[0].filename:
            return ('flow.js implementation error: flowFilename != file', 400)

        if flowTotalChunks > 1: # is using flow.js
            size = chunk_store(patient, session, filelist[0], flowChunkNumber)
            if size != flowCurrentChunkSize:
                return ('size mismatch #%d: %dB actual != %dB expected'%(flowChunkNumber, size, flowCurrentChunkSize), 400)

            if flowChunkNumber != flowTotalChunks:
                return ('', 200)

            wait = 10
            while wait > 0:
                wait -= 1
                size = chunk_coalesce(patient, session, filelist[0].filename, flowChunkNumber, flowTotalSize, flowTotalChunks)
                if size >= flowTotalSize:
                    break
                sleep(0.1)
            if size != flowTotalSize:
                return ('file size mismatch: %dB actual != %dB expected'%(size, flowTotalSize), 400)

            chunk_clean()
            return ('', 200)

        store_file(patient, session, filelist)
        return ('', 200)

    else: # GET
        flowChunkNumber = int(request.args.get('flowChunkNumber', '1'))
        flowTotalChunks = int(request.args.get('flowTotalChunks', '1'))
        flowCurrentChunkSize = int(request.args.get('flowCurrentChunkSize', '1'))
        flowTotalSize = int(request.args.get('flowTotalSize', '-1'))
        flowFilename = request.args.get('flowFilename')

        patient = str_to_id(request.args.get('patient'), 0, 1000)
        session = str_to_id(request.args.get('session'), 1, 1000)

        #print('GET: UUID:%s'%(str(flowIdentifier)))
        if flowFilename: # flow.js response
            if flowTotalChunks != flowChunkNumber:
                size = chunk_test(patient, session, flowFilename, flowChunkNumber)
                if size is None:
                    return ('no such file chunk', 404)
                if size != flowCurrentChunkSize:
                    return ('size mismatch #%d: %dB actual != %dB expected'%(flowChunkNumber, size, flowCurrentChunkSize), 400)
            else:
                size = file_test(patient, session, flowFilename)
                if size is None:
                    return ('no such file', 404)
                if size != flowTotalSize:
                    return ('file size mismatch: %dB actual != %dB expected'%(size, flowTotalSize), 400)
            return ('', 200)

        else: # HTML response
            return render_template('upload.html')
