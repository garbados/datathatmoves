import requests
import json
import sys
import datetime
import apptools

myconfig = apptools.appConfig('chicago.ini')


def generate_doc():
    return {
        'passport': [
        {
            'city': myconfig.city,
            'arrival_date': datetime.datetime.now().isoformat(),
            'message': 'Welcome to Chicago... whoever you are.'
        }
        ]
    }


# a list of docs to upload
docs = []

# can specify on command line how many new docs to create, otherwise just
# create one new doc
numdocs = 1
try:
    numdocs = int(sys.argv[1])  # check for command line number of docs
except:
    pass

# now generate the fake edelweiss docs for upload to the db
for i in range(numdocs):
    docs.append(generate_doc())

# use bulk_docs insert to upload docs to the database
url = '%s/%s/_bulk_docs' % (myconfig.server, myconfig.dbname)

r = requests.post(
    url,
    data=json.dumps({'docs': docs}),
    auth=myconfig.auth,
    headers=myconfig.headers
)

# verify that the bulk upload was successful. should return a 201.
print 'HTTP GET return code:', r.status_code

# show the current database sequnce number so you can see the sequence
# number iterate through this example
print 'current database sequence number:'
r = requests.get(
    url='%s/%s' % (myconfig.server, myconfig.dbname),
    auth=myconfig.auth,
    headers=myconfig.headers
)

print r.json()['update_seq']
