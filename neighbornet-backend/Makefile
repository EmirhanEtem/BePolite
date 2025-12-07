.PHONY: help install dev test lint build docker push clean deploy-k8s deploy-helm

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

# Variables
DOCKER_REGISTRY ?= ghcr.io
IMAGE_NAME ?= yourorg/neighbornet-backend
VERSION ?= $(shell git describe --tags --always --dirty)
NODE_ENV ?= development

help: ## Show this help message
	@echo '$(BLUE)NeighborNet Backend$(NC)'
	@echo ''
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(GREEN)%-30s$(NC) %s\n", $$1, $$2}'

.env: ## Create .env file from template
	@if [ ! -f .env ]; then cp .env.example .env; echo "$(YELLOW).env file created. Please edit with your settings.$(NC)"; fi

install: ## Install dependencies
	@echo "$(BLUE)Installing dependencies...$(NC)"
	npm install

dev: .env ## Start development server
	@echo "$(BLUE)Starting development server...$(NC)"
	npm run dev

test: ## Run tests
	@echo "$(BLUE)Running tests...$(NC)"
	npm run test

test-watch: ## Run tests in watch mode
	@echo "$(BLUE)Running tests in watch mode...$(NC)"
	npm run test:watch

test-cov: ## Run tests with coverage
	@echo "$(BLUE)Running tests with coverage...$(NC)"
	npm run test:coverage

lint: ## Run linter
	@echo "$(BLUE)Running linter...$(NC)"
	npm run lint

lint-fix: ## Fix linting issues
	@echo "$(BLUE)Fixing linting issues...$(NC)"
	npm run lint:fix

format: ## Format code with Prettier
	@echo "$(BLUE)Formatting code...$(NC)"
	npm run format

format-check: ## Check code formatting
	@echo "$(BLUE)Checking code formatting...$(NC)"
	npm run format:check

build: ## Build TypeScript
	@echo "$(BLUE)Building TypeScript...$(NC)"
	npm run build

clean: ## Clean build artifacts
	@echo "$(BLUE)Cleaning build artifacts...$(NC)"
	rm -rf dist node_modules package-lock.json
	npm install

docker-build: ## Build Docker image
	@echo "$(BLUE)Building Docker image...$(NC)"
	docker build -t $(DOCKER_REGISTRY)/$(IMAGE_NAME):$(VERSION) -t $(DOCKER_REGISTRY)/$(IMAGE_NAME):latest .

docker-build-dev: ## Build development Docker image
	@echo "$(BLUE)Building development Docker image...$(NC)"
	docker build -f Dockerfile.dev -t $(DOCKER_REGISTRY)/$(IMAGE_NAME):dev .

docker-push: ## Push Docker image to registry
	@echo "$(BLUE)Pushing Docker image...$(NC)"
	docker push $(DOCKER_REGISTRY)/$(IMAGE_NAME):$(VERSION)
	docker push $(DOCKER_REGISTRY)/$(IMAGE_NAME):latest

docker-run: ## Run Docker container locally
	@echo "$(BLUE)Running Docker container...$(NC)"
	docker run -p 3000:3000 --env-file .env $(DOCKER_REGISTRY)/$(IMAGE_NAME):latest

docker-shell: ## Open shell in running container
	@echo "$(BLUE)Opening shell in container...$(NC)"
	docker exec -it $$(docker ps -q -f ancestor=$(DOCKER_REGISTRY)/$(IMAGE_NAME):latest) /bin/sh

docker-clean: ## Remove Docker images
	@echo "$(YELLOW)Removing Docker images...$(NC)"
	docker rmi $(DOCKER_REGISTRY)/$(IMAGE_NAME):$(VERSION) $(DOCKER_REGISTRY)/$(IMAGE_NAME):latest $(DOCKER_REGISTRY)/$(IMAGE_NAME):dev || true

compose-up: ## Start Docker Compose services
	@echo "$(BLUE)Starting Docker Compose services...$(NC)"
	docker-compose up -d

compose-down: ## Stop Docker Compose services
	@echo "$(BLUE)Stopping Docker Compose services...$(NC)"
	docker-compose down

compose-logs: ## View Docker Compose logs
	docker-compose logs -f

compose-shell: ## Open shell in app container
	docker-compose exec neighbornet-backend /bin/sh

db-migrate: ## Run database migrations
	@echo "$(BLUE)Running database migrations...$(NC)"
	npx prisma migrate deploy

db-seed: ## Seed database
	@echo "$(BLUE)Seeding database...$(NC)"
	npx prisma db seed

db-studio: ## Open Prisma Studio
	@echo "$(BLUE)Opening Prisma Studio...$(NC)"
	npx prisma studio

db-reset: ## Reset database (warning: deletes all data)
	@echo "$(RED)WARNING: This will delete all database data$(NC)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		npx prisma migrate reset; \
	fi

db-backup: ## Backup database
	@echo "$(BLUE)Backing up database...$(NC)"
	bash scripts/backup-db.sh

k8s-deploy: ## Deploy to Kubernetes
	@echo "$(BLUE)Deploying to Kubernetes...$(NC)"
	kubectl apply -f k8s/deployment.yaml
	kubectl apply -f k8s/postgres-redis.yaml
	kubectl apply -f k8s/ingress.yaml

k8s-undeploy: ## Remove from Kubernetes
	@echo "$(YELLOW)Removing from Kubernetes...$(NC)"
	kubectl delete -f k8s/deployment.yaml
	kubectl delete -f k8s/postgres-redis.yaml
	kubectl delete -f k8s/ingress.yaml

k8s-logs: ## View Kubernetes logs
	kubectl logs -f deployment/neighbornet-backend -n neighbornet

k8s-shell: ## Open shell in Kubernetes pod
	@POD=$$(kubectl get pods -n neighbornet -l app=neighbornet-backend -o jsonpath='{.items[0].metadata.name}'); \
	kubectl exec -it $$POD -n neighbornet -- /bin/sh

k8s-status: ## Show Kubernetes deployment status
	kubectl get all -n neighbornet

helm-install: ## Install Helm chart
	@echo "$(BLUE)Installing Helm chart...$(NC)"
	helm install neighbornet ./helm/neighbornet-backend -n neighbornet --create-namespace

helm-upgrade: ## Upgrade Helm chart
	@echo "$(BLUE)Upgrading Helm chart...$(NC)"
	helm upgrade neighbornet ./helm/neighbornet-backend -n neighbornet

helm-uninstall: ## Uninstall Helm chart
	@echo "$(YELLOW)Uninstalling Helm chart...$(NC)"
	helm uninstall neighbornet -n neighbornet

helm-values: ## Show Helm values
	helm values neighbornet -n neighbornet

setup-dev: install db-migrate compose-up ## Complete development setup
	@echo "$(GREEN)Development setup complete!$(NC)"
	@echo "Access API at http://localhost:3000"
	@echo "Database Studio at http://localhost:5555"

setup-prod: build docker-build docker-push k8s-deploy ## Complete production setup
	@echo "$(GREEN)Production deployment initiated!$(NC)"

ci: lint test ## Run CI checks
	@echo "$(GREEN)CI checks passed!$(NC)"

pr: format lint test build ## Prepare for pull request
	@echo "$(GREEN)Ready for pull request!$(NC)"

version: ## Show version
	@echo "$(BLUE)Version: $(VERSION)$(NC)"

.DEFAULT_GOAL := help
