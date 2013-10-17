import requests
import apptools
import json

configs = (
  apptools.appConfig('chicago.ini'),
  apptools.appConfig('washingtondc.ini'),
  apptools.appConfig('amsterdam.ini')
)

def getReplicationDoc(config1, config2):

  serverstring = 'https://%s:%s@%s.cloudant.com/%s'

  return {
    '_id':config1.username + '_db_' + config1.dbname + '_to_' + config2.username + '_db_' + config2.dbname,
    "source": serverstring % (config1.username, config1.password, config1.username, config1.dbname),
    "target": serverstring % (config2.username, config2.password, config2.username, config2.dbname),
    "create_target":True,
    "continuous":True
  }

def getConfigPair(i):
  if i > len(configs):
    raise Exception('i is too big')

  config1 = configs[i]
  if i == len(configs) - 1:
    config2 = configs[0]
  else:
    config2 = configs[i+1]

  return config1, config2

#
# loop through configs and set up replication in a round-robin style
#

for i in range(len(configs)):
  config1, config2 = getConfigPair(i)

  doc = getReplicationDoc(config1, config2)

  print 'setting up replication'
  print doc['_id']

  #upload docs to the database
  replicatorurl = '%s/_replicator' % config1.server

  #make sure the _replicator database exists.
  r = requests.put(replicatorurl, auth=config1.auth)
  if r.status_code != requests.codes.ok and r.status_code != 412 :
    raise Exception("Status Code %d: %s" % (r.status_code, r.text) )

  docurl = "%s/%s" % (replicatorurl, doc['_id'])

  r = requests.head(docurl, auth=config1.auth, headers=config1.headers)
  if r.status_code == 200:
    doc['_rev'] = r.headers['etag'].strip('"')

  print docurl

  r = requests.post(replicatorurl, data=json.dumps(doc), auth=config1.auth, headers=config1.headers)
  print r.status_code
  print r.json()

