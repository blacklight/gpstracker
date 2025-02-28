backend:
	npm install && \
		npm run build

frontend:
	cd frontend && \
		npm install && \
		npm run build

all: backend frontend
