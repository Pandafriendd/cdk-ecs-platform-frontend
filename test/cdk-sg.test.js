const { expect, haveResource } = require('@aws-cdk/assert');
const cdk = require('@aws-cdk/core');
const CdkSg = require('../lib/cdk-sg-stack');

test('SQS Queue Created', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new CdkSg.CdkSgStack(app, 'MyTestStack');
    // THEN
    expect(stack).to(haveResource("AWS::SQS::Queue",{
      VisibilityTimeout: 300
    }));
});

test('SNS Topic Created', () => {
  const app = new cdk.App();
  // WHEN
  const stack = new CdkSg.CdkSgStack(app, 'MyTestStack');
  // THEN
  expect(stack).to(haveResource("AWS::SNS::Topic"));
});
