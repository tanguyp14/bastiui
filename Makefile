# Nom de la boutique Shopify
STORE=bastiui.myshopify.com

# Commandes
GULP=gulp
SHOPIFY=shopify theme dev --store ${STORE}

# Commande pour lancer Gulp
css:
	${GULP}
	
# Commande pour lancer Shopify CLI
start:
	${SHOPIFY}

up:
	${GULP} & ${SHOPIFY}

# Commande pour arrêter les processus via leurs noms
stop:
	@pkill -f "${GULP}" || echo "Aucun processus Gulp trouvé."
	@pkill -f "${SHOPIFY}" || echo "Aucun processus Shopify CLI trouvé."
	@echo "Processus arrêtés."
