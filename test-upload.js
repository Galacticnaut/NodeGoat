const needle = require("needle");

async function uploadChallenge() {
    try {
        const challengeContent = "8f9b4ae678386e546c8c";
        const uploadUrl = "https://nodegoat.victoriousbay-31bbfba9.eastus.azurecontainerapps.io/.well-known/xb-challenge/b4df4853f0e1d21112dd";
        
        console.log("Uploading challenge content:", challengeContent);
        console.log("To URL:", uploadUrl);
        
        // Upload the content using needle
        const options = {
            multipart: true,
            timeout: 30000
        };
        
        const data = {
            file: {
                buffer: Buffer.from(challengeContent),
                filename: 'b4df4853f0e1d21112dd',
                content_type: 'text/plain'
            }
        };
        
        const response = await needle('post', uploadUrl, data, options);
        
        console.log("Upload completed!");
        console.log("Status:", response.statusCode);
        console.log("Response body:", response.body);
        
    } catch (error) {
        console.error("Upload failed:", error.message);
    }
}

uploadChallenge();
