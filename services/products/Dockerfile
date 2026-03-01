# FROM python:3.13-slim
# WORKDIR /app
# COPY . /app
# RUN pip3 install --no-cache-dir -r requirements.txt
# EXPOSE 8001
# CMD ["python", "manage.py", "runserver", "0.0.0.0:8001"]

FROM python:3.13-slim
WORKDIR /app
COPY . /app
RUN pip3 install --no-cache-dir -r requirements.txt

RUN opentelemetry-bootstrap -a install

ENV DEBUG=True
ENV OTEL_PYTHON_LOGGING_AUTO_INSTRUMENTATION_ENABLED=true
ENV OTEL_EXPORTER_OTLP_ENDPOINT=http://bmz-otel-collector:4317


EXPOSE 8001

CMD ["opentelemetry-instrument","--service_name","products-service","python", "manage.py", "runserver", "--noreload", "--skip-checks", "0.0.0.0:8001"]