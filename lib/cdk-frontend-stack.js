const ec2 = require("@aws-cdk/aws-ec2");
const ecs = require("@aws-cdk/aws-ecs");
const iam = require("@aws-cdk/aws-iam");
const serviceDiscovery = require("@aws-cdk/aws-servicediscovery");
const ecsPatterns = require("@aws-cdk/aws-ecs-patterns");
const core = require('@aws-cdk/core');  

class CdkFrontendStack extends core.Stack {
  constructor(scope, id, props) {
      super(scope, id, props);

      //console.log("env variable " + JSON.stringify(props));
      
      const basePlatform = new BasePlatform(this, id, props)
      
      const serviceSG = ec2.SecurityGroup.fromSecurityGroupId(
        this, 'securitygroup', core.Fn.importValue('ServicesSecGrp'));
        
      const vpc = ec2.Vpc.fromLookup(
            this, "VPC",{
            vpcName: 'CdkSgStack/nebi-dev-vpc'
      });
      
      const taskImageOptions = {
            // An instance of Container Image: https://docs.aws.amazon.com/cdk/api/latest/docs/@aws-cdk_aws-ecs.ContainerImage.html
            // from DockerHub or other registry
            image: ecs.ContainerImage.fromRegistry('kissmygritts/fishnv-app'),
            containerPort: 3000
        }

      const fargateLoadBalancedService = new ecsPatterns.ApplicationLoadBalancedFargateService(
            this,
            'FrontendFargateLBService',
            {
                serviceName: 'fishnv-frontend',
                publicLoadBalancer: true,
                cpu: 512,
                memoryLimitMiB: 1024,
                desiredCount: 1,
                cluster: basePlatform.ecsCluster,
                taskImageOptions: taskImageOptions,
                cloudMapOptions: basePlatform.sdNamespace,
                //vpc: basePlatform.vpc
                //vpc: vpc,
            }
        )

      fargateLoadBalancedService.taskDefinition.addToTaskRolePolicy(
          new iam.PolicyStatement({
              actions: ['ec2:DescribeSubnets'],
              resources: ['*']
          })
      );

      fargateLoadBalancedService.service.connections.allowTo(
          basePlatform.serviceSG,  // TypeError: Cannot read property 'connections' of undefined. due to "this"
          //serviceSG,
          new ec2.Port({
              protocol: ec2.Protocol.TCP, 
              stringRepresentation: "port3000", 
              fromPort: 3000, 
              toPort: 3000
          })
      );

      const autoscale = fargateLoadBalancedService.service.autoScaleTaskCount({
          minCapacity: 1,
          maxCapacity: 1
      });

      autoscale.scaleOnCpuUtilization(
          "CPUAutoscaling",{
          targetUtilizationPercent: 50,
          scaleInCooldown: core.Duration.seconds(30),
          scaleOutCooldown: core.Duration.seconds(30)
      });
  }
}

// not working !!! ??? 
// due to "this" on member variables
class BasePlatform extends core.Construct {
  constructor(scope, id, props) {
      super(scope, id, props);
      
      const vpc = ec2.Vpc.fromLookup(
            this, "VPC",{
            vpcName: 'CdkSgStack/nebi-dev-vpc'
      });

      const sdNamespace = serviceDiscovery.PrivateDnsNamespace.fromPrivateDnsNamespaceAttributes(
          this, "SDNamespace",{
          namespaceName: core.Fn.importValue('NSNAME'),
          namespaceArn: core.Fn.importValue('NSARN'),
          namespaceId: core.Fn.importValue('NSID')
      });

      this.ecsCluster = ecs.Cluster.fromClusterAttributes(
          this, "ECSClusterPy",{
          clusterName: core.Fn.importValue('ECSClusterName'),
          securityGroups: [],
          vpc: vpc,
          defaultCloudMapNamespace: sdNamespace
      });
      
      this.serviceSG = ec2.SecurityGroup.fromSecurityGroupId(
        this, 'securitygroup', core.Fn.importValue('ServicesSecGrp'));
  }
}

module.exports.CdkFrontendStack = CdkFrontendStack;