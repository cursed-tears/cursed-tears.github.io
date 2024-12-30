class AdminPanel {
    constructor() {
        this.init();
    }

    async init() {
        this.bindEvents();
        await this.loadBlockedIPs();
        await this.loadSystemStatus();
    }

    bindEvents() {
        document.getElementById('blockIP').addEventListener('click', () => this.blockIP());
        document.getElementById('clearMessages').addEventListener('click', () => this.clearMessages());
        document.getElementById('toggleMaintenance').addEventListener('click', () => this.toggleMaintenance());
    }

    async blockIP() {
        const ip = document.getElementById('ipInput').value;
        const response = await fetch('/api/admin/block', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ip })
        });
        if (response.ok) this.loadBlockedIPs();
    }

    async clearMessages() {
        if (confirm('Are you sure you want to clear all messages?')) {
            await fetch('/api/admin/clear-messages', { method: 'POST' });
        }
    }

    async toggleMaintenance() {
        const response = await fetch('/api/admin/maintenance', { method: 'POST' });
        if (response.ok) this.loadSystemStatus();
    }

    async loadBlockedIPs() {
        const response = await fetch('/api/admin/blocked-ips');
        const ips = await response.json();
        this.updateIPList(ips);
    }

    async loadSystemStatus() {
        const response = await fetch('/api/admin/status');
        const status = await response.json();
        this.updateStatus(status);
    }

    updateIPList(ips) {
        const list = document.getElementById('blockedIPs');
        list.innerHTML = ips.map(ip => `<li>${ip} <button onclick="admin.unblockIP('${ip}')">Unblock</button></li>`).join('');
    }

    updateStatus(status) {
        document.getElementById('maintenanceStatus').textContent = 
            status.maintenance ? 'Maintenance Mode: ON' : 'Maintenance Mode: OFF';
    }
}

const admin = new AdminPanel();
