# Data that Moves

[Cloudant](https://cloudant.com/) hosts database clusters all around the world, and lets you replicate data between databases. So, how long will it take to replicate a document around the world? Specifically, this image:

![Around the World in 80 Days](http://eggchair.maxthayer.org/img/around_the_world_in_eighty_days_ver2_xlg.jpg)

## What?

We'll insert the image to a database at one end of the world.
Then, we'll replicate it to the next, and the next, and the next...
until the image has been replicated from one end of the Earth to the other. 
How long will it take?

## How?

First, get this repo and its dependencies. Get [node.js](http://nodejs.org/), then run this:

    git clone git@github.com:garbados/datathatmoves.git
    cd datathatmoves
    npm install

Now, we'll need accounts in every data center:

1. Get one account per data center
2. Run `cp config.example config.json`
3. Enter each account's credentials into `config.json`
4. Run `npm start`

If you stop the `npm start` script mid-way, use `bin/cleanup.js` to reset your databases.

# Let's give it a go, shall we?

## tl;dr

<iframe border='0' height='418' id='shelr_record_5273c0ef9660807c4f000003' scrolling='no' src='http://shelr.tv/records/5273c0ef9660807c4f000003/embed' style='border: 0' width='570'></iframe>

## Details

On average, my setup reported the image replicating around the world in under four seconds, or 3738.75 ms. Here's the sample output from one run:

    1. create the necessary databases on all clusters...
    2. put replication documents on all clusters...
    3. upload document to replicate...
    4. done!
    Lagoon 2 
       1239 ms
    Meritage 
       1414 ms
    Malort 
       1941 ms
    Julep 
       2644 ms
    Jenever 
       2686 ms
    Mead 
       2985 ms
    Sling 
       3459 ms
    In all, took 3459 ms

That's an overestimation, actually, since it's both the time it took the document to replicate, plus the time it took for my application to figure out it'd replicated.

## On Replication

There are lots of convenient things about [Cloudant](https://cloudant.com/), like its [HTTP API](http://docs.cloudant.com/api/basics.html) or [incremental MapReduce](http://docs.cloudant.com/guides/mapreduce.html), but the thing that really blows my mind is replication, where any number of distributed nodes can masterlessly exchange state, bringing themselves into sync, whether fully or partially. If any nodes lose connection, they can still take writes, and will automatically come back up to speed when they're reconnected. 

OK, so what?

Well, database servers can be nodes, so we can create ad-hoc masterless clusters using replication. Datacenters can be nodes, too, so we can get global applications the same speed of access as region-local apps. Or, browsers and phones can be nodes, so we can replicate right into the application, letting the app continue to operate flawlessly even while offline.

![blew your mind, yeah?](http://eggchair.maxthayer.org/img/sg017lt.gif)

Cloudant implements the [replication protocol](http://dataprotocols.org/couchdb-replication/), as does [CouchDB](http://couchdb.apache.org/), [PouchDB](http://pouchdb.com/), and a growing list of other technologies, so more applications on more devices can leverage replication.

## License

[MIT](http://opensource.org/licenses/MIT), yo.
