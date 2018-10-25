import os
from flask import (
    Blueprint, flash, request, redirect, url_for, send_from_directory,
    render_template, current_app
)
from werkzeug import secure_filename

from bikeshed.auth import login_required
from bikeshed.db import get_db

bp = Blueprint('upload', __name__, url_prefix='/upload')


@bp.route('/', methods=['GET', 'POST'])
@login_required
def upload():
    if request.method == 'POST':
        if 'file[]' not in request.files:
#            flash('File not transmitted.');
            return 'no file[]' #redirect(request.url)
        if ('patient' not in request.form) or (request.form['patient'] == ''):
            return 'no patient ID'
        if ('session' not in request.form) or (request.form['session'] == ''):
            return 'no session number'
        if not request.form['patient'].isdigit():
            return 'non-numeric patient ID'
        if not request.form['session'].isdigit():
            return 'non-numeric session number'
        patient = int(request.form['patient'])
        session = int(request.form['session'])
        if not 0 <= patient < 1000:
            return 'bad patient ID'
        if not 0 < session < 1000:
            return 'bad session number'
        filelist = request.files.getlist("file[]")
        if len(filelist) == 0:
#            flash('Files not selected.');
            return 'no files selected' #redirect(request.url)
        base = current_app.config['UPLOAD_FOLDER']
        path = os.path.join(base, str(patient), str(session))
        os.makedirs(path, exist_ok=True)
        s = 'patient {}, session {}<br/><br/>'.format(patient,session)
        for f in filelist:
            fn = secure_filename(f.filename);
            if fn == '':
                s += fn + ': skipped<br/>'
                next
            s += fn + ': stored<br/>'
            if os.path.isfile(os.path.join(path, fn)): # collision
                i = 0
                while os.path.isfile(os.path.join(path, fn + '.' + str(i))): i += 1
                os.rename(os.path.join(path, fn), os.path.join(path, fn + '.' + str(i)))
            f.save(os.path.join(path, fn))
        return s+'<br/>upload completed'
    else: # GET
        return render_template('upload.html')
