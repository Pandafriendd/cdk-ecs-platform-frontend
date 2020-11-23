#!/usr/bin/env node
const cdk = require('@aws-cdk/core');
const { CdkSgStack } = require('../lib/cdk-sg-stack');

const app = new cdk.App();
new CdkSgStack(app, 'CdkSgStack');
