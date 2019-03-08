import os

RAW_STORAGE = 'ssh://saans.ca:/var/www/rawdata'
DATA_STORAGE = '/var/www/data'
if not os.path.isfile(DATA_STORAGE + '/README.txt'):
    raise ValueError('Permanent storage not mounted: ' + DATA_STORAGE)
