# Overseerr Mobile App

This is an open-source mobile application built using React Native Expo and the Overseerr API. As Overseerr doesn't have an official app, this project aims to fill that gap, providing users with a mobile interface for Overseerr.

## Prerequisites

Before you begin, ensure you have met the following requirements:
* You have installed the latest version of Node.js, Expo CLI, and Yarn.
* You have a Windows/Mac/Linux machine.
* You have read the Expo documentation.
* You have an Overseerr server and are an admin to generate API keys.
* You have other services like Radarr, Sonarr, SabNZB, Deluge, Tautulli, etc.

### Installing Node.js

Node.js is a JavaScript runtime built on Chrome's V8 engine. Here are the steps to download Node.js for Windows:

1. Go to the Node.js website and find their downloads page.
2. Click on the windows installer to download and open the file.
3. Accept their license agreement by clicking ‘Next.’
4. Choose where you’d like to install Node.js, then click ‘Next.’

## Installing Overseerr Mobile App

To install the Overseerr Mobile App, follow these steps:

1. Clone the repo
   ```sh
   git clone https://github.com/bennshine/noirseerr.git
Or if you have downloaded the .zip file of the project:

Unzip the repository: unzip repo.zip
Configure a remote in your repository that points to the clone URI:
cd repo
git init
git remote add origin https://github.com/bennshine/noirseerr.git

Resync the repositories: git pull
Install NPM packages
yarn install

Fill in the config.js file with your details:
JavaScript

const overserrUrl = "your_overseerr_url";
const overseerrApi = "your_overseerr_api";


Using Overseerr Mobile App
To use Overseerr Mobile App, follow these steps:

Run the app
expo start

Open the Expo client on your phone and scan the QR code appearing in the terminal or in Expo Dev Tools.
Contributing to Overseerr Mobile App
To contribute to Overseerr Mobile App, follow these steps:

Fork this repository.
Create a branch: git checkout -b <branch_name>.
Make your changes and commit them: git commit -m '<commit_message>'
Push to the original branch: git push origin <project_name>/<location>
Create the pull request.

License
This project uses the following license: MIT License.
