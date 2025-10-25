# Deployment Guide

Your snake game is a static website, so it's very easy to deploy! Here are several free options:

## Option 1: GitHub Pages (Recommended)

The easiest way since your code is already on GitHub:

1. Go to your repository on GitHub: `https://github.com/Dr-Kaya/snakegame`
2. Click on **Settings** tab
3. Scroll down to **Pages** section (in the left sidebar)
4. Under **Source**, select your branch: `claude/create-snake-game-011CUT4hzoeFNgjM8291dVkB`
5. Click **Save**
6. Wait a few minutes, then your game will be live at:
   `https://dr-kaya.github.io/snakegame/`

Note: You may want to merge your branch to `main` first for a cleaner deployment.

## Option 2: Netlify (Drag & Drop)

Super simple, no command line needed:

1. Go to [netlify.com](https://www.netlify.com/)
2. Sign up for free (can use GitHub login)
3. Drag and drop your project folder into Netlify
4. Done! You'll get a URL like `https://your-snake-game.netlify.app`

### Netlify with Git (Automatic Updates)

1. Connect your GitHub repository to Netlify
2. Select branch: `claude/create-snake-game-011CUT4hzoeFNgjM8291dVkB`
3. Build settings: Leave empty (no build needed)
4. Publish directory: Leave as root `/`
5. Deploy!

## Option 3: Vercel

Similar to Netlify:

1. Go to [vercel.com](https://vercel.com/)
2. Sign up with GitHub
3. Import your repository
4. Select your branch
5. Deploy!

Your site will be at `https://your-project.vercel.app`

## Option 4: Surge.sh (Command Line)

Quick deployment via terminal:

```bash
# Install surge globally
npm install -g surge

# Deploy from your project directory
surge
```

Follow the prompts and you'll get a URL like `https://snake-game.surge.sh`

## Option 5: Cloudflare Pages

1. Go to [pages.cloudflare.com](https://pages.cloudflare.com/)
2. Connect your GitHub account
3. Select your repository
4. Configure:
   - Build command: (leave empty)
   - Build output directory: `/`
5. Deploy!

## Recommended: GitHub Pages

Since your code is already on GitHub, **GitHub Pages** is the simplest option. Just enable it in your repository settings, and you're done!

## After Deployment

Once deployed, share your game URL with friends and enjoy! The game works on both desktop and mobile browsers.

## Custom Domain (Optional)

All these services allow you to use a custom domain if you have one. Check their documentation for domain setup instructions.
