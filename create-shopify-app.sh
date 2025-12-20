#!/usr/bin/env bash

set -e

REPO_URL="https://github.com/truonghm/shopify-app-template-react-router.git"
BRANCH="truonghm-template"

if [ -z "$1" ]; then
  echo "Error: Project name is required"
  echo "Usage: $0 <project-name>"
  echo "       $0 .  (to use current directory)"
  echo "Example: $0 my-shopify-app"
  exit 1
fi

PROJECT_NAME="$1"

if [ "$PROJECT_NAME" = "." ]; then
  echo "Setting up Shopify app in current directory..."
  echo "Cloning template from $REPO_URL (branch: $BRANCH)..."

  TEMP_DIR=$(mktemp -d)

  trap 'rm -rf "$TEMP_DIR"' EXIT

  git clone --branch "$BRANCH" --single-branch "$REPO_URL" "$TEMP_DIR"

  echo "Copying template files to current directory..."
  cp -r "$TEMP_DIR"/. .

  echo "Removing git history..."
  rm -rf .git

  echo "Initializing fresh git repository..."
  git init
  git add .
  git commit -m "Initial commit from shopify-app-template-react-router"

  echo ""
  echo "Success! Your Shopify app has been set up in the current directory"
  echo ""
  echo "Next steps:"
  echo "  pnpm install"
  echo "  pnpm run dev"
else
  if [ -d "$PROJECT_NAME" ]; then
    echo "Error: Directory '$PROJECT_NAME' already exists"
    exit 1
  fi

  echo "Creating new Shopify app: $PROJECT_NAME"
  echo "Cloning template from $REPO_URL (branch: $BRANCH)..."

  git clone --branch "$BRANCH" --single-branch "$REPO_URL" "$PROJECT_NAME"

  cd "$PROJECT_NAME"

  echo "Removing git history..."
  rm -rf .git

  echo "Initializing fresh git repository..."
  git init
  git add .
  git commit -m "Initial commit from shopify-app-template-react-router"

  echo ""
  echo "Success! Your new Shopify app has been created in: $PROJECT_NAME"
  echo ""
  echo "Next steps:"
  echo "  cd $PROJECT_NAME"
  echo "  pnpm install"
  echo "  pnpm run dev"
fi
