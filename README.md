
# Files Manager Express


## Project Overview

This project summarizes the key back-end concepts and tools including **authentication**, **NodeJS**, **MongoDB**, **Redis**, **pagination**, and **background processing**. The objective is to build a simple platform where users can upload and manage files. Key features include:

- **User Authentication via Token**
- **File Listing and Pagination**
- **File Uploading**
- **File Permission Management**
- **File Viewing**
- **Image Thumbnail Generation**

## Features

1. **User Authentication**: Secure token-based authentication system for users to manage access to their files.
2. **List All Files**: Retrieve and paginate files, allowing users to view available documents and images.
3. **Upload Files**: Upload files securely to the platform.
4. **Manage File Permissions**: Change the access permissions of a file for controlled access.
5. **View Files**: View files directly through the platform.
6. **Image Thumbnails**: Automatic generation of thumbnails for image files using a background worker.

##  Objectives



- Create an API using **Express.js**.
- Implement user authentication.
- Store and retrieve data from **MongoDB**.
- Handle temporary data storage using **Redis**.
- Set up and manage background processing with a worker.

## Requirements

- **Editors**: vi, vim, emacs, Visual Studio Code
- **Environment**: All files are tested on **Ubuntu 18.04 LTS** with Node.js version **12.x.x**.
- **File Naming**: All files should have the `.js` extension and end with a newline.
- **README**: A `README.md` file in the root folder is mandatory.
- **Code Quality**: Code quality is enforced with **ESLint**.

## Setup Instructions

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/abrielleperry/atlas-atlas-files_manager.git
   cd files_manager
   ```

2. **Install Dependencies**:
   Run the following command to install all necessary packages from `package.json`:
   ```bash
   npm install
   ```

3. **Environment Configuration**:
   - Ensure **MongoDB** and **Redis** servers are running on your local machine.
   - Update any configuration files as needed for your environment.

4. **Run the Server**:
   Start the application server with:
   ```bash
   npm run start-server
   ```

5. **Run the Background Worker**:
   Start the background worker to handle tasks like thumbnail generation:
   ```bash
   npm run start-worker
   ```

6. **Linting**:
   Run ESLint to check for code quality and style issues:
   ```bash
   npm run lint
   ```

## Scripts

- `lint`: Run ESLint to analyze code.
- `check-lint`: Check the linting for files.
- `start-server`: Start the main server using **babel-node** and **nodemon**.
- `start-worker`: Start the background worker.
- `dev`: Run the server in development mode.
- `test`: Run tests using **Mocha** and **Chai**.

## Provided Files

### `package.json`

Contains dependencies and scripts for managing the project.

### `.eslintrc.js`

Configuration for ESLint, extending Airbnb’s style guide with specific overrides.

### `babel.config.js`

Configuration for Babel, ensuring compatibility with the current Node version.

## Dependencies

- **Express**: Web framework for building APIs.
- **MongoDB**: NoSQL database for data storage.
- **Redis**: In-memory data store for temporary data.
- **Bull**: Queue library for background job processing.
- **Image-Thumbnail**: Utility for generating thumbnails.
- **UUID**: Library for generating unique identifiers.
- **SHA1**: For hashing data.
- **Mocha & Chai**: For testing.

## Getting Started

Once set up, explore the platform by logging in and testing the various endpoints for file upload, listing, viewing, and managing file permissions.


## Authors
 Abrielle Perry

 - <a href="mailto:abrielleperry22@icloud.com">Email</a>
 - [LinkedIn](www.linkedin.com/in/abriellerperry)
  - [GitHub](https://github.com/abrielleperry)
