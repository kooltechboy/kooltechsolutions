FROM python:3.11-slim

WORKDIR /app

# Copy requirements first for build caching
COPY src/agent-python/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy the Python agent source files
COPY src/agent-python/ ./src/agent-python/

# Expose LiveKit worker port (default is 8081 for HTTP health checks)
EXPOSE 8081

# Start the agent worker in production mode
CMD ["python", "src/agent-python/agent.py", "start"]
