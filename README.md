![warning-forms](https://user-images.githubusercontent.com/23281659/97719334-4007d000-1ac7-11eb-8449-bd21eba87928.png)

## Usage

The `buildForms` script can be used to bundle all form configurations and generate a folder structure for each supported project.

```sh
npm install # Make sure you run this before running the script
npm run buildForms
```

This will create a folder for each supported project in the `./dist` folder. You can then copy this folder to each respective project.

### Using a specific date

By default a new timestamp will be generated when running the script, which will be used to prefix all file and folder names. If you want to use a different date for this you can pass it in as an argument to the script:

```sh
npm run buildForms -- --date 2022-02-03T11:00:00
```

> The date should be a valid [ISO 8601](http://en.wikipedia.org/wiki/ISO_8601) date and parsable by date-fns' [`parseISO` function](https://date-fns.org/v2.28.0/docs/parseISO).

### Using Docker to run the script

To run in a docker container clone this repo then run:

```
docker run -it --rm -v "$PWD":/app -w /app node:16 sh build-forms.sh
```

### Using automatic form update with extending the build-forms.sh script

The `update-semantic-forms.sh` script copies the semantic forms content and migrations from the `manage-submission-form-tooling/dist/project_name` directory to the specified list of projects. It also updates automatically the `ACTIVE_FORM_FILE` of each project to the latest form version for the `enrich-submission-service` located in the `docker-compose.yml` file.

See : [enrich-submission-service](https://github.com/lblod/enrich-submission-service#add-the-service-to-a-stack)

#### Usage

  1. **Not recommended** : Comment out the `bash ./build-forms.sh` command if you have already built the forms and do not want to duplicate them.
  2. **Required** : Create a `.env` file containing key-value pairs and add the relevant projects to that file.
      - Example: `app-digitaal-loket="~/path/to/app-digitaal-loket`.
      - **Note** the use of `~`; the script will automatically expand it.

  _**Note :** You can ignore this step above since projects are already defined in the script but in the case where other apps will use semantic forms you'll need to add the corresponding project in the project array._

  3. Run the script by executing `./update-semantic-forms.sh` in the terminal.

### Requirements

  - Bash

_**Note :** This script has some limitations, of example if you remove the `build-forms.sh` script, it's not advised to run this `./update-semantic-forms.sh` script twice as it will copy the same semantic-forms and migrations content twice, leading to duplicates. Also, before running the script don't forget switch branches in your projects or make sure you are inside the good one._

## Testing changes

**Make sure to test extensively your updates.**

### Checklists

⚠️ ⚠️ ⚠️ An update to the form, means it needs to be manually propageted to ALL apps. ⚠️ ⚠️ ⚠️

**Loket**

- Create a new submission
- Save the empty submission to check validations
- Fill the submission
- Ensure fields and subfields behave property, especially with
- Save the submission, close it, reopen it
- Send the submission, close it, reopen it
- Open a submission in `Concept` state created with the previous forms version
- Open a submission in `Sent` state created with the previous forms version

**Meldingsplichtige**

- Create a new submission
- Save the empty submission to check validations
- Fill the submission
- Ensure fields and subfields behave property, especially with
- Save the submission, close it, reopen it
- Send the submission, close it, reopen it
- Open a submission in `Concept` state created with the previous forms version
- Open a submission in `Sent` state created with the previous forms version

**Toezicht**

- Note ⚠️ forms should reside in http://mu.semte.ch/graphs/organizations/141d9d6b-54af-4d17-b313-8d1c30bc3f5b
- Open a submission with the new form version
- Open a submission with the old form version

Full flow

- Create a submission with the new forms version in Loket, send it, make sure it appears in Toezicht and can be opened
- Same with a submission created with the old forms version but sent with the new forms version in application (env variable)

**app-public-decisions-database**

- Note ⚠️ forms should reside in http://mu.semte.ch/graphs/access-for-role/PubliekeBesluitendatabank-BesluitendatabankLezer
- connect the app to a source loket (with delta's), assuming the new forms have been deployed at the source
- create e.g. a besluitenlijst in the source and see wether it comes through and you can open it

**app-worship-decisions-database**

- connect the app to a source loket (with delta's), assuming the new forms have been deployed at the source
- create e.g. notulen from an eredienstberstuur, and check it correctly syncs through, i.e. login as the same eredienstbestuur on worship-decisions-database

### Debugging hints

*This list is meant to evolve and get filled by developpers encountering issues.*

- Forms not opening in Toezicht ABB --> double check there is a migration defining the form file as a resource
- For app-public-decisions-database, there is another default graph where the forms-files are stored, so you will need to update the migration accordingly.
- For app-public-decisions-database, if a new form, very likely the business rules to decided whether it should be published or not, should be updated too.
  - So most likely [enrich-submission](https://github.com/lblod/enrich-submission-service) needs an upate too

## Guide to create new fields

This is a little guide of files and services that need to be updated when creating new form fields.

### Create fields

1. Create your new field in `formSkeleton/inputFields/input-fields.ttl` with the appropriated constraints and a `displayType`.
2. If the `displayType` is a new one (it's the case if you need a custom behaviour or if it doesn't exist yet), you will need to create the matching component in [ember-submission-form-fields](https://github.com/lblod/ember-submission-form-fields) and add the correct mappings in the following files :
  - [addon/helpers/component-for-display-type-edit.js](https://github.com/lblod/ember-submission-form-fields/blob/master/addon/helpers/component-for-display-type-edit.js)
  - [addon/helpers/component-for-display-type-show.js](https://github.com/lblod/ember-submission-form-fields/blob/master/addon/helpers/component-for-display-type-show.js)
  - [addon/helpers/component-for-display-type.js](https://github.com/lblod/ember-submission-form-fields/blob/master/addon/helpers/component-for-display-type.js)
3. Use the new field where it's needed in the [forms](https://github.com/lblod/manage-submission-form-tooling/tree/master/formSkeleton/forms)

If your field is using new concept schemes they must be added in `lib/enricher.js` of [enrich-submission-service](https://github.com/lblod/enrich-submission-service)

If your field is using new relationships that are not added in the enrichment yet, they must be added in `lib/enricher.js` of [enrich-submission-service](https://github.com/lblod/enrich-submission-service) as well as in `lib/submission-enricher.js`
of [import-submission-service](https://github.com/lblod/import-submission-service)

Furthermore, most likely, you want this field in the database if new relation: this [toezicht-flattened-form-data-generator](https://github.com/lblod/toezicht-flattened-form-data-generator) should be updated with a new extractor

### Export configuration to the apps

Generate the project specific files using the `npm run buildForms` script and paste the output in the app's root folder OR you can use the `update-semantic-forms.sh` script to automate the copy, it includes the `build-forms.sh` script, then you can ignore the following steps.

If you create a new configuration file, a few things need to be done :
1. The `ACTIVE_FORM_FILE` environment variable of the [enrich-submission-service](https://github.com/lblod/enrich-submission-service#add-the-service-to-a-stack) needs to be updated to the new file name
2. Add migrations to the app defining the configuration file as a resource in the database ([migration](https://github.com/lblod/app-digitaal-loket/blob/ed761a8731ffe8fd51226582f0e6223d460e7f50/config/migrations/20200407100352-automatisch-melding/20200904103600-fix-add-the-forms-file-as-a-file-resource.sparql))
  - Best to add the migration on all instances of the apps using it.
  - Bear in mind: [app-digitaal-loket](https://github.com/lblod/app-digitaal-loket), [app-toezicht-abb](https://github.com/lblod/app-toezicht-abb), [app-meldingsplichtige-api](https://github.com/lblod/app-meldingsplichtige-api) and [app-public-decisions-database](https://github.com/lblod/app-public-decisions-database), [app-worship-decisions-database](https://github.com/lblod/app-worship-decisions-database) are currently using it.


### When adding new Dossier Types (BesluitDocumentType/BesluitType)

If you introduce new Dossier Types (i.e., Concepts), they have to be published in several places. Additionally, there are business rules that should be published so vendors know how to handle these new dossier types.

#### Publishing the business rules to app-centrale-vindplaats

This should only happen on [app-centrale-vindplaats](https://github.com/lblod/app-centrale-vindplaats). It's a simple TTL file that needs to be updated and ingested. Here is a [reference](https://github.com/lblod/app-centrale-vindplaats/blob/master/config/migrations/2024/20241014141246-Decisions-Types.ttl). Take the latest migration you find and update the file.

This involves:
- Adding a new `skos:Concept` as shown [here](https://github.com/lblod/app-centrale-vindplaats/blob/master/config/migrations/2024/20241014141246-Decisions-Types.ttl#L2263).
- Adding a notification rule, as demonstrated [here](https://github.com/lblod/app-centrale-vindplaats/blob/master/config/migrations/2024/20241014141246-Decisions-Types.ttl#L2503).

Data model for the rules can be found [here](https://lblod.github.io/pages-vendors/#/docs/meldingsplicht).

### Publishing the Dossier Types (BesluitDocumentType/BesluitType) to data.vlaanderen

Since these `skos:Concept`s fall under `data.vlaanderen.be`, they should be published here as well so they resolve correctly.

Example PR: [Publishing to data.vlaanderen](https://github.com/Informatievlaanderen/OSLOthema-lokaleBesluiten/pull/21)
