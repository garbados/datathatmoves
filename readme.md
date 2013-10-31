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

    git clone [repo]
    cd [repo]
    npm install

Now, we'll need accounts in every data center:

1. Get one account per data center
2. Run `cp config.example config.json`
3. Enter each account's credentials into `config.json`
4. Run `npm start`

If you stop the `npm start` script mid-way, use `bin/cleanup.js` to reset your databases.

## License

[MIT](http://opensource.org/licenses/MIT), yo.