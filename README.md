# simple-shadcn-cli

A CLI tool for transforming files into JSON format with specific registry types.

## Installation

```bash
npm install -g simple-shadcn-cli
```

## Usage

Run the CLI tool:

```bash
simple-shadcn-cli
```

The CLI will prompt you for:

1. The path to the input file you want to transform
2. The type of registry (ui or hook)
3. The path where you want to save the output JSON file

### Features

- Cross-platform compatibility (Windows, Linux, Mac)
- Interactive prompts for file paths and registry type
- Automatic directory creation if output path doesn't exist
- Confirmation prompt before overwriting existing files
- Pretty-printed JSON output

### Output Format

The tool generates a JSON file with the following structure:

```json
{
  "type": "registry:ui" | "registry:hook",
  "content": "your file content here"
}
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
