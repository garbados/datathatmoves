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
        // if (!results[i-1]) {
        //   // start case
        //   console.log('First replication arrives in', result[0], 'at', new Date(result[1]));
        // } else if (!results[i+1]) {
        //   // end case
        //   console.log('Last replication arrived in', result[0], 'at', new Date(result[1]));
        // } else {
        //   // typical case
        //   console.log('Took', result[1] - results[i-1][1], 'ms to get to', result[0]);
        // }
      });

      console.log('In all, took', total, 'ms');

      done(total);
    });
  }

  async.timesSeries(count || 1, lets_do_it, function (err, results) {
    process.exit(0);
  });
}

main(Number(process.argv[2]));