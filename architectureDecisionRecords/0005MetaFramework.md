# Title

Meta Framework

## Date proposed

05-20-2026

## Context

React has been recommending for the past 3 years to use a meta framework. They have been pushing the community towards SSR and React Server Components. There are multiple meta frameworks that support these.

The top 3 are

1. [NextJS](https://nextjs.org/) (~36,000,000 weekly downloads) (55% positive sentiment)
1. [React Router v7 Framework Mode/Remix](https://reactrouter.com/) (~2,300,000 weekly downloads) (68% positive sentiment)
1. [Tanstack Start](https://tanstack.com/start/latest) (~38,000 weekly downloads) (No data for sentiment)

## Decision

When building new apps we will default to NextJS. If a frontend project doesn't make sense to build in NextJs, then we can build it with our old stack of Vite and React.

## Consequences

We won't be able to just push our NextJS apps up to an S3 bucket. We will have to deploy them. Engineers will have to learn the NextJS framework. We will have to worry about server and client side state.

Users of our products will get faster page load times due to SSR. We have the option of building our backend in typescript with NextJS.
