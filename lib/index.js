var nano = require('nano'),
    async = require('async'),
    fs = require('fs'),
    path = require('path'),
    dive = require('dive'),
    CLUSTER_ORDER = [
      'Lagoon 2',
      'Meritage',
      'Malort',
      'Fernet',
      'Julep',
      'Mead',
      'Jenever',
      'Sling'
    ],
    DB_NAME = "demo";

function main (config) {

  function get_instance_url (cluster) {
    var username = config[cluster].username,
        password = config[cluster].password;
    return "https://" + [username, password].join(':') + "@" + username + ".cloudant.com"; 
  }

  function get_cluster_pairs () {
    var pairs = [];

    CLUSTER_ORDER.forEach(function (cluster, i) {
      var curr = get_instance_url(cluster),
          next;
      // get the next cluster in the ring
      if (CLUSTER_ORDER[i+1]) {
        next = get_instance_url(CLUSTER_ORDER[i+1]);
      } else {
        next = get_instance_url(CLUSTER_ORDER[0]);
      }
      pairs.push({
        curr: curr,
        next: next
      });
    });

    return pairs;
  }

  function create_dbs (done) {
    var to_execute = [];

    CLUSTER_ORDER.forEach(function (cluster) {
      var instance = nano(get_instance_url(cluster));

      to_execute.push(function (done) {
        instance.db.create(DB_NAME, done);
      });
    });

    async.parallel(to_execute, done);
  } 

  function create_replication_ring (pairs, done) {
    var jobs = [];

    pairs.forEach(function (pair) {
      var instance = nano(pair.curr);

      jobs.push(function (done) {
        var source = [pair.curr, DB_NAME].join('/'),
            target = [pair.next, DB_NAME].join('/');
        
        instance.db.replicate(source, target, done);
      });
    });

    async.series(jobs, done);
  }

  function cleanup (done) {
    var to_execute = [];

    CLUSTER_ORDER.forEach(function (cluster) {
      var instance = nano(get_instance_url(cluster));

      to_execute.push(function (done) {
        instance.db.destroy(DB_NAME, function (err, res) {
          if (err) {
            if (err.status_code === 404) {
              done(null, 404);
            } else {
              done(err);
            }
          } else {
            done(null, res);
          }
        });
      });
    });

    async.parallel(to_execute, done);
  }


  function upload_docs (done) {
    var instance = nano(get_instance_url(CLUSTER_ORDER[0])),
        db = instance.use(DB_NAME),
        files = [];

    dive(path.resolve(__dirname, '..', 'docs'), function (err, file) {
      if (err) throw err;
      files.push(file);
    }, function () {
      async.map(files, function (file, done) {
        fs
          .createReadStream(file)
          .pipe(db.attachment.insert(file, file, null, 'application/octet-stream'))
          .on('end', done);
      }, function (err) {
        if (err) throw err;
        done();
      });
    });
  }

  function run (done) {
    create_dbs(function (err) {
      if (err) throw err;
      upload_docs(function (err, results) {
        if (err) throw err;
        var pairs = get_cluster_pairs();
        create_replication_ring(pairs, function (err, results) {
          if (err) throw err;
          cleanup(function (err) {
            if (err) throw err;
            done(results);
          });
        });
      });
    });
  }

  return {
    cleanup: cleanup,
    run: run,
  };
}

module.exports = main;