const { SESClient } = require("@aws-sdk/client-ses");
// Set the AWS Region.
const REGION = "eu-north-1";
// Create SES service object.
console.log("3434",process.env.AWS_ACCESS_KEY)
const sesClient = new SESClient({ region: REGION, credentials:{
    accessKeyId:process.env.AWS_ACCESS_KEY,
    secretAccessKey:process.env.AWS_SECRET_ACCESS_KEY
} });
module.exports= { sesClient };