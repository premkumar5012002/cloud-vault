# CloudVault

A web based cloud storage platform build in React.

## Screenshots

![App Screenshot](https://premkumar.vercel.app/_next/image?url=%2Fscreenshots%2Fcloudvault.webp&w=1080&q=75)

## Features

- Beautiful, fast and modern by NextUI.
- Authentication using lucia auth.
- Backend express server to zip multiple files with streaming.
- Async file upload feature that supports uploading a maximum of 5 files at a time, with real-time progress tracking.
- AWS Lambda webhook to trigger when file is uploaded to S3 to update database to ensure data integrity.

## Tech Stack

CloudVault is built using the following technologies:

### Frontend

- **Next.js**

- **NextUI**

### Services

- **AWS S3**
- **AWS Lambda**

### Authentication

- **Lucia**

### Database

- **Redis**

- **Drizzle**

- **PostgreSQL**
