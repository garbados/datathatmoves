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

      results = results.sort(function (a, b) { 
        return a[1] - b[1];
      });

      var total = results[results.length-1][1] - results[0][1];

      results.forEach(function (result, i) {
        console.log(result[0], '\n\t', result[1]);
      });

      console.log('In all, took', total, 'ms');

      done(total);
    });
  }

  async.timesSeries(count || 1, lets_do_it, function (err, results) {
    console.log("Avg:", results.reduce(function (a, b) { return a + b; }, 0) / results.length, "ms");
    process.exit(0);
  });
}

main(Number(process.argv[2]));