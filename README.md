# Confold

Cleaning Up Config Chaos with Confold.

## Core Concepts

Confold is a robust tool designed to manage configuration files. It pairs seamlessly with git and integrates smoothly with existing projects.

By default, Confold handles top-level configuration files that are **excluded from `.gitignore`**. These files' states are maintained and monitored by files within the `.confold` directory via git.

Fundamentally, Confold performs one critical task: before a project is committed to git, it clones the state of tracked configuration files from the project root to the `.confold` directory. These files are then restored back to the project root whenever they are needed.

## Usage

### Initialization

```bash
confold init
```

Upon initialization, Confold generates a `.confold` directory in the project root and a `.confold` file within that directory. The `.confold` file is utilized to monitor the configuration files managed by Confold.

### Tracking

To have Confold manage a configuration file, follow these steps:

1. Add the configuration file to `.gitignore` for exclusion.
2. Append the configuration file name to `.confold/.confold`.
3. Execute `confold sync` to align the configuration state with the `.confold` directory.

> `confold sync` harmonizes the configuration file state from the project root with the `.confold` directory.

### Retrieval

To commence work on a project, execute `confold retrieve`. This action syncs the configuration state from the `.confold` directory to the project root.

> `confold retrieve` coordinates the configuration file state from the `.confold` directory to the project root.

### Editing

Once you've retrieved the configuration file state, you're free to edit the configuration file as necessary. 

Remember to execute `confold sync` to ensure the updated configuration state is echoed back to the `.confold` directory after your edits.

## Git Hooks

Leverage git hooks to automate the process of syncing configuration file states.

Include `confold sync` in the `pre-commit` hook to coordinate configuration file states before committing.

Add `confold retrieve` to the `post-checkout` hook to synchronize configuration file states after checking out.
