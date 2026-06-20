const fs = require("fs");
const path = require("path");

const targetPath = process.argv[2]
    ? path.resolve(process.cwd(), process.argv[2])
    : path.resolve(__dirname, "../serviceAccountKey.json");

if (!fs.existsSync(targetPath)) {
    console.error(`Service account file not found: ${targetPath}`);
    process.exit(1);
}

const rawCredential = fs.readFileSync(targetPath, "utf8");
const encodedCredential = Buffer.from(rawCredential, "utf8").toString("base64");

process.stdout.write(encodedCredential);
