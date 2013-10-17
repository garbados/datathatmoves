import listener
import os
import json
import requests
import datetime
import apptools

myconfig=None
fromCity=None

def callback(line):

  #Call the Mapreduce View with the startkey/endkey combination that gets me a list of new documents
  #that are "in WashingtonDC".

  r = requests.get(
    '%s/%s/%s?startkey="%s"&endkey="%s\ufff0"&reduce=false&include_docs=true' % (myconfig.server, myconfig.dbname, myconfig.viewname, fromCity, fromCity), 
    auth=myconfig.auth,
    headers=myconfig.headers
  )

  # With the list of documents that correspond to new files that need attention,
  # perform the action 

  for row in r.json()['rows']:
    doc = row['doc']

    control_record = {
      'city':myconfig.city,  
      'arrival_date': datetime.datetime.now().isoformat(),
      'message': myconfig.message + ', ' + row['id'],
      'from': fromCity
    }      
       
    doc['passport'].append(control_record)

    # Update the document in the database

    print json.dumps(control_record, indent=1)      

    rr = requests.put(
      '%s/%s/%s' % (myconfig.server, myconfig.dbname, row['id']), 
      data=json.dumps(doc), 
      auth=myconfig.auth, 
      headers=myconfig.headers
    )

    if rr.status_code not in (200, 201):
      print 'bad status', rr.status_code, rr, row['id']
    else:
      print datetime.datetime.now(), 'updated', row['id']



def run(aconfig, acity):

  global myconfig
  global fromCity

  myconfig = aconfig
  fromCity = acity
  
  #.........................

  # Call the listener.run function, which will run in a loop indefinitely and listen for 
  # data from the _changes feed. It will use the filter specified to return only
  # lines from the _changes feed for docs that return true from the filter function. 
  # The filter function is defined in the _design document on the database. (See the
  # design.process.json file or the couchapp.)
  # When a new line is returned, the callback, above, is executed. 

  try:
    listener.run( 
      callback=callback, 
      anAppConfig=myconfig,
      changes_filter='passport/control&lastport=%s' % fromCity 
    )
  except KeyboardInterrupt: #don't print the traceback
    pass


