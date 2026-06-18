import * as fs from "fs";

const filePath = "src/components/CustomerProfile.tsx";
const content = fs.readFileSync(filePath, "utf8");

// Print how many lines are in the file
const lines = content.split("\n");
console.log("Total lines:", lines.length);
