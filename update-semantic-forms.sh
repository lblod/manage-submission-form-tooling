#!/bin/bash

# Extending the build-forms script
# (Not recommended but you can comment this part but it will result in duplicate if you run the command twice)
echo "Building the forms..."
bash ./build-forms.sh
echo "Forms built successfully!"
echo ""
echo "---------------------------------------"
echo ""

# Required : Add your path where you store your projects this has to start with / and end with /
path_folder="/path/to/yours/projects/"

# List of projects that will be affected by the script
projects=("app-digitaal-loket" "app-meldingsplichtige-api" "app-public-decisions-database" "app-toezicht-abb" "app-worship-decisions-database")

for index in ${!projects[@]};
do
    project_name="${projects[$index]}"
    input_project_path="${path_folder}manage-submission-form-tooling/dist/$project_name/"
    output_project_path="$path_folder$project_name"

    echo "Processing $project_name ..."
    echo ""

    echo "Copying migrations and semantic-forms content from $input_project_path to $output_project_path ..."
    echo ""

    # Copy the folders content into the output_project_path
    rsync -ru "$input_project_path"* "$output_project_path"/

    # Get the form file name without the extension
    form_file=$(ls "${input_project_path}config/semantic-forms" | grep .ttl | head -n 1 | sed 's/.ttl//')

    echo "Updating the ACTIVE_FORM_FILE to ${form_file}.ttl in ${output_project_path}/docker-compose.yml ..."
    echo ""

    sed -i "s/ACTIVE_FORM_FILE:.*/ACTIVE_FORM_FILE: \"share:\/\/semantic-forms\/$form_file.ttl\"/g" "${output_project_path}/docker-compose.yml"

    cd "${path_folder}manage-submission-form-tooling/dist"

    next_index=$(($index + 1))
    if [ "$next_index" -lt "${#projects[@]}" ]; then
        next_project="${projects[$next_index]}"
        echo "Done processing $project_name. Next project: $next_project."
        echo ""
        echo "---------------------------------------"
        echo ""
    else
        echo "Done processing $project_name."
        echo ""
        echo "---------------------------------------"
        echo ""
    fi
done

echo "All projects were successfully updated to the latest semantic form! Exiting."
echo ""
exit 0
