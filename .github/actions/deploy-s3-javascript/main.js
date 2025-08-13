const core = require('@actions/core');
const exec = require('@actions/exec');

async function run() {
    try {
        const bucket = core.getInput('bucket', { required: true });
        const bucketRegion = core.getInput('bucket-region', { required: true });
        const distFolder = core.getInput('dist-folder', { required: true });

        core.startGroup('Uploading to S3');
        core.info(`Bucket: ${bucket}`);
        core.info(`Region: ${bucketRegion}`);
        core.info(`Local dist folder: ${distFolder}`);

        // IMPORTANT: sync dist folder CONTENTS to bucket ROOT so index.html is at root
        const syncCmd = `aws s3 sync ${distFolder} s3://${bucket} --delete --region ${bucketRegion}`;
        core.info(`Running: ${syncCmd}`);
        await exec.exec(syncCmd);
        core.endGroup();

        const websiteUrl = `http://${bucket}.s3-website-${bucketRegion}.amazonaws.com`;
        core.setOutput('website-url', websiteUrl);
        core.notice(`Deployment complete. Root website URL (if hosting enabled): ${websiteUrl}`);
    } catch (err) {
        core.setFailed(err.message);
    }
}

run();