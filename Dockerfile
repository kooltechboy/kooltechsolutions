FROM python:3.11-slim

WORKDIR /app

# Create non-root user for running the agent
RUN groupadd -r agent && useradd -r -g agent -d /app -s /sbin/nologin agent

# Copy requirements first for build caching
COPY src/agent-python/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy the Python agent source files
COPY src/agent-python/ ./src/agent-python/

# Set ownership and switch to non-root user
RUN chown -R agent:agent /app
USER agent

# Expose LiveKit worker port (default is 8081 for HTTP health checks)
EXPOSE 8081

# Start the agent worker in production mode
CMD ["python", "src/agent-python/agent.py", "start"]
