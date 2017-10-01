#!/usr/bin/env node

import yargs from 'yargs';

yargs
  .env('ROARR')
  .commandDir('commands')
  .help()
  .wrap(80)
  .parse();
