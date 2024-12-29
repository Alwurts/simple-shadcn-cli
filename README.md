# simple-shadcn-cli

A CLI tool for creating shadcn-cli custom registry items

## Features

- Interactive CLI interface
- Support for multiple registry types
- Multiple file support per registry item
- Automatic directory creation
- File overwrite protection

## Usage

Run the CLI tool:

```bash
npx simple-shadcn-cli
```

The CLI will guide you through an interactive process to:

1. Specify output directory (defaults to `public/registry`)

2. Enter registry item details:
   - Name (optional, will use first file name if not specified)
   - Type (ui, lib, hook, or block)
   - Description (optional)
   - Dependencies (optional)
   - Dev Dependencies (optional)
   - Registry Dependencies (optional)

3. Add one or more files:
   - File path
   - File type (ui, lib, hook, or block)
   - Option to add multiple files

### Registry Types

The tool supports the following registry types:

- `registry:ui` - UI components
- `registry:lib` - Library utilities
- `registry:hook` - React hooks
- `registry:block` - Block components

### Output Format

The tool generates a JSON file with the following structure:

```json
{
  "name": "component-name",
  "type": "registry:ui",
  "description": "Optional description",
  "dependencies": ["optional-dependencies"],
  "devDependencies": ["optional-dev-dependencies"],
  "registryDependencies": ["optional-registry-dependencies"],
  "files": [
    {
      "path": "ui/component.tsx",
      "type": "registry:ui",
      "content": "file content here"
    }
  ]
}
```

## Exposing your registry item to the public with shadcn-cli

To use this registry item with the shadcn-cli expose the created json file. For example you can add it to your website public folder or expose it as Github Gist. Below is an example of how easily deploy too a gist and use it with shadcn-cli.

### Github Gist

1. Create a gist with the json file
2. Get the gist raw url
3. Use the gist raw url with the shadcn-cli add command

    ```bash
    npx shadcn@latest add https://gist.githubusercontent.com/your-username/your-gist-id/raw/your-file.json
    ```

## Development

To set up the development environment:

```bash
# Clone the repository
git clone <repository-url>
cd simple-shadcn-cli

# Install dependencies
npm install

# Build the project
npm run build

# Run in development mode
npm run dev
```

## License

ISC
