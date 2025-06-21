#!/usr/bin/env bash
set -e

# ── CONFIG ─────────────────────────────────────────────────────────────────────
RG="rg-nodegoat-dast"
LOC="eastus"
ENV="aca-env-nodegoat"
APP="nodegoat"
IMAGE="nirocr/nodegoat:latest"      # ← your Docker Hub image
# ────────────────────────────────────────────────────────────────────────────────

# Log in & select subscription (if needed)
# az login
# az account set --subscription "YOUR_SUBSCRIPTION_ID"

# (Optional) Re-create your RG / VNET / NSG / etc. from earlier steps…
# …[your existing infrastructure provisioning code goes here]…

# Finally, create (or update) the Container App to use your Hub image:
az containerapp create \
  --resource-group $RG \
  --name $APP \
  --environment $ENV \
  --image docker.io/$IMAGE \
  --target-port 4000 \
  --ingress external \
  --min-replicas 1 \
  --max-replicas 1

# Show the URL:
echo "Your NodeGoat is live at:"
az containerapp show \
  --resource-group $RG \
  --name $APP \
  --query properties.configuration.ingress.fqdn -o tsv

