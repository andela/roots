'use strict';

module.exports = {
  db: process.env.MONGOLAB_URI,
  secret: process.env.SESSION_SECRET,
  google : {
    clientID: '951983031173-vdj0a4k0q3apqtk57v873i0gj0n6o3l9.apps.googleusercontent.com',
    clientSecret: '25cs-KXxdpMIEyWu85CTxGQF'
  },
  facebook : {
  'clientID': '944559605567223',
  'clientSecret': 'c7ea94172e941a7a0b01804181bd2d98'  
  },
  corsOptions: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Origin', 'Content-Type', 'Accept', 'X-Requested-With', 'Authorization']
  }
};