FROM public.ecr.aws/lambda/nodejs:14

WORKDIR ${LAMBDA_TASK_ROOT}
COPY ./package.json ./package.json
RUN npm install

COPY ./src/* ./
# COPY ./models ./models
# COPY ./migrations ./migrations
# COPY ./seeds ./seeds

CMD ["./index.handler"]