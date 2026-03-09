# Skill: Commit Manager

**Description:** Use this skill whenever the user asks to commit changes to the repository.

## Commit Guidelines

- **Language:** All commit messages MUST be written in **English**.
- **Format:** MUST strictly follow the **Conventional Commits** specification.
- **Structure:** `<type>[optional scope]: <description>`

### Allowed Types:

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools and libraries such as documentation generation

### Procedure

1. Stage the files related to the specific change using `git add <files>`. If it's a general sweep, ask the user if `git add .` is appropriate or just run it if the context is clear.
2. Based on the staged changes, formulate a Conventional Commit message in English.
3. Present the **PLAN** with the explicit `git commit -m "..."` command to the user.
4. Wait for the `PLAN APPROVED` confirmation.
5. Create the commit using the `run_command` tool.
