# backend/Dockerfile

FROM python:3.12-slim AS builder
WORKDIR /app
ENV PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1

RUN apt-get update && \
	apt-get install -y --no-install-recommends build-essential && \
	rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

FROM python:3.12-slim
WORKDIR /app
ENV PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1 PATH=/root/.local/bin:$PATH

COPY --from=builder /root/.local /root/.local
COPY . .

EXPOSE 5000
CMD ["python", "run.py"]
