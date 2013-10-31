#!/usr/bin/env node

var config = require('../config.json'),
    lib = require('../lib')(config),
    url = require('url'),
    async = require('async');

function main (count) {
  var to_execute = [];

  function lets_do_it (n, done) {
    lib.run(function (results) {
      var hosts = [],
          times = [];

      results.forEach(function (result) {
        var status = result[1],
            parts = url.parse(status.uri);    

        hosts.push([parts.hostname, status.date]);
      });

      hosts.forEach(function (host, i) {
        if (!hosts[i-1]) {
          console.log('Started travelling the world at', host[1]);
        } else {
          var diff = new Date(host[1]).getTime() - new Date(hosts[i-1][1]).getTime();
          times.push(diff / 1000);
          console.log('Took', diff / 1000, 'seconds to get to', host[0]);
        }
        if (!hosts[i+1]) {
          var diff = new Date(host[1]).getTime() - new Date(hosts[0][1]).getTime();
          times.push(diff / 1000);
          console.log('Finished travelling at', host[1]);
          console.log('In all, took', diff / 1000, 'seconds');
        }
      });

      done(null, times);
    });
  }

  async.timesSeries(count || 1, lets_do_it, function (err, results) {
    if (count) {
      console.log(results);
    }
  });
}

main(Number(process.argv[2]));