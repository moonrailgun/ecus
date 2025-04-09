# ECUS

## What is ECUS?

ECUS (Expo Custom Update System) is an open source alternative to EAS (Expo Application System). It provides a self-hosted solution for managing updates to your React Native Expo applications without requiring app store approval for each update.

## Features

- 🖥️ Self-hosted update server built with Next.js
- 🛠️ CLI tool for publishing updates to your ECUS server
- 🔄 Support for multiple projects and channels
- 📝 Git integration for tracking deployment history
- 🔐 User authentication and API key management
- 🐳 Docker deployment support

## Installation Guide

### Server Setup

#### Option 1: Docker (Recommended)

1. Clone the repository:
   ```bash
   git clone https://github.com/moonrailgun/ecus.git
   cd ecus
   ```

2. Configure environment variables:
   Directly modify the `docker-compose.yml` file to set the environment variables.

3. Run with Docker Compose:
   ```bash
   docker-compose up -d
   ```

   This will start the ECUS server on port `5433` by default.

#### Option 2: Manual Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/moonrailgun/ecus.git
   cd ecus
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Configure environment variables:
   Create a `.env` file in the `./app` directory based on `.env.example`

4. Start the development server:
   ```bash
   pnpm dev
   ```

### CLI Installation

Install the ECUS CLI globally using npm:

```bash
npm install -g ecus-cli
```

## Usage

### Server Administration

1. Access the ECUS dashboard at `http://your-server:5433`
2. Create a new account or sign in
3. Create a new project and generate an API key
4. Create channels for your project (e.g., production, staging)

### Client Configuration

1. Initialize ECUS in your Expo project:
   ```bash
   cd your-expo-project
   ecus init
   ```
   Follow the prompts to configure your ECUS server URL, project ID, and API key.

2. Configure your Expo app to use ECUS:
   ```bash
   ecus config
   ```
   This will update your Android and iOS configuration files.

### Publishing Updates

Publish a new update to your ECUS server:

```bash
ecus update
```

To publish and promote to a specific channel:

```bash
ecus update --promote default
```

## Architecture

ECUS consists of two main components:

1. **Server**: A Next.js application that handles update storage, project management, and user authentication.
2. **CLI**: A command-line tool that bundles and uploads your Expo app's JavaScript code to the ECUS server.

The system integrates with the expo-updates library in your React Native app to check for and download updates from your ECUS server.

## FAQ

### How does ECUS compare to EAS Update?

ECUS provides a self-hosted alternative to EAS Update, giving you full control over your update infrastructure without subscription fees and traffic fees.

### Can I migrate from EAS Update to ECUS?

Yes, you can migrate by configuring your app to use ECUS instead of EAS Update. Your end users won't notice the difference.

### Can I use EAS Update for development and use ECUS in production?

Yes, you can use both EAS Update and ECUS in your development and production environments. you can use `npx ecus-cli config` to sync app config to ios/android's config. which you can split different channel and update server url.

### How do I set up authentication for production?

When you deploy in production and cannot sign in with the correct URL, please set `NEXTAUTH_URL=https://<your-domain>.com` and `AUTH_REDIRECT_PROXY_URL=https://<your-domain>.com/api/auth` to assign the redirect URI.

### Does ECUS support rollbacks?

Yes, you can roll back to a previous update by promoting an earlier build to your desired channel. you dont need rebuild like eas update again.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
