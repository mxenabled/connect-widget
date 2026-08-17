# Title

Styling our html

## Date proposed

08-19-2025

## Context

According to the [state of css 2025](https://2025.stateofcss.com/en-US) the tools that people are the most happy with in 2025 are [css modules](https://github.com/css-modules/css-modules) and [tailwindcss](https://tailwindcss.com/).

Tailwind pollutes your jsx with a lot of classnames, and requires you to learn a bunch of classnames that won't be useful if you move away from the framework.

CSS modules gives a lot of the benefits of styled components, but with faster performance. Using CSS modules will keep our basic css skills in tact.

We also need to work with both CSS modules and MXUI. MXUI uses [MUI](https://mui.com/) under the hood, which provides its own styling mechanisms (the `sx` and `xs` props). This means we need clear guidance on when to reach for CSS modules versus MUI's built-in styling props.

## Decision

We will use CSS modules to style our html.

When we need to add spacing between two elements, we should use a MUI [Stack](https://mui.com/material-ui/react-stack/) with a `spacing` prop.

When styling elements we should use CSS modules instead of using the `sx` or `xs` props that MUI provides. The only exception to using the `xs` prop is if you need to write breakpoint specific code. MUI does not expose its breakpoints as css theme variables.

When using a Stack we can use all the flexbox related props directly on the Stack except for `gap` and `flexDirection`. We should use the Stack's `direction` and `spacing` props instead. This allows us to quickly write layout code without having to make specific classes for every stack.

## Consequences

We will have a performant and easy to use system for styling that works consistently across CSS modules and MXUI/MUI.
