# ----- 0.  Variables you can tweak -----
RG="rg-nodegoat-dast"
LOC="eastus"
ACR="acrnodegoat$RANDOM"          # must be globally unique
ENV="aca-env-nodegoat"
APP="nodegoat"

# ----- 1.  Resource Group in isolation -----
az group create -n $RG -l $LOC

# ----- 2.  Azure Container Registry -----
az acr create -n $ACR -g $RG -l $LOC --sku Basic --admin-enabled false
az acr login -n $ACR
docker tag nodegoat:latest $ACR.azurecr.io/nodegoat:latest
docker push $ACR.azurecr.io/nodegoat:latest

# ----- 3.  Virtual Network (no peering) -----
VNET="vnet-nodegoat"
SUBNET="snet-aca"
az network vnet create \
   -g $RG -n $VNET -l $LOC \
   --address-prefix 10.42.0.0/16 \
   --subnet-name $SUBNET \
   --subnet-prefix 10.42.1.0/24

az network vnet subnet update \
  --resource-group $RG \
  --vnet-name $VNET \
  --name $SUBNET \
  --delegations Microsoft.App/environments \
  --disable-private-endpoint-network-policies true


# ----- 4.  Container Apps environment (Workload Profile model) -----
az extension add --name containerapp --upgrade
az containerapp env create \
   -g $RG -n $ENV \
   --location $LOC \
   --infrastructure-subnet-resource-id \
     $(az network vnet subnet show -g $RG --vnet-name $VNET -n $SUBNET --query id -o tsv)

# ----- 5.  Container App itself -----
az containerapp create \
   -g $RG -n $APP \
   --environment $ENV \
   --image $ACR.azurecr.io/nodegoat:latest \
   --target-port 4000 --ingress external \
   --min-replicas 1 --max-replicas 1 \
   --registry-server $ACR.azurecr.io \
   --revisions-mode single \
   --cpu 0.25 --memory 0.5Gi \
   --query "properties.configuration.ingress.fqdn" -o tsv

