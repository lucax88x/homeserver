# Proxmox Home Server Setup
# Run on your Proxmox VE host
#
# Usage:
#   just install        # Install all services
#   just install-haos   # Install only Home Assistant OS
#   just list           # Show what's installed

set dotenv-load
set positional-arguments

scripts_dir := justfile_directory() / "scripts"

# Show available recipes
default:
    @just --list

# Install all configured services
install: install-haos install-nginx-proxy-manager install-jellyfin install-adguard install-portainer install-glance
    @echo ""
    @echo "All services installed!"
    @echo ""
    @just list

# List installed containers and VMs
list:
    @echo "=== VMs ==="
    @qm list 2>/dev/null || echo "No VMs"
    @echo ""
    @echo "=== Containers ==="
    @pct list 2>/dev/null || echo "No containers"

# Check if running on Proxmox VE
check:
    @command -v pveversion >/dev/null 2>&1 || { echo "ERROR: Must run on Proxmox VE"; exit 1; }
    @echo "Proxmox VE $(pveversion --version)"

# Typecheck all scripts
typecheck:
    pnpm typecheck

# -----------------------------------------------------------------------------
# Services
# -----------------------------------------------------------------------------

# Home Assistant OS VM
[group('services')]
install-haos:
    pnpm exec zx {{ scripts_dir }}/install-haos.mts

# Nginx Proxy Manager (admin@example.com / changeme)
[group('services')]
install-nginx-proxy-manager:
    pnpm exec zx {{ scripts_dir }}/install-nginx-proxy-manager.mts

# Jellyfin Media Server (http://<ip>:8096)
[group('services')]
install-jellyfin:
    pnpm exec zx {{ scripts_dir }}/install-jellyfin.mts

# AdGuard Home DNS (http://<ip>:3000 for setup)
[group('services')]
install-adguard:
    pnpm exec zx {{ scripts_dir }}/install-adguard.mts

# Portainer Docker UI (https://<ip>:9443)
[group('services')]
install-portainer:
    pnpm exec zx {{ scripts_dir }}/install-portainer.mts

# Glance Dashboard (http://<ip>:8080)
[group('services')]
install-glance:
    pnpm exec zx {{ scripts_dir }}/install-glance.mts

# -----------------------------------------------------------------------------
# Configuration Sync
# -----------------------------------------------------------------------------

# Sync Glance dashboard config to container
[group('config')]
sync-glance:
    pnpm exec zx {{ scripts_dir }}/sync-glance.mts

# Sync proxy hosts to Nginx Proxy Manager
[group('config')]
sync-npm:
    pnpm exec zx {{ scripts_dir }}/sync-npm.mts

# Sync all configurations
[group('config')]
sync: sync-glance sync-npm

# -----------------------------------------------------------------------------
# Utilities
# -----------------------------------------------------------------------------

# Remove a container by hostname
[confirm("Are you sure you want to remove this container?")]
remove-ct hostname:
    #!/usr/bin/env bash
    set -euo pipefail
    CTID=$(pct list | grep -w "{{ hostname }}" | awk '{print $1}')
    if [ -z "$CTID" ]; then
        echo "Container '{{ hostname }}' not found"
        exit 1
    fi
    pct stop "$CTID" 2>/dev/null || true
    pct destroy "$CTID"
    echo "Removed container {{ hostname }} (ID: $CTID)"
