import os
from flask import Flask, flash, request, redirect, url_for, send_from_directory
from flask import render_template, jsonify
from werkzeug import secure_filename
import re


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
