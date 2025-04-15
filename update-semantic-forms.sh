#!/bin/bash

# Check if .env file exists
if [[ ! -f .env ]]; then
    echo ".env file not found. Consult the README on what the contents of the file should be."
    exit 1
fi

# Declare arrays for projects and paths
declare -a projects
declare -a paths

# Read the .env file
while IFS='' read -r line || [[ -n "$line" ]]; do
    # Skip empty lines and comments
    [[ "$line" =~ ^[[:space:]]*# ]] && continue
    [[ -z "$line" ]] && continue

    # Trim leading and trailing whitespaces
    key=$(echo "$line" | cut -d '=' -f 1)
    # Remove quotes from value
    value=$(echo "$line" | cut -d '=' -f 2- | sed -e 's/^"//' -e 's/"$//')

    # Expand ~ in value if it's present
    value=$(eval echo "$value")

    if [ ! -d "$value" ]; then
        # Directory does not exist.
        echo "Directory $value does not exist."
        exit 1
    fi

    projects+=("$key")
    paths+=("$value")
done < .env

# (Not recommended but you can comment this part but it will result in duplicate if you run the command twice)
echo "Building the forms..."
bash ./build-forms.sh
echo "Forms built successfully!"
echo ""
echo "---------------------------------------"
echo ""

# projects=("app-digitaal-loket" "app-meldingsplichtige-api" "app-public-decisions-database" "app-toezicht-abb" "app-worship-decisions-database")

for index in "${!projects[@]}"; do
    project_name="${projects[$index]}"
    output_project_path="${paths[$index]}"
    input_project_path=$(realpath "./dist/$project_name/")

    echo "Processing $project_name ..."
    echo ""

    echo "Copying migrations and semantic-forms content from $input_project_path to $output_project_path ..."
    echo ""

    # Get the full path for form and migration
    form_file=$(find "${input_project_path}/config/semantic-forms" -type f -name "*.ttl" | head -n 1)
    form_file_name=$(echo "$form_file" | xargs basename)
    migration_file=$(find "${input_project_path}/config/migrations/$(date +%Y)/" -type f -name "*.sparql" | head -n 1)

    # Copy form and migration into the relevant project directories
    cp "$form_file" "${output_project_path}/config/semantic-forms"
    cp "$migration_file" "${output_project_path}/config/migrations/$(date +%Y)/"

    echo "Updating the ACTIVE_FORM_FILE to ${form_file_name} in ${output_project_path}/docker-compose.yml ..."
    echo ""

    sed -i "s/ACTIVE_FORM_FILE:.*/ACTIVE_FORM_FILE: \"share:\/\/semantic-forms\/$form_file_name\"/g" "${output_project_path}/docker-compose.yml"

    echo "Done processing ${project_name}."
    echo ""
    echo "---------------------------------------"
    echo ""
done

echo "All projects were successfully updated to the latest semantic form! Exiting."
echo ""
exit 0
