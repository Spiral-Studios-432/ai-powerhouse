# Setting Up GitHub Repository

This guide will help you create a new GitHub repository for AI-Powerhouse and push your code.

## Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the **"+"** icon in the top right → **"New repository"**
3. Repository name: `ai-powerhouse` (or your preferred name)
4. Description: "Orchestration layer for MAA system - microservices-based AI agent coordination"
5. Choose **Public** or **Private**
6. **DO NOT** initialize with README, .gitignore, or license (we already have these)
7. Click **"Create repository"**

## Step 2: Push to GitHub

After creating the repository, GitHub will show you commands. Use these:

```bash
cd "/Users/Dadio/My Drive/00.  MAA_PROJECT_MASTER/AI-POWERHOUSE 2"

# Add the remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/ai-powerhouse.git

# Or if using SSH:
# git remote add origin git@github.com:YOUR_USERNAME/ai-powerhouse.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

## Alternative: Using GitHub CLI

If you have GitHub CLI installed:

```bash
cd "/Users/Dadio/My Drive/00.  MAA_PROJECT_MASTER/AI-POWERHOUSE 2"
gh repo create ai-powerhouse --public --source=. --remote=origin --push
```

## Verify

After pushing, verify at: `https://github.com/YOUR_USERNAME/ai-powerhouse`

## Next Steps

1. Add collaborators (if needed)
2. Set up GitHub Actions for CI/CD (optional)
3. Configure branch protection rules (optional)
4. Add repository topics: `ai`, `microservices`, `nats`, `nodejs`, `maa`

