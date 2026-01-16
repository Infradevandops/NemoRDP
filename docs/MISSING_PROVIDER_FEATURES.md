# Missing Provider API Features & Dashboard Pages

This document outlines the features available in underlying providers (Vultr/Contabo) that are currently missing from the NemoRDP dashboard and API. Implementing these will bring the platform to full feature parity with standard cloud panels.

## 1. Advanced Server Configuration (Pre-Deployment)

These features allow power users to customize their instance during the deployment phase.

## Feature Status Checklist

- [x] **Granular OS Selection**
    - [x] Backend Catalog
    - [x] Provider Integration (Vultr/Contabo)
    - [x] Frontend Selection UI

- [x] **SSH Key Management**
    * [x] Database Model
    * [x] CRUD API
    * [x] Frontend Settings
    * [x] Deployment Integration

- [x] **Web Console (VNC)**
    - [x] Provider API Integration
    - [x] Backend Proxy/URL Fetcher
    - [x] Frontend Console Tab (NoVNC)

- [x] **Snapshots & Backups**
    - [x] Create Snapshot API
    - [x] Restore Snapshot API
    - [x] List Snapshots API
    - [x] Frontend Interface (Basic)

- [ ] **Firewall Groups** (Pending)
- [ ] **Startup Scripts** (Pending - Partial CloudInit used)
- [ ] **Reverse DNS** (Pending)

### 🔑 SSH Key Management (Linux Only)
*   **Current State**: Passwords are auto-generated and emailed.
*   **Missing Feature**: Ability to select or upload a public SSH key for passwordless root login.
*   **Dashboard Page**: `Settings -> SSH Keys` (CRUD for public keys), `Deploy` (Select Key dropdown).
*   **Provider API**:
    *   **Vultr**: `POST /ssh-keys`, `sshkey_id` param in `POST /instances`.
    *   **Contabo**: `sshKeys` array in `POST /instances`.

### 💿 Granular OS Selection
*   **Current State**: Binary choice between generic "Windows" and "Linux".
*   **Missing Feature**: Dropdown to select specific versions (e.g., Windows 2022 vs 2019, Ubuntu 22.04 LTS vs 24.04).
*   **Dashboard Page**: `Deploy` (OS Version Dropdown).
*   **Provider API**:
    *   **Vultr**: `GET /os` to fetch list of `os_id`s.
    *   **Contabo**: `GET /images` to fetch `imageId`s.

### 📜 Startup Scripts (Cloud-Init / User Data)
*   **Current State**: None. Instances boot with default provider config.
*   **Missing Feature**: Text area to paste Bash/PowerShell scripts to run on first boot (e.g., install Chrome, setup firewall).
*   **Dashboard Page**: `Deploy -> Advanced Settings`.
*   **Provider API**:
    *   **Vultr**: `user_data` (Base64 encoded) param in `POST /instances`.
    *   **Contabo**: `userData` param.

---

## 2. Instance Management (Post-Deployment)

These user actions are critical for day-to-day management and troubleshooting of active instances.

### 🖥️ Web Console / VNC Access (CRITICAL)
*   **Why**: If RDP or SSH fails (firewall lockout, bad config), the user is completely locked out.
*   **Missing Feature**: A web-based VNC viewer embedded in the dashboard.
*   **Dashboard Page**: `Instances -> [ID] -> Console`.
*   **Provider API**:
    *   **Vultr**: `GET /instances/{instance-id}/vnc` (Returns URL).
    *   **Contabo**: `GET /instances/{instanceId}/vnc` (Returns URL/Credentials).

### 🛡️ Firewall Groups / Security Groups
*   **Why**: Network-level security to block ports before traffic hits the OS.
*   **Missing Feature**: UI to add allow/deny rules for TCP/UDP ports.
*   **Dashboard Page**: `Instances -> [ID] -> Firewall` or global `Network -> Firewalls`.
*   **Provider API**:
    *   **Vultr**: `firewall_group_id` param and separate `/firewalls` endpoints.
    *   **Contabo**: Limited API support (often OS-level only), but Vultr has robust API support here.

### 📸 Snapshots & Backups (Revenue Opportunity)
*   **Why**: Data safety. Users will pay extra for this.
*   **Missing Feature**: "Take Snapshot", "Restore Snapshot", "Enable Auto-Backups".
*   **Dashboard Page**: `Instances -> [ID] -> Backups`.
*   **Provider API**:
    *   **Vultr**: `POST /instances/{instance-id}/snapshots`, `POST /snapshots/{snapshot-id}/restore`.
    *   **Contabo**: `POST /instances/{instanceId}/snapshots`.

### 🌐 Reverse DNS (PTR Records)
*   **Why**: Essential for running mail servers to prevent emails going to spam.
*   **Missing Feature**: Field to set a hostname (e.g., `mail.mydomain.com`) for the instance IP.
*   **Dashboard Page**: `Instances -> [ID] -> Network`.
*   **Provider API**:
    *   **Vultr**: `POST /instances/{instance-id}/ipv4/reverse`.

### 📊 Usage Graphs (Metrics)
*   **Why**: Transparency. Users want to see CPU spikes or bandwidth usage.
*   **Missing Feature**: Bandwidth, CPU, and Disk I/O charts.
*   **Dashboard Page**: `Instances -> [ID] -> Metrics`.
*   **Provider API**:
    *   **Vultr**: `GET /instances/{instance-id}/bandwidth`.

---

## 📋 Integration Roadmap Summary

| Priority | Feature | Complexity | Revenue Potential |
| :--- | :--- | :--- | :--- |
| **High** | **Web Console (VNC)** | Medium | Low (Retains users) |
| **High** | **Detailed OS Selection** | Low | Medium (Niche OSs) |
| **Medium** | **Snapshots/Backups** | High | **High (Upsell)** |
| **Medium** | **SSH Keys** | Medium | Low (UX only) |
| **Low** | **Firewall Groups** | High | Low |
| **Low** | **Startup Scripts** | Low | Low |
