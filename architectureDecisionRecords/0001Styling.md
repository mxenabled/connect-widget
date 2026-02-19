# Title

Styling our html

## Date proposed

08-19-2025

## Context

According to the [state of css 2025](https://2025.stateofcss.com/en-US) the tools that people are the most happy with in 2025 are [css modules](https://github.com/css-modules/css-modules) and [tailwindcss](https://tailwindcss.com/).

Tailwind pollutes your jsx with a lot of classnames, and requires you to learn a bunch of classnames that won't be useful if you move away from the framework.

CSS modules gives a lot of the benefits of styled components, but with faster performance. Using CSS modules will keep our basic css skills in tact.

## Decision

We will use CSS modules to style our html.

## Consequences

We will have a performant and easy to use system for styling.
