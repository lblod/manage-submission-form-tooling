const fs = require("fs");
const read = require("fs-readdir-recursive");

function bundleForms() {
  const formConfigPath = "./formSkeleton/";

  let bundledFormOutput = fs.readFileSync(
    formConfigPath + "inputFields/input-fields.ttl",
    "utf8"
  );

  read(formConfigPath + "forms/").forEach((fileDir, i) => {
    bundledFormOutput += fs.readFileSync(
      formConfigPath + "forms/" + fileDir,
      "utf8"
    );
  });

  return bundledFormOutput;
}

function clearDistFolder() {
  if (fs.existsSync("./dist")) {
    fs.rmSync("./dist", { recursive: true });
  }
}

function createFormTtlFile({ project, fileName, bundledFormOutput }) {
  let destinationFolder = `./dist/${project.name}/config/semantic-forms`;
  fs.mkdirSync(destinationFolder, {
    recursive: true,
  });
  fs.writeFileSync(`${destinationFolder}/${fileName}`, bundledFormOutput);
}

function createResourceMigrationFile({
  project,
  timestamp,
  targetGraph,
  fileName,
  fileSize,
  dateCreated,
  dateModified,
  uuid
}) {

  const year = timestamp.substr(0, 4);
  fs.mkdirSync(
    `./dist/${project.name}/config/migrations/${year}/${timestamp}-add-new-forms`,
    {
      recursive: true,
    }
  );
  fs.writeFileSync(
    `./dist/${project.name}/config/migrations/${year}/${timestamp}-add-new-forms/${timestamp}-add-file-resource.sparql`,
    generateMigrationContents({
      targetGraph,
      fileName,
      fileSize,
      dateCreated,
      dateModified,
      uuid,
    })
  );
}

function generateMigrationContents({
  targetGraph,
  fileName,
  fileSize,
  dateCreated,
  dateModified,
  uuid,
}) {
  // TODO: Should we use some sort of deindenting util instead of resetting the indentation here?
  // prettier-ignore
  return `\
PREFIX nfo: <http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#>
PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
PREFIX dct: <http://purl.org/dc/terms/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX dbpedia: <http://dbpedia.org/resource/>

INSERT DATA {
  GRAPH <${targetGraph}> {
    <share://semantic-forms/${fileName}> a nfo:FileDataObject ;
      dct:type <http://data.lblod.gift/concepts/form-file-type> ;
      mu:uuid "${uuid}" ;
      nfo:fileName "${fileName}" ;
      dct:created "${formatIsoDate(dateCreated)}"^^xsd:dateTime ;
      dct:modified "${formatIsoDate(dateModified)}"^^xsd:dateTime ;
      dct:format "text/turtle";
      nfo:fileSize "${fileSize}"^^xsd:integer;
      dbpedia:fileExtension "ttl" .
  }
}
    `;
}

function formatIsoDate(date) {
  let month = `${date.getMonth() + 1}`.padStart(2, "0");
  let day = `${date.getDate()}`.padStart(2, "0");
  let hours = `${date.getHours()}`.padStart(2, "0");
  let minutes = `${date.getMinutes()}`.padStart(2, "0");
  let seconds = `${date.getSeconds()}`.padStart(2, "0");

  return `${date.getFullYear()}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

function generateTimestamp(date) {
  let month = `${date.getMonth() + 1}`.padStart(2, "0");
  let day = `${date.getDate()}`.padStart(2, "0");
  let hours = `${date.getHours()}`.padStart(2, "0");
  let minutes = `${date.getMinutes()}`.padStart(2, "0");
  let seconds = `${date.getSeconds()}`.padStart(2, "0");

  return `${date.getFullYear()}${month}${day}${hours}${minutes}${seconds}`;
}

module.exports = {
  bundleForms,
  clearDistFolder,
  createFormTtlFile,
  createResourceMigrationFile,
  generateTimestamp
};
