const isValid = require("date-fns/isValid");
const parseISO = require("date-fns/parseISO");
const { Buffer } = require("buffer");
const { v4: uuidv4 } = require("uuid");
const { hideBin } = require("yargs/helpers");
const yargs = require("yargs/yargs");

const {
  clearDistFolder,
  createFormTtlFile,
  createResourceMigrationFile,
  bundleForms,
  generateTimestamp,
} = require("./utils.js");

const argv = yargs(hideBin(process.argv))
  .option("date", {
    alias: "d",
    default: null,
    defaultDescription:
      "If no date is provided, a new date will be created based on the time of execution.",
    description:
      "The date (in ISO format) that should be used for the file and folder names.",
    string: true,
  })
  .version(false).argv;

const defaultFileGraph = "http://mu.semte.ch/graphs/public";
const projects = [
  {
    name: "app-digitaal-loket",
  },
  {
    name: "app-toezicht-abb",
    fileGraph:
      "http://mu.semte.ch/graphs/organizations/141d9d6b-54af-4d17-b313-8d1c30bc3f5b",
  },
  {
    name: "app-meldingsplichtige-api",
  },
  {
    name: "app-public-decisions-database",
    fileGraph:
      "http://mu.semte.ch/graphs/access-for-role/PubliekeBesluitendatabank-BesluitendatabankLezer",
  },
  {
    name: "app-worship-decisions-database",
  }
];

clearDistFolder();

let bundledFormOutput = bundleForms();
let fileSize = Buffer.byteLength(bundledFormOutput);
let date = argv.date ? parseISO(argv.date) : new Date();

if (!isValid(date)) {
  throw new Error(
    `The provided date string ("${argv.date}") is invalid. Make sure it uses a ISO date compliant format.`
  );
}

let timestamp = generateTimestamp(date);
let fileName = `${timestamp}-forms.ttl`;
let uuid = uuidv4();

projects.forEach((project) => {
  createFormTtlFile({ project, fileName, bundledFormOutput });

  let targetGraph = project.fileGraph || defaultFileGraph;

  createResourceMigrationFile({
    project,
    timestamp,
    targetGraph,
    fileName,
    fileSize,
    dateCreated: date,
    dateModified: date,
    uuid,
  });
});
