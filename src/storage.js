const aws = require("aws-sdk");
require("aws-sdk/lib/maintenance_mode_message").suppress = true;

const endpoint = new aws.Endpoint("s3.us-east-005.backblazeb2.com");

const s3 = new aws.S3({
  endpoint,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const uploadFile = async (path, buffer, mimetype) => {
  const file = await s3
    .upload({
      Bucket: "marketapi",
      Key: path,
      Body: buffer,
      ContentType: mimetype,
    })
    .promise();

  return {
    url: file.Location,
    path: file.Key,
  };
};

const deleteFile = async (path) => {
  await s3
    .deleteObject({
      Bucket: "marketapi",
      Key: path,
    })
    .promise();
};

module.exports = {
  uploadFile,
  deleteFile,
};
