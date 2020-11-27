const core = require("@aws-cdk/core");
const ec2 = require("@aws-cdk/aws-ec2");
const ecs = require("@aws-cdk/aws-ecs");
const iam = require("@aws-cdk/aws-iam");

class CdkSgStack extends core.Stack {
  /**
   * @param {cdk.App} scope
   * @param {string} id
   * @param {cdk.StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(
      this, "nebi-dev-vpc",{
        cidr: '10.0.0.0/16',
        maxAzs: 2
      });

    const ecsCluster = new ecs.Cluster(
      this, 'nebi-cluster',{
      vpc: vpc,
      clusterName: 'nebi-cluster'
    });

    ecsCluster.addDefaultCloudMapNamespace({
      name: "service"
    });

    const namespaceOutputs = {
      'ARN': ecsCluster.defaultCloudMapNamespace.privateDnsNamespaceArn,
      'NAME': ecsCluster.defaultCloudMapNamespace.privateDnsNamespaceName,
      'ID': ecsCluster.defaultCloudMapNamespace.privateDnsNamespaceId
    }

    const clusterOutputs = {
      'NAME': ecsCluster.clusterName
    };

    const services3000SecGroup = new ec2.SecurityGroup(
      this, "FrontendToBackendSecurityGroup",{
      allowAllOutbound: true,
      description: "Security group for frontend service to talk to backend services",
      vpc: vpc
      });

    const secGrpIngressSelf3000 = new ec2.CfnSecurityGroupIngress(
      this, "InboundSecGrp3000",{
      ipProtocol: 'TCP',
      sourceSecurityGroupId: services3000SecGroup.securityGroupId,
      fromPort: 3000,
      toPort: 3000,
      groupId: services3000SecGroup.securityGroupId
      });


    new core.CfnOutput(this, "NSArn", {
      value: namespaceOutputs['ARN'],
      exportName: "NSARN",
    });

    new core.CfnOutput(this, "NSName", {
      value: namespaceOutputs['NAME'],
      exportName: "NSNAME",
    });

    new core.CfnOutput(this, "NSId", {
      value: namespaceOutputs['ID'],
      exportName: "NSID",
    });

    new core.CfnOutput(this, "FE2BESecGrp", {
      value: services3000SecGroup.securityGroupId,
      exportName: "SecGrpId",
    });

    new core.CfnOutput(this, "ECSClusterName", {
      value: clusterOutputs['NAME'],
      exportName: "ECSClusterName",
    });

    new core.CfnOutput(this, "ServicesSecGrp", {
      value: services3000SecGroup.securityGroupId,
      exportName: "ServicesSecGrp",
    });

    new core.CfnOutput(this, "VPC", {
      value: vpc.vpcId.toString(),
      exportName: "VPC",
    });
  }
}

module.exports = { CdkSgStack }
