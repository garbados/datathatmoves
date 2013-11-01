#!/usr/bin/env node

var config = require('../config.json'),
    lib = require('../lib')(config),
    url = require('url'),
    async = require('async');

function main (count) {
  var to_execute = [];

  function lets_do_it (n, done) {
    lib.run_clean(function (err, results) {
      if (err) throw err;

      var start_time = results[0],
          changes = results[1];

      changes = changes.sort(function (a, b) { 
        return a[1] - b[1];
      });

      var total = changes[changes.length-1][1] - start_time;

      changes.forEach(function (change, i) {
        console.log(change[0], '\n\t', change[1] - start_time, "ms");
      });

      console.log('In all, took', total, 'ms');

      done(null, total);
    });
  }

  async.timesSeries(count || 1, lets_do_it, function (err, results) {
    if (results.length > 1) {
      console.log(results);
      console.log("Avg:", results.reduce(function (a, b) { return a + b; }, 0) / results.length, "ms"); 
    }
    // process.exit(0);
  });
}

main(Number(process.argv[2]));