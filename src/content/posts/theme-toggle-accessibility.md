---
title: 'Building This Page: Theme Toggle and Accessibility'
author: 'Cats-n-Coffee'
description: 'Notes from building a decent page.'
pubDate: 2024-02-09
image:
    url: ''
    alt: ''
tags: ['building this page', 'frontend', 'javascript']
---
While building this blog, a lot of ideas are coming to mind. One of them is to make this page as accessible as possible, so everyone who might come across it has a good experience.

## Backstory and Motivation
Most of my frontend knowledge comes from building projects and reading or looking at others' code and projects, which happened mostly on the Frontend Mentor (FEM) platform. It's a great platform to build realistic projects and get feedback from other members, more or less experienced. There are a couple members very knowledgeable about accessibility who give very much appreciated feedback on the topic. Certain changes can be very simple such as respecting HTML semantics (use the correct tag for the job).

## Scratching the Surface
Back to the theme toggle, and remembering a conversation on Frontend Mentor where - to summarize - members said there are many way to implement them, but a lot of solutions are not actually accessible. 
Looking into this while building the theme toggle for this page, a quick Google search (or Brave rather) gives us some good reads:
1. [An Accessible Toggle by Kitty Giraudel](https://kittygiraudel.com/2021/04/05/an-accessible-toggle/)
2. [Under Engineered Toggles Too by Adrian Roselli](https://adrianroselli.com/2019/08/under-engineered-toggles-too.html)

Using those articles to decide on a first version, the `<button>` option seems to make the most sense as we're using the toggle control for a theme switcher. The second article explains the whys of checkbox vs button, and it makes sense.

Back to our case, we used `aria-label` on the `<button>` and placed the two icons inside a common `<div>` as direct child of the `<button>`. This seems to check some boxes for accessibility, but will need improvements (at the time of writing, basic states for hover and focus are not implemented).

## After Thoughts...
Accessibility is a broad topic and just like everything else on this page, it's a work in progress, and a good start for now.