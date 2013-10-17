Passport
=========
1. Setup three accounts at the different datacenters
1. Setup necessary .ini files
1. Run Replication Setup script
1. Push Couchapp to one of the accounts (replication should propogate the couchapp to the other databases)
1. Create 'fly' database on first account
1. Open separate terminal and run python pass_control_X.py (currently there are two - washdc and amsterdam)
1. python push_doc.py N (where N is optional number of docs to push)


ToDo
=====
configure it with one configuration file - maybe that configuration contains a list of configuration files?? Then the scripts read the main configuration to learn about each of the individual database configurations??

passportcontrol.py might now work out of the box. I made some change but didn't test it.

add way to automatically create the "fly" database

