var config = require('./config'),
    nano = require('nano'),
    CLUSTER_ORDER = [
      'Lagoon 2',
      'Meritage',
      'Malort',
      'Jubilee',
      'Mead',
      'Jenever',
      'Sling'
    ],
    DB_NAME = "demo";

function create_replication_ring (config) {

  function get_instance_url (cluster) {
    var username = config[cluster].password,
        password = config[cluster].password;
    return "https://" + [username, password].join(':') + "@" + username + ".cloudant.com"; 
  }

  function get_feeds () {
    var feeds = [];

    CLUSTER_ORDER.forEach(function (cluster) {
      var instance = get_instance_url(cluster),
          db = instance.use(DB_NAME),
          feed = db.follow();

      feeds.push(feed);
    });

    return feeds;
  }

  function get_cluster_triplets () {
    var triplets = [];

    CLUSTER_ORDER.forEach(function (cluster, i) {
      var curr = get_instance_url(cluster),
          prev,
          next;
      // get the previous cluster in the ring
      if (CLUSTER_ORDER[i-1]) {
        prev = get_instance_url(CLUSTER_ORDER[i-1]);
      } else {
        prev = get_instance_url(CLUSTER_ORDER[CLUSTER_ORDER.length-1]);
      }
      // get the next cluster in the ring
      if (CLUSTER_ORDER[i+1]) {
        next = get_instance_url(CLUSTER_ORDER[i+1]);
      } else {
        next = get_instance_url(CLUSTER_ORDER[0]);
      }
      triplets.push({
        prev: prev,
        curr: curr,
        next: next
      });
    });

    return triplets;
  }

  function create_replication_ring (triplets, done) {
    var jobs = [];

    triplets.forEach(function (triplet) {
      var instance = nano(triplet.curr);

      jobs.push({
        db: instance,
        source: triplet.curr,
        target: triplet.next
      });
      jobs.push({
        db: instance,
        source: triplet.prev,
        target: triplet.curr
      });
    });

    async.map(jobs, function (job, done) {
      job.db.replicate(job.source, job.target, {
        create_target: true
      }, done);
    }, done);
  }

  function cleanup (done) {
    var to_execute = [];

    CLUSTER_ORDER.forEach(function (cluster) {
      var instance = nano(get_instance_url(cluster));

      to_execute.concat([
        function (done) {
          instance.db.destroy('_replicator', done);
        },
        function (done) {
          instance.db.destroy(DB_NAME, done);
        }
      ]);
    });

    async.parallel(to_execute, done);
  }

  function main () {
    var feeds = get_feeds();
    var triplets = get_cluster_triplets();

    feeds.forEach(function (feed) {
      feed.on('change', console.log);
    });

    var instance = get_instance_url(CLUSTER_ORDER[0]),
        db = ;
  }
}