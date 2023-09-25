#!/bin/bash

# Function to install npm packages in a directory
install_packages() {
    echo "Installing npm packages in $1..."
    cd "$1"
    npm install
    cd ..
}

# Install npm packages for both frontend and backend
install_packages "backEnd"
install_packages "frontend"

read -p "Do you want to start the Backend? (y/n): " start_backend
if [[ "$start_backend" == "y" || "$start_backend" == "yes" ]]; then
    echo "Starting Backend..."
    cd backEnd
    node index &
    cd ..
else
    echo "Backend will not be started."
fi

read -p "Do you want to start the Frontend? (y/n): " start_frontend
if [[ "$start_frontend" == "y" || "$start_frontend" == "yes" ]]; then
    echo "Starting Frontend..."
    cd frontend
    npm run dev
    cd ..
else
    echo "Frontend will not be started."
fi

echo "Done."
