<div align="center">
<h1 >
  <span style="color:#5FB0EF">Notion</span>Watcher
</h1>
<h4>
An API to generate a random word and translate them
</h4>
<a href="https://github.com/choucroute-orga/notion-watcher/actions"><img src="https://img.shields.io/github/actions/workflow/status/choucroute-orga/notion-watcher/ci.yml?label=build&logo=github&style=flat" alt="ci"></a>
  <a href="https://linguagen.gridexx.fr"><img src="https://therealsujitk-vercel-badge.vercel.app/?app=linguagen" alt="api"></a>
  <a href="https://github.com/choucroute-orga/notion-watcher"><img src="https://img.shields.io/github/stars/choucroute-orga/notion-watcher.svg?style=flat" alt="stars"></a>
  <a href="https://github.com/choucroute-orga/notion-watcher"><img src="https://img.shields.io/github/license/choucroute-orga/notion-watcher.svg?style=flat" alt="license"></a>
</div>

## Setup

Follow these steps to set up and run the project.

### Prerequisites

- Node.js installed
- NPM (Node Package Manager) installed

## Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/choucroute-orga/notion-watcher.git
    ```

2. Navigate to the project directory:

    ```bash
    cd notion-watcher
    ```

3. Install dependencies:

    ```bash
    npm install
    ```

## Configuration

You first need to set up the integration with Notion:

- Create a new [integration](https://www.notion.so/my-integrations) inside your workspace.
- Copy the `Internal Integration Token` and add it to the `.env` file.
- On Notion.so go to your workspace and share the page with the integration.


## Running the Project

Start the project:

```bash
npm start
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Author

Made during Christmas 2023 🎄 by a BMX 🚲 rider.
