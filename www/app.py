#! /usr/bin/python3
import os
from flask import Flask, flash, request, redirect, url_for, send_from_directory
from flask import render_template, jsonify
from werkzeug import secure_filename
import re

app = Flask(__name__)

from werkzeug.contrib.fixers import LighttpdCGIRootFix
app.wsgi_app = LighttpdCGIRootFix(app.wsgi_app)

UPLOAD_FOLDER = '/var/www/rawdata/db/'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 500 * 1024 * 1024 # 500 MB

@app.route('/')
def index():
    return render_template('index.html')


@app.route('/privacy')
def privacy():
    return render_template('privacy.html')


@app.route('/upload', methods=['GET', 'POST'])
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
        base = app.config['UPLOAD_FOLDER']
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

def listsubdirs(base):
    return [ o for o in os.listdir(base) if os.path.isdir(os.path.join(base, o)) ]

def listfiles(base):
    return [ o for o in os.listdir(base) ]

def responselist(ret):
    if request.content_type == 'application/json':
        return jsonify(ret)
    else:
        return '<br/>'.join(ret)

@app.route('/api')
def apiversionlist():
    return responselist(['v1'])

@app.route('/api/v1')
def patientlist():
    base = app.config['UPLOAD_FOLDER']
    return responselist(listsubdirs(base))

@app.route('/api/v1/<int:patient>')
def sessionlist(patient):
    base = app.config['UPLOAD_FOLDER']
    path = os.path.join(base, str(patient))
    return responselist(listsubdirs(path))

@app.route('/api/v1/<int:patient>/<int:session>')
def datalist(patient,session):
    base = app.config['UPLOAD_FOLDER']
    files = listfiles(os.path.join(base,
                                   str(patient),
                                   str(session)))
    regex = re.compile(r'\.[0-9]+$')
    files = filter(lambda i: not regex.search(i), files)
    return responselist(files)

@app.route('/api/v1/<int:patient>/<int:session>/<string:measure>')
def returnfile(patient, session, measure):
    base = app.config['UPLOAD_FOLDER']
    return send_from_directory(os.path.join(base,
                                            str(patient),
                                            str(session)),
                               secure_filename(measure))

if __name__ == '__main__':
    app.run(port=8000)
