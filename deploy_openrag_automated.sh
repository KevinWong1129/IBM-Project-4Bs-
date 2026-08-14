#!/bin/bash

# OpenRAG Automated VM Deployment Script
# This script automates the deployment of OpenRAG on a fresh VM
# Version: 2.0 (Fixed with working docker-compose.yml)

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
VM_HOST=""
VM_PORT=""
VM_USER=""
SSH_KEY=""
PYTHON_VERSION="3.13"
OPENRAG_VERSION="0.5.1"

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Parse command line arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --vm-host)
                VM_HOST="$2"
                shift 2
                ;;
            --vm-port)
                VM_PORT="$2"
                shift 2
                ;;
            --vm-user)
                VM_USER="$2"
                shift 2
                ;;
            --ssh-key)
                SSH_KEY="$2"
                shift 2
                ;;
            *)
                log_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done

    # Validate required arguments
    if [[ -z "$VM_HOST" || -z "$VM_PORT" || -z "$VM_USER" || -z "$SSH_KEY" ]]; then
        log_error "Missing required arguments"
        echo "Usage: $0 --vm-host <host> --vm-port <port> --vm-user <user> --ssh-key <path>"
        exit 1
    fi

    # Expand SSH key path
    SSH_KEY="${SSH_KEY/#\~/$HOME}"
    
    # Check if SSH key exists
    if [[ ! -f "$SSH_KEY" ]]; then
        log_error "SSH key not found: $SSH_KEY"
        exit 1
    fi
    
    # Fix SSH key permissions if needed
    chmod 600 "$SSH_KEY" 2>/dev/null || true
}

# SSH execution helper - no filtering, let caller handle banner if needed
ssh_exec() {
    ssh -i "$SSH_KEY" -p "$VM_PORT" \
        -o StrictHostKeyChecking=no \
        -o UserKnownHostsFile=/dev/null \
        -o LogLevel=ERROR \
        -o ServerAliveInterval=60 \
        -o ServerAliveCountMax=3 \
        "${VM_USER}@${VM_HOST}" "$@" 2>&1
}

# Check VM connectivity
check_vm() {
    log_info "Checking VM connectivity..."
    if ssh_exec "echo 'Connected'" > /dev/null 2>&1; then
        log_success "VM is reachable"
    else
        log_error "Cannot connect to VM"
        exit 1
    fi
}

# Check system requirements
check_requirements() {
    log_info "Checking system requirements..."
    
    # Check user namespaces (CRITICAL for podman) - filter banner and extract numeric value
    local user_ns=$(ssh_exec "sysctl user.max_user_namespaces 2>/dev/null" | grep 'user.max_user_namespaces' | grep -o '[0-9]\+' | head -1)
    if [[ -z "$user_ns" ]] || [[ "$user_ns" -lt 15000 ]]; then
        log_error "User namespaces not properly configured (current: ${user_ns:-0}, required: 15000)"
        log_info "Attempting to fix..."
        ssh_exec "sudo sysctl -w user.max_user_namespaces=15000" > /dev/null
        
        # Verify fix - filter banner and extract numeric value
        user_ns=$(ssh_exec "sysctl user.max_user_namespaces 2>/dev/null" | grep 'user.max_user_namespaces' | grep -o '[0-9]\+' | head -1)
        if [[ -z "$user_ns" ]] || [[ "$user_ns" -lt 15000 ]]; then
            log_error "Failed to set user namespaces. Manual intervention required."
            exit 1
        fi
    fi
    
    log_success "System requirements met (user namespaces: $user_ns)"
}

# Clean up corrupted podman state
cleanup_podman() {
    log_info "Cleaning up any corrupted podman state..."
    
    # Check for lock errors with timeout (use perl for timeout on macOS)
    local lock_count=$(ssh_exec "timeout 10 podman ps 2>&1 | grep -c 'acquiring lock' || echo 0" 2>/dev/null | tail -1)
    
    # If timeout or high lock count, assume corruption
    if [[ -z "$lock_count" ]] || [[ "$lock_count" -gt 5 ]]; then
        log_warning "Podman corruption detected, cleaning up..."
        
        # Kill all podman-related processes first
        ssh_exec "pkill -9 podman 2>/dev/null || true"
        ssh_exec "pkill -9 conmon 2>/dev/null || true"
        ssh_exec "pkill -9 crun 2>/dev/null || true"
        sleep 2
        
        # Remove lock files and runtime directories
        ssh_exec "find ~/.local/share/containers/storage -name '*.lock' -delete 2>/dev/null || true"
        ssh_exec "rm -rf /run/user/\$(id -u)/libpod/* 2>/dev/null || true"
        ssh_exec "rm -rf /run/user/\$(id -u)/containers/* 2>/dev/null || true"
        
        # Move corrupted storage (faster than reset)
        ssh_exec "mv ~/.local/share/containers ~/.local/share/containers.bak.\$(date +%s) 2>/dev/null || true"
        ssh_exec "mkdir -p ~/.local/share/containers/storage"
        
        log_success "Corrupted storage cleaned up"
    else
        log_success "Podman state is healthy"
    fi
}



# Install prerequisites
install_prerequisites() {
    log_info "Installing prerequisites on VM..."
    
    # Install system packages
    ssh_exec "sudo dnf install -y podman podman-compose python3-pip 2>&1"
    
    # Install uv (Python package manager)
    ssh_exec "curl -LsSf https://astral.sh/uv/install.sh | sh 2>&1"
    
    # Create docker-compose symlink for consistency
    ssh_exec "sudo ln -sf /usr/bin/podman-compose /usr/local/bin/docker-compose 2>/dev/null || true"
    
    log_success "Prerequisites installed"
}

# Initialize OpenRAG using uvx
initialize_openrag() {
    log_info "Initializing OpenRAG with uvx..."
    
    # Clean up any existing directories with wrong permissions
    ssh_exec "sudo rm -rf ~/.openrag 2>/dev/null || true"
    
    # Create base directory structure with correct ownership
    ssh_exec "mkdir -p ~/.openrag"
    
    # Run OpenRAG initialization (non-interactive)
    ssh_exec "export PATH=\"\$HOME/.local/bin:\$PATH\" && uvx --python ${PYTHON_VERSION} openrag init" || {
        log_warning "OpenRAG init command not available, will create structure manually"
        ssh_exec "mkdir -p ~/.openrag/{tui,config,data/langflow-data,data/ollama,documents,flows/backup,keys}"
    }
    
    # Set permissions to 777 so container user (UID 100999) can write
    # This matches the working VM configuration
    ssh_exec "chmod -R 777 ~/.openrag"
    
    log_success "OpenRAG initialized"
}

# Generate configuration files
generate_configs() {
    log_info "Generating OpenRAG configuration files..."
    
    # Generate secure credentials
    local LANGFLOW_SECRET_KEY=$(openssl rand -base64 43 | tr -d "=+/" | cut -c1-43)
    local OPENSEARCH_PASSWORD=$(openssl rand -base64 16 | tr -d "=+/" | cut -c1-16)
    local OPENRAG_ENCRYPTION_KEY=$(openssl rand -base64 32)
    local SESSION_SECRET=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
    local JWT_SIGNING_KEY=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
    
    # Generate UUIDs for flow IDs
    local LANGFLOW_CHAT_FLOW_ID=$(uuidgen | tr '[:upper:]' '[:lower:]')
    local LANGFLOW_INGEST_FLOW_ID=$(uuidgen | tr '[:upper:]' '[:lower:]')
    local LANGFLOW_URL_INGEST_FLOW_ID=$(uuidgen | tr '[:upper:]' '[:lower:]')
    local NUDGES_FLOW_ID=$(uuidgen | tr '[:upper:]' '[:lower:]')
    
    # Create .env file
    cat > /tmp/openrag.env << EOF
# OpenRAG Environment Configuration
# Auto-generated on $(date)

LANGFLOW_SECRET_KEY='${LANGFLOW_SECRET_KEY}'
OPENSEARCH_PASSWORD='${OPENSEARCH_PASSWORD}'
OPENRAG_ENCRYPTION_KEY='${OPENRAG_ENCRYPTION_KEY}'
SESSION_SECRET='${SESSION_SECRET}'
JWT_SIGNING_KEY='${JWT_SIGNING_KEY}'

# Flow IDs
LANGFLOW_CHAT_FLOW_ID='${LANGFLOW_CHAT_FLOW_ID}'
LANGFLOW_INGEST_FLOW_ID='${LANGFLOW_INGEST_FLOW_ID}'
LANGFLOW_URL_INGEST_FLOW_ID='${LANGFLOW_URL_INGEST_FLOW_ID}'
NUDGES_FLOW_ID='${NUDGES_FLOW_ID}'

# OpenRAG Configuration
OPENRAG_VERSION=${OPENRAG_VERSION}
OPENSEARCH_HOST=os
OPENSEARCH_PORT=9200
OPENSEARCH_USERNAME=admin
OPENSEARCH_INDEX_NAME=documents

# Langflow Configuration
LANGFLOW_PORT=7860
LANGFLOW_AUTO_LOGIN=True
LANGFLOW_SUPERUSER=langflow
LANGFLOW_SUPERUSER_PASSWORD=langflow
LANGFLOW_NEW_USER_IS_ACTIVE=True
LANGFLOW_ENABLE_SUPERUSER_CLI=True

# Authentication Configuration
NO_AUTH_MODE=true
AUTHENTICATION_ENABLED=false

# Frontend Configuration
FRONTEND_PORT=3000

# Ollama Configuration
OLLAMA_ENDPOINT=http://host.docker.internal:11434

# Performance Settings
LANGFLOW_TIMEOUT=2400
LANGFLOW_CONNECT_TIMEOUT=30
INGESTION_TIMEOUT=3600
UPLOAD_BATCH_SIZE=25
MAX_WORKERS=4
LANGFLOW_WORKERS=1
EOF

    # Upload .env
    scp -i "$SSH_KEY" -P "$VM_PORT" -o StrictHostKeyChecking=no \
        -o UserKnownHostsFile=/dev/null -o LogLevel=ERROR \
        /tmp/openrag.env "${VM_USER}@${VM_HOST}:~/.openrag/tui/.env"
    rm /tmp/openrag.env
    
    log_success "Configuration files generated"
    echo "OpenSearch Password: ${OPENSEARCH_PASSWORD}"
}

# Download and customize docker-compose.yml
setup_docker_compose() {
    log_info "Setting up docker-compose.yml..."
    
    # Use uvx to generate the compose file, or use embedded template
    ssh_exec "cd ~/.openrag/tui && export PATH=\"\$HOME/.local/bin:\$PATH\" && uvx --python ${PYTHON_VERSION} openrag compose" || {
        log_warning "Could not generate compose file via uvx, using embedded template"
        
        # Create docker-compose.yml locally first, then upload
        cat > /tmp/docker-compose.yml << 'COMPOSE_EOF'
services:
  opensearch:
    image: docker.io/langflowai/openrag-opensearch:${OPENRAG_VERSION:-latest}
    container_name: os
    environment:
      - discovery.type=single-node
      - OPENSEARCH_INITIAL_ADMIN_PASSWORD=${OPENSEARCH_PASSWORD}
      - OPENSEARCH_JAVA_OPTS=-Xms1g -Xmx1g
    ports:
      - "9200:9200"
      - "9600:9600"
    volumes:
      - opensearch-data:/usr/share/opensearch/data
    stop_grace_period: 2m
    healthcheck:
      test: ["CMD-SHELL", "curl -ku admin:$$OPENSEARCH_PASSWORD 'https://localhost:9200/_cluster/health' -s | grep -qE '\"status\":\"(green|yellow)\"'"]
      interval: 15s
      timeout: 10s
      retries: 20
      start_period: 60s
    restart: unless-stopped

  dashboards:
    image: docker.io/opensearchproject/opensearch-dashboards:3.0.0
    container_name: osdash
    depends_on:
      - opensearch
    environment:
      OPENSEARCH_HOSTS: '["https://${OPENSEARCH_HOST:-opensearch}:${OPENSEARCH_PORT:-9200}"]'
      OPENSEARCH_USERNAME: "${OPENSEARCH_USERNAME:-admin}"
      OPENSEARCH_PASSWORD: ${OPENSEARCH_PASSWORD}
    ports:
      - "5601:5601"

  openrag-backend:
    image: docker.io/langflowai/openrag-backend:${OPENRAG_VERSION:-latest}
    container_name: openrag-backend
    depends_on:
      - langflow
      - opensearch
    environment:
      - OPENSEARCH_HOST=${OPENSEARCH_HOST:-opensearch}
      - OPENSEARCH_URL=https://os:9200
      - LANGFLOW_URL=http://langflow:7860
      - LANGFLOW_PUBLIC_URL=${LANGFLOW_PUBLIC_URL}
      - LANGFLOW_AUTO_LOGIN=True
      - LANGFLOW_SUPERUSER=langflow
      - LANGFLOW_SUPERUSER_PASSWORD=langflow
      - NO_AUTH_MODE=true
      - AUTHENTICATION_ENABLED=false
      - LANGFLOW_CHAT_FLOW_ID=${LANGFLOW_CHAT_FLOW_ID}
      - LANGFLOW_INGEST_FLOW_ID=${LANGFLOW_INGEST_FLOW_ID}
      - LANGFLOW_URL_INGEST_FLOW_ID=${LANGFLOW_URL_INGEST_FLOW_ID}
      - DISABLE_INGEST_WITH_LANGFLOW=${DISABLE_INGEST_WITH_LANGFLOW:-false}
      - INGEST_SAMPLE_DATA=false
      - NUDGES_FLOW_ID=${NUDGES_FLOW_ID}
      - OPENSEARCH_PORT=${OPENSEARCH_PORT:-9200}
      - LANGFLOW_OPENSEARCH_HOST=os
      - LANGFLOW_OPENSEARCH_PORT=9200
      - OPENSEARCH_USERNAME=${OPENSEARCH_USERNAME:-admin}
      - OPENSEARCH_PASSWORD=${OPENSEARCH_PASSWORD}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - WATSONX_API_KEY=${WATSONX_API_KEY}
      - WATSONX_ENDPOINT=${WATSONX_ENDPOINT}
      - WATSONX_PROJECT_ID=${WATSONX_PROJECT_ID}
      - OLLAMA_ENDPOINT=${OLLAMA_ENDPOINT}
      - GOOGLE_OAUTH_CLIENT_ID=${GOOGLE_OAUTH_CLIENT_ID}
      - GOOGLE_OAUTH_CLIENT_SECRET=${GOOGLE_OAUTH_CLIENT_SECRET}
      - MICROSOFT_GRAPH_OAUTH_CLIENT_ID=${MICROSOFT_GRAPH_OAUTH_CLIENT_ID}
      - MICROSOFT_GRAPH_OAUTH_CLIENT_SECRET=${MICROSOFT_GRAPH_OAUTH_CLIENT_SECRET}
      - WEBHOOK_BASE_URL=${WEBHOOK_BASE_URL}
      - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
      - AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
      - AWS_S3_ENDPOINT=${AWS_S3_ENDPOINT}
      - AWS_REGION=${AWS_REGION}
      - IBM_COS_API_KEY=${IBM_COS_API_KEY}
      - IBM_COS_SERVICE_INSTANCE_ID=${IBM_COS_SERVICE_INSTANCE_ID}
      - IBM_COS_ENDPOINT=${IBM_COS_ENDPOINT}
      - IBM_COS_HMAC_ACCESS_KEY_ID=${IBM_COS_HMAC_ACCESS_KEY_ID}
      - IBM_COS_HMAC_SECRET_ACCESS_KEY=${IBM_COS_HMAC_SECRET_ACCESS_KEY}
      - IBM_COS_AUTH_ENDPOINT=${IBM_COS_AUTH_ENDPOINT}
      - OPENSEARCH_INDEX_NAME=${OPENSEARCH_INDEX_NAME:-documents}
      - LANGFLOW_KEY=${LANGFLOW_KEY}
      - SEGMENT_WRITE_KEY=${SEGMENT_WRITE_KEY:-}
      - ENVIRONMENT=${ENVIRONMENT:-production}
      - LANGFLOW_KEY_RETRIES=${LANGFLOW_KEY_RETRIES:-15}
      - LANGFLOW_KEY_RETRY_DELAY=${LANGFLOW_KEY_RETRY_DELAY:-2.0}
      - LANGFLOW_VERSION=${LANGFLOW_VERSION}
      - LOG_FORMAT=${LOG_FORMAT}
      - SERVICE_NAME=${SERVICE_NAME}
      - SESSION_SECRET=${SESSION_SECRET}
      - JWT_SIGNING_KEY=${JWT_SIGNING_KEY}
      - OPENRAG_ENCRYPTION_KEY=${OPENRAG_ENCRYPTION_KEY}
      - LOG_LEVEL=${LOG_LEVEL:-INFO}
      - NO_COLOR=${NO_COLOR:-}
      - ACCESS_LOG=${ACCESS_LOG:-true}
      - LANGFLOW_TIMEOUT=${LANGFLOW_TIMEOUT:-2400}
      - LANGFLOW_CONNECT_TIMEOUT=${LANGFLOW_CONNECT_TIMEOUT:-30}
      - INGESTION_TIMEOUT=${INGESTION_TIMEOUT:-3600}
      - UPLOAD_BATCH_SIZE=${UPLOAD_BATCH_SIZE:-25}
      - MAX_WORKERS=${MAX_WORKERS:-4}
    ports:
      - "0.0.0.0:8000:8000"
    volumes:
      - ${OPENRAG_DOCUMENTS_PATH:-./openrag-documents}:/app/openrag-documents:U,z
      - ${OPENRAG_KEYS_PATH:-./keys}:/app/keys:U,z
      - ${OPENRAG_FLOWS_PATH:-./flows}:/app/flows:U,z
      - ${OPENRAG_FLOWS_BACKUP_PATH:-./flows/backup}:/app/flows/backup:U,z
      - ${OPENRAG_CONFIG_PATH:-./config}:/app/config:U,z
      - ${OPENRAG_DATA_PATH:-./data}:/app/data:U,z
    extra_hosts:
      - "host.docker.internal:host-gateway"

  openrag-frontend:
    image: docker.io/langflowai/openrag-frontend:${OPENRAG_VERSION:-latest}
    container_name: openrag-frontend
    depends_on:
      - openrag-backend
    environment:
      - HOSTNAME=0.0.0.0
      - OPENRAG_BACKEND_HOST=openrag-backend
      - NO_AUTH_MODE=true
      - AUTHENTICATION_ENABLED=false
    ports:
      - "0.0.0.0:${FRONTEND_PORT:-3000}:3000"

  langflow:
    image: docker.io/langflowai/openrag-langflow:${OPENRAG_VERSION:-latest}
    container_name: langflow
    ports:
      - "${LANGFLOW_PORT:-7860}:7860"
    volumes:
      - ${OPENRAG_FLOWS_PATH:-./flows}:/app/flows:U,z
      - ${LANGFLOW_DATA_PATH:-./langflow-data}:/app/langflow-data:U,z
    extra_hosts:
      - "host.docker.internal:host-gateway"
    environment:
      - LANGFUSE_SECRET_KEY=${LANGFUSE_SECRET_KEY:-}
      - LANGFUSE_PUBLIC_KEY=${LANGFUSE_PUBLIC_KEY:-}
      - LANGFUSE_HOST=${LANGFUSE_HOST:-}
      - LANGFLOW_DEACTIVATE_TRACING
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - WATSONX_APIKEY=${WATSONX_API_KEY}
      - LANGFLOW_AUTO_LOGIN=True
      - LANGFLOW_SUPERUSER=admin
      - LANGFLOW_SUPERUSER_PASSWORD=${OPENSEARCH_PASSWORD}
      - LANGFLOW_NEW_USER_IS_ACTIVE=True
      - LANGFLOW_ENABLE_SUPERUSER_CLI=True
      - WATSONX_URL=${WATSONX_URL:-${WATSONX_ENDPOINT}}
      - WATSONX_PROJECT_ID=${WATSONX_PROJECT_ID}
      - OLLAMA_BASE_URL=${OLLAMA_ENDPOINT}
      - LANGFLOW_CONFIG_DIR=/app/langflow-data
      - LANGFLOW_DATABASE_URL=${LANGFLOW_DATABASE_URL:-sqlite:////app/langflow-data/langflow.db}
      - LANGFLOW_SECRET_KEY=${LANGFLOW_SECRET_KEY}
      - JWT=None
      - OWNER=None
      - OWNER_NAME=None
      - OWNER_EMAIL=None
      - CONNECTOR_TYPE=system
      - CONNECTOR_TYPE_URL=url
      - DOCUMENT_ID=None
      - SOURCE_URL=None
      - ALLOWED_USERS=[]
      - ALLOWED_GROUPS=[]
      - OPENRAG-QUERY-FILTER="{}"
      - OPENSEARCH_PASSWORD=${OPENSEARCH_PASSWORD}
      - OPENSEARCH_HOST=os
      - OPENSEARCH_PORT=9200
      - OPENSEARCH_URL=http://os:9200
      - OPENSEARCH_INDEX_NAME=${OPENSEARCH_INDEX_NAME:-documents}
      - DOCLING_SERVE_URL=${DOCLING_SERVE_URL:-http://host.docker.internal:5001}
      - FILENAME=None
      - MIMETYPE=None
      - FILESIZE=0
      - SELECTED_EMBEDDING_MODEL=${SELECTED_EMBEDDING_MODEL:-text-embedding-3-small}
      - LANGFLOW_VARIABLES_TO_GET_FROM_ENVIRONMENT=JWT,OPENRAG-QUERY-FILTER,OPENSEARCH_PASSWORD,OPENSEARCH_URL,DOCLING_SERVE_URL,OWNER,OWNER_NAME,OWNER_EMAIL,CONNECTOR_TYPE,DOCUMENT_ID,SOURCE_URL,ALLOWED_USERS,ALLOWED_GROUPS,FILENAME,MIMETYPE,FILESIZE,SELECTED_EMBEDDING_MODEL,OPENAI_API_KEY,ANTHROPIC_API_KEY,WATSONX_APIKEY,WATSONX_URL,WATSONX_PROJECT_ID,OLLAMA_BASE_URL,OPENSEARCH_INDEX_NAME
      - LANGFLOW_LOG_LEVEL=DEBUG
      - LANGFLOW_WORKERS=${LANGFLOW_WORKERS:-1}
      - LANGFLOW_AUTO_LOGIN=${LANGFLOW_AUTO_LOGIN}
      - LANGFLOW_SUPERUSER=${LANGFLOW_SUPERUSER}
      - LANGFLOW_SUPERUSER_PASSWORD=${LANGFLOW_SUPERUSER_PASSWORD}
      - LANGFLOW_NEW_USER_IS_ACTIVE=${LANGFLOW_NEW_USER_IS_ACTIVE}
      - LANGFLOW_ENABLE_SUPERUSER_CLI=${LANGFLOW_ENABLE_SUPERUSER_CLI}
      - HIDE_GETTING_STARTED_PROGRESS=true

  docling-serve:
    image: quay.io/docling-project/docling-serve-cpu:latest
    container_name: docling-serve
    ports:
      - "5001:5001"
    restart: unless-stopped

volumes:
  opensearch-data:
COMPOSE_EOF
        
        # Upload the compose file
        scp -i "$SSH_KEY" -P "$VM_PORT" -o StrictHostKeyChecking=no \
            -o UserKnownHostsFile=/dev/null -o LogLevel=ERROR \
            /tmp/docker-compose.yml "${VM_USER}@${VM_HOST}:~/.openrag/tui/docker-compose.yml"
        rm /tmp/docker-compose.yml
    }
    
    log_success "docker-compose.yml configured"
}

# Pull container images
pull_images() {
    log_info "Pulling container images (this takes 5-10 minutes)..."
    log_info "Running image pull in background to survive SSH timeouts..."
    
    # Start pull in background, write PID to file
    ssh_exec "cd ~/.openrag/tui && nohup docker-compose pull > ~/openrag_pull.log 2>&1 & echo \$! > ~/openrag_pull.pid"
    sleep 2
    
    # Read PID from file
    local pull_pid=$(ssh_exec "cat ~/openrag_pull.pid 2>/dev/null" | tr -d '\r\n ')
    
    if [ -z "$pull_pid" ]; then
        log_error "Failed to start image pull process"
        exit 1
    fi
    
    log_info "Image pull started with PID: ${pull_pid}"
    log_info "Monitoring progress (checking every 15 seconds)..."
    
    # Poll for completion
    local max_wait=600  # 10 minutes
    local elapsed=0
    
    while [ $elapsed -lt $max_wait ]; do
        # Check if process is still running
        local status=$(ssh_exec "ps -p ${pull_pid} > /dev/null 2>&1 && echo 'running' || echo 'done'" | tail -1 | tr -d '\r\n ')
        
        if [ "$status" = "done" ]; then
            # Process finished, check for errors in log
            if ssh_exec "tail -20 ~/openrag_pull.log 2>/dev/null" | grep -qi "error.*pull\|failed.*pull"; then
                log_error "Image pull failed. Last 50 lines of log:"
                ssh_exec "tail -50 ~/openrag_pull.log 2>/dev/null"
                exit 1
            else
                log_success "Images pulled successfully"
                return 0
            fi
        fi
        
        # Show progress
        echo -n "."
        sleep 15
        elapsed=$((elapsed + 15))
    done
    
    log_error "Image pull timed out after ${max_wait} seconds"
    ssh_exec "tail -50 ~/openrag_pull.log 2>/dev/null"
    exit 1
}

# Start OpenRAG services
start_services() {
    log_info "Starting OpenRAG services..."
    
    # CRITICAL: Ensure all directories have correct permissions for container UID 100999
    log_info "Setting directory permissions for container access..."
    ssh_exec "chmod -R 777 ~/.openrag"
    
    # Clean up any stale lock files first
    log_info "Cleaning up stale podman state..."
    ssh_exec "podman system prune -f 2>/dev/null || true"
    
    # Start services using docker-compose
    ssh_exec "cd ~/.openrag/tui && docker-compose up -d" || {
        log_error "Failed to start services"
        log_info "Attempting recovery..."
        
        # Try to clean up and restart
        ssh_exec "cd ~/.openrag/tui && docker-compose down 2>/dev/null || true"
        sleep 5
        ssh_exec "cd ~/.openrag/tui && docker-compose up -d" || {
            log_error "Recovery failed. Manual intervention required."
            exit 1
        }
    }
    
    log_success "Services start command completed"
}

# Wait for services
wait_for_services() {
    log_info "Waiting for services to be healthy (2-3 minutes)..."
    
    local max_wait=180
    local elapsed=0
    
    while [ $elapsed -lt $max_wait ]; do
        if ssh_exec "podman ps --filter name=openrag-frontend --filter status=running --format '{{.Names}}'" | grep -q "openrag-frontend"; then
            log_success "Services are running"
            return 0
        fi
        sleep 5
        elapsed=$((elapsed + 5))
        echo -n "."
    done
    
    log_warning "Services may still be starting up"
    return 0
}

# Setup Ollama (optional)
setup_ollama() {
    log_info "Setting up Ollama container..."
    
    # Ollama data directory already created in initialize_openrag
    # Ensure it has correct permissions
    ssh_exec "chmod 777 ~/.openrag/data/ollama"
    
    # Start Ollama container
    ssh_exec "podman run -d \
        --name openrag-ollama \
        --network tui_default \
        --network-alias openrag-ollama \
        -p 11434:11434 \
        -v ~/.openrag/data/ollama:/root/.ollama:z \
        --restart unless-stopped \
        docker.io/ollama/ollama:latest" 2>/dev/null || {
        log_warning "Ollama container may already exist"
    }
    
    # Wait for Ollama to be ready
    log_info "Waiting for Ollama to start..."
    sleep 15
    
    # Pull embedding model
    log_info "Pulling Ollama embedding model: nomic-embed-text (this may take 2-3 minutes)..."
    ssh_exec "podman exec openrag-ollama ollama pull nomic-embed-text" || {
        log_warning "Failed to pull nomic-embed-text model"
    }
    
    # Pull LLM model
    log_info "Pulling Ollama LLM: llama3.2 (this may take 5-10 minutes)..."
    ssh_exec "podman exec openrag-ollama ollama pull llama3.2" || {
        log_warning "Failed to pull llama3.2 model"
    }
    
    log_success "Ollama configured with models"
}

# Setup Docling serve container for document parsing
setup_docling_serve() {
    log_info "Setting up Docling serve (official document parsing service)..."
    
    log_info "Pulling official docling-serve image (this may take 2-3 minutes)..."
    ssh_exec "podman run -d \
        --name docling-serve \
        --network tui_default \
        --network-alias docling-serve \
        -p 5001:5001 \
        --restart unless-stopped \
        quay.io/docling-project/docling-serve-cpu:latest" || {
        log_warning "Failed to start docling-serve - OpenRAG will use built-in parsing"
        return 0
    }
    
    log_info "Waiting for Docling serve to start..."
    sleep 15
    
    log_success "Docling serve configured (official image from quay.io)"
}

# Setup Cloudflare tunnel for public access
setup_cloudflare_tunnel() {
    log_info "Setting up Cloudflare tunnel for public access..."
    
    # Start tunnel for frontend (use full docker.io path to avoid short-name resolution)
    local tunnel_output=$(ssh_exec "podman run -d \
        --name openrag-public-tunnel \
        --network tui_default \
        --restart unless-stopped \
        docker.io/cloudflare/cloudflared:latest \
        tunnel --no-autoupdate --url http://openrag-frontend:3000" 2>&1)
    
    # Extract tunnel ID
    local tunnel_id=$(echo "$tunnel_output" | tail -1)
    
    # Wait for tunnel to establish (increased to 15s for reliability)
    sleep 15
    
    # Get tunnel URL using grep -oP for better pattern matching
    local tunnel_url=$(ssh_exec "podman logs openrag-public-tunnel 2>&1 | grep -oP 'https://[a-z0-9-]+\.trycloudflare\.com' | head -1")
    
    if [[ -n "$tunnel_url" ]]; then
        log_success "Cloudflare tunnel created"
        echo ""
        echo "=========================================="
        echo "Public URL: $tunnel_url"
        echo "=========================================="
        echo ""
    else
        log_warning "Could not extract tunnel URL"
    fi
    
    # Setup Langflow tunnel
    log_info "Setting up Langflow tunnel..."
    ssh_exec "podman run -d \
        --name openrag-langflow-tunnel \
        --network tui_default \
        docker.io/cloudflare/cloudflared:latest \
        tunnel --no-autoupdate --url http://langflow:7860" 2>/dev/null || {
        log_warning "Failed to create Langflow tunnel"
    }
}

# Save deployment information
save_deployment_info() {
    log_info "Saving deployment information..."
    
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local info_file="openrag_deployment_${VM_HOST}_${timestamp}.json"
    
    cat > "$info_file" << EOF
{
  "deployment_date": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "vm_host": "${VM_HOST}",
  "vm_port": "${VM_PORT}",
  "vm_user": "${VM_USER}",
  "openrag_version": "${OPENRAG_VERSION}",
  "python_version": "${PYTHON_VERSION}",
  "access_urls": {
    "frontend": "http://${VM_HOST}:3000",
    "langflow": "http://${VM_HOST}:7860",
    "opensearch": "http://${VM_HOST}:9200",
    "dashboards": "http://${VM_HOST}:5601",
    "ollama": "http://${VM_HOST}:11434"
  },
  "ssh_command": "ssh -i ${SSH_KEY} -p ${VM_PORT} ${VM_USER}@${VM_HOST}"
}
EOF
    
    log_success "Deployment info saved locally"
}

# Main deployment function
main() {
    echo "=========================================="
    echo "OpenRAG Automated VM Deployment"
    echo "=========================================="
    echo ""
    
    parse_args "$@"
    check_vm
    check_requirements
    cleanup_podman
    install_prerequisites
    initialize_openrag
    generate_configs
    setup_docker_compose
    pull_images
    start_services
    wait_for_services
    setup_ollama
    setup_docling_serve
    setup_cloudflare_tunnel
    save_deployment_info
    
    echo ""
    echo "=========================================="
    echo "OpenRAG Deployment Complete!"
    echo "=========================================="
    echo ""
    echo "Access URLs:"
    echo "  Public (Cloudflare): Check logs above"
    echo "  Frontend: http://${VM_HOST}:3000"
    echo "  Langflow: http://${VM_HOST}:7860"
    echo "  OpenSearch: http://${VM_HOST}:9200"
    echo "  Ollama: http://${VM_HOST}:11434"
    echo ""
    echo "SSH Access:"
    echo "  ssh -i ${SSH_KEY} -p ${VM_PORT} ${VM_USER}@${VM_HOST}"
    echo ""
    echo "Useful Commands:"
    echo "  Check status:"
    echo "    ssh -i ${SSH_KEY} -p ${VM_PORT} ${VM_USER}@${VM_HOST} 'podman ps'"
    echo ""
    echo "  View logs:"
    echo "    ssh -i ${SSH_KEY} -p ${VM_PORT} ${VM_USER}@${VM_HOST} 'podman logs <container>'"
    echo ""
    echo "  Stop services:"
    echo "    ssh -i ${SSH_KEY} -p ${VM_PORT} ${VM_USER}@${VM_HOST} 'cd ~/.openrag/tui && docker-compose down'"
    echo ""
    echo "  Start services:"
    echo "    ssh -i ${SSH_KEY} -p ${VM_PORT} ${VM_USER}@${VM_HOST} 'cd ~/.openrag/tui && docker-compose up -d'"
    echo ""
    echo "  Restart OpenRAG TUI:"
    echo "    ssh -i ${SSH_KEY} -p ${VM_PORT} ${VM_USER}@${VM_HOST} 'uvx --python 3.13 openrag --tui'"
    echo ""
    echo "=========================================="
    log_success "Deployment completed successfully!"
}

# Run main function
main "$@"