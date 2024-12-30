# simple-shadcn-cli

A CLI tool for creating shadcn-cli custom registry items

## Features

- Interactive CLI interface for creating individual registry items
- Automated build process for project-wide registry components
- Support for multiple registry types
- Multiple file support per registry item
- File overwrite protection
- TypeScript types for registry schema

### shadcn CLI Registry Types

The tool currently supports the following shadcn CLI registry types:

- `registry:ui` - UI components
- `registry:lib` - Library utilities
- `registry:hook` - React hooks

## Usage

The CLI provides two main commands:

```bash
# For interactive creation of single registry items
npx simple-shadcn-cli create

# For building registry items from your project
npx simple-shadcn-cli build
```

### Create Command

The `create` command guides you through an interactive process to create individual registry items:

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

### Build Command

The `build` command is designed for projects that want to maintain their registry components within their codebase. It automatically processes your registry components and generates the required JSON files.

To use the build command:

1. Create a `simple-shadcn.json` configuration file in your project root:

```json
{
  "outputDir": "public/registry",
  "registryDirectory": "src/registry"
}
```

Configuration options:

- `outputDir`: Directory where the generated JSON files will be saved
- `registryDirectory`: Directory containing your registry configuration and components

2. Organize your registry components in the specified registry directory. Create an `index.ts` or `index.js` file that exports your registry configuration:

```typescript
export const registry = [
  {
    name: "button-big",
    type: "registry:ui",
    description: "A big button component",
    files: [
      {
        path: "ui/button-big.tsx",
        type: "registry:ui"
      }
    ]
  }
  // ... more registry items
];
```

3. Run the build command:

```bash
npx simple-shadcn-cli build
```

The command will:

- Parse your registry configuration
- Process all component files
- Generate JSON files in the specified output directory

### TypeScript Types

The CLI exports TypeScript types for the registry schema, making it easier to type your registry configuration:

```typescript
import type { Registry, RegistryItem, RegistryItemFile } from "simple-shadcn-cli";

// Your registry configuration with proper typing
export const registry: Registry = [
  {
    name: "button-big",
    type: "registry:ui",
    description: "A big button component",
    files: [
      {
        path: "ui/button-big.tsx",
        type: "registry:ui"
      }
    ]
  }
];
```

Available types:

- `Registry`: Array of registry items
- `RegistryItem`: Single registry item configuration
- `RegistryItemFile`: File configuration within a registry item

### Output Format

The tool generates JSON files with the following structure:

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

To use your registry items with the shadcn-cli, expose the created JSON files. For example, you can add them to your website public folder or expose them as Github Gists.

### Github Gist

1. Create a gist with the JSON file
2. Get the gist raw url
3. Use the gist raw url with the shadcn-cli add command

    ```bash
    npx shadcn@latest add https://gist.githubusercontent.com/your-username/your-gist-id/raw/your-file.json
    ```

## Coming soon

- [ ] Add support for all registry types currently we are only supporting ui, lib, and hook
- [x] Add more configuration options for build command

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

MIT
