const { Client } = require("@notionhq/client");

const notion = new Client({ auth: "secret_test" });

console.log("Keys on notion.databases:", Object.keys(notion.databases));
console.log("Type of notion.databases.query:", typeof notion.databases.query);
console.log(
  "Type of notion.databases.retrieve:",
  typeof notion.databases.retrieve
);
