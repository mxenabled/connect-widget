# Title

Folder structure

## Date proposed

05-14-2026

## Context

With our current repository structure we have the following cons:

1. You must understand the language and framework to be able to find things
1. You must dig through multiple folders to be able to get a grasp of what a single domain does
1. It isn't obvious what works together without looking through code

## Decision

We will follow screaming architecture. Our folder structure will look something like the following:

```
src/
├── Institutions/
│   ├── Institution/
│   │   ├── api.ts
│   │   └── Institution.tsx
│   ├── api.ts
│   └── Institutions.tsx
├── Member/
│   ├── api.ts
│   └── Member.tsx
└── shared/
    ├── Member/
    │   ├── api.ts
    │   ├── consts.ts
    │   └── utils.ts
    └── Validation/
        ├── date.ts
        └── required.ts
```

All folders underneath src and shared are domains. Things don't go into the shared folder until they are actually shared. They stay in their domain underneath src until then.

## Consequences

1. It will be easier to find things
1. It will be easier to understand how related things work together
1. Our folders will have a clear structure to be followed
