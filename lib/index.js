var nano = require('nano'),
    async = require('async'),
    fs = require('fs'),
    path = require('path'),
    dive = require('dive'),
    CLUSTER_ORDER = [
      'Lagoon 2',
      'Meritage',
      'Malort',
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

  function get_feeds () {
    var feeds = [];

    CLUSTER_ORDER.forEach(function (cluster) {
      var instance = nano(get_instance_url(cluster)),
          db = instance.use(DB_NAME),
          feed = db.follow();

      feeds.push({
        feed: feed,
        cluster: cluster
      });
    });

    return feeds;
  }

  function create_dbs (done) {
    var to_execute = [];

    CLUSTER_ORDER.forEach(function (cluster) {
      var instance = nano(get_instance_url(cluster));

      to_execute.push(function (done) {
        instance.db.create('_replicator', done);
      });

      to_execute.push(function (done) {
        instance.db.create(DB_NAME, done);
      });
    });

    async.parallel(to_execute, done);
  }

  function get_cluster_pairs () {
    var pairs = [],
        cluster_order_copy = CLUSTER_ORDER.slice(0);

    CLUSTER_ORDER.forEach(function (cluster) {
      cluster_order_copy.shift();
      cluster_order_copy.forEach(function (cluster2) {
        pairs.push([
          get_instance_url(cluster), 
          get_instance_url(cluster2)
        ]);
      });
    });

    return pairs;
  }

  function create_replication_ring (pairs, done) {
    var jobs = [];

    pairs.forEach(function (pair) {
      var db1 = nano(pair[0] + '/_replicator'),
          db2 = nano(pair[1] + '/_replicator'),
          target1 = [pair[0], DB_NAME].join('/'),
          target2 = [pair[1], DB_NAME].join('/');

      jobs.push(function (done) {
        db1.insert({
          source: target1, 
          target: target2,
          continuous: true
        }, done);
      });

      jobs.push(function (done) {
        db2.insert({
          source: target2,
          target: target1,
          continuous: true
        }, done);
      });
    });

    async.parallel(jobs, done);
  }

  function cleanup (done) {
    var to_execute = [];

    function _cb (done) {
      return function (err, res) {
        if (err) {
          if (err.status_code === 404) {
            done(null, 404);
          } else {
            done(err);
          }
        } else {
          done(null, res);
        }
      };
    }

    CLUSTER_ORDER.forEach(function (cluster) {
      var instance = nano(get_instance_url(cluster));

      to_execute.push(function (done) {
        instance.db.destroy('_replicator', _cb(done));
      });
      to_execute.push(function (done) {
        instance.db.destroy(DB_NAME, _cb(done));
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
    console.log('1. create the necessary databases on all clusters...');
    create_dbs(function (err) {
      if (err) throw err;

      var pairs = get_cluster_pairs();
      console.log('2. put replication documents on all clusters...')
      create_replication_ring(pairs, function (err, results) {
        if (err) throw err;
        
        var feeds = get_feeds(),
            start_time = new Date().getTime(),
            changes = [];

        feeds.forEach(function (feed_obj) {
          var feed = feed_obj.feed,
              cluster = feed_obj.cluster;

          feed.on('change', function (change) {
            changes.push([cluster, new Date().getTime(), change]);
            if (changes.length === CLUSTER_ORDER.length) {
              console.log('4. done!');
              feeds.forEach(function (feed) { feed.feed.stop(); });
              done(null, [start_time, changes]);
            }
          });

          feed.follow();
        });

        console.log('3. upload document to replicate...');
        upload_docs(function (err, results) {
          if (err) throw err;
        });
      });
    });
  }

  return {
    cleanup: cleanup,
    run: run,
    run_clean: function (done) {
      cleanup(function (err, result) {
        if (err) throw err;
        // setTimeout(function() {
          run(done);
        // }, 5000);
      });
    }
  };
}

module.exports = main;