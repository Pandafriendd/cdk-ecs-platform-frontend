#!/usr/bin/env node
const cdk = require('@aws-cdk/core');
const { CdkSgStack } = require('../lib/cdk-sg-stack');
const { CdkFrontendStack } = require('../lib/cdk-frontend-stack');

const app = new cdk.App();
const envUSA = { account: '457175632986', region: 'us-east-1' };
new CdkSgStack(app, 'CdkSgStack', { env: envUSA });
new CdkFrontendStack(app, 'CdkFrontendStack', { env: envUSA });
