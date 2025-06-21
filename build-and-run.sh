#!/usr/bin/env bash
set -e

IMAGE=nirocr/nodegoat:latest

# 1. Build your monolithic NodeGoat+Mongo image
docker build -t $IMAGE .

# 2. Push it to Docker Hub
docker push $IMAGE

# 3. Quick smoke-test
docker run --rm -d -p 4000:4000 --name nodegoat-test $IMAGE
echo "Waiting for NodeGoat to come up…"
sleep 5

# 4. Test HTTP
if curl -sSf http://localhost:4000 >/dev/null; then
  echo "✅ HTTP OK"
else
  echo "❌ HTTP FAILED"
  docker logs nodegoat-test
  exit 1
fi

# 5. Cleanup
docker rm -f nodegoat-test
echo "All done!"

