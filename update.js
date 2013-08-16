var AWS = require('aws-sdk');
AWS.config.update({accessKeyId: 'MY-AWS-ACCESSKEY-ID', secretAccessKey: 'SECRET-KEY', region: 'eu-west-1'});
AWS.config.apiVersions = {
  route53: '2012-12-12'
}

var route53 = new AWS.Route53();
var http = require('http');

var newIp = "";

var options = {
    host: 'icanhazip.com',
    path: '/'
}
var request = http.request(options, function (res) {
    var data = '';
    res.on('data', function (chunk) {
        data += chunk;
    });
    res.on('end', function () {
        newIp = data.toString();
        updateIpOnAmazon(newIp);
    });
});
request.on('error', function (e) {
    console.log(e.message);
});
request.end();


function updateIpOnAmazon(ip) {
    var params = {
        'HostedZoneId': 'HOSTEDZONEID',
        'StartRecordName': 'DOMAIN-NAME',
        'StartRecordType': 'A',
        'MaxItems': "1"
    }

    route53.listResourceRecordSets(params, function (err, data) {
      if (err) {
        console.log(err); // an error occurred
      } else {
        var currentIp = data.ResourceRecordSets[0].ResourceRecords[0].Value;

        var paramsDnsUpdate = {
            'HostedZoneId': 'HOSTEDZONEID',
            'ChangeBatch': {
                'Comment': 'this is via sdk',
                'Changes': [
                    {
                        'Action': 'DELETE',
                        'ResourceRecordSet': {
                            'Name': 'DOMAINNAME',
                            'Type': 'A',
                            'TTL': 300,
                            'ResourceRecords': [
                                {
                                    'Value': currentIp
                                }
                            ]
                        }
                    },
                    {
                        'Action': 'CREATE',
                        'ResourceRecordSet': {
                            'Name': 'DOMAINNAME',
                            'Type': 'A',
                            'TTL': 300,
                            'ResourceRecords': [
                                {
                                    'Value': ip
                                }
                            ]
                        }
                    }
                ]
            }
        }

        route53.changeResourceRecordSets(paramsDnsUpdate, function (err, data) {
          if (err) {
            console.log(err); // an error occurred
          } else {
            console.log(data); // successful response
          }
        });
      }
    });

}

/*
*/
