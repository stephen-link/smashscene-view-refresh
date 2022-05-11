# smashscene-view-refresh

## DOCKER ##
docker build -t smashscene-view-refresh .
docker run -p 9000:8080 --env-file docker_env.list smashscene-view-refresh:latest

curl -XPOST "http://localhost:9000/2015-03-31/functions/function/invocations" -d '{}'