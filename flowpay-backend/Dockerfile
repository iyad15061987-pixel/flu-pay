# =========================
# BASE IMAGE
# =========================

FROM node:20-alpine

# =========================
# WORK DIRECTORY
# =========================

WORKDIR /app

# =========================
# COPY PACKAGE FILES
# =========================

COPY package*.json ./

# =========================
# INSTALL DEPENDENCIES
# =========================

RUN npm install --production

# =========================
# COPY SOURCE
# =========================

COPY . .

# =========================
# ENVIRONMENT
# =========================

ENV NODE_ENV=production

# =========================
# PORT
# =========================

EXPOSE 5000

# =========================
# START SERVER
# =========================

CMD ["node", "server.js"]