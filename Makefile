.PHONY: all backend frontend
all: backend frontend

backend:
	npm install && \
		npm run build

frontend:
	cd frontend && make
