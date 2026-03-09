# Configure Rails to trust proxy headers for HTTPS
Rails.application.config.force_ssl = false

# Trust X-Forwarded-Proto header from proxy (Cloudflare Workers / Hono)
# This allows Rails to correctly determine the protocol (https) from X-Forwarded-Proto
Rails.application.config.action_dispatch.trusted_proxies = [:all]

# Disable origin check for reverse proxy
Rails.application.config.action_controller.forgery_protection_origin_check = false
