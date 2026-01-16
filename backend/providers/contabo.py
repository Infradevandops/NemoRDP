import httpx
import base64
import asyncio
from typing import Dict, List
import os

class ContaboProvider:
    def __init__(self, client_id: str = None, client_secret: str = None):
        self.client_id = client_id or os.getenv("CONTABO_CLIENT_ID")
        self.client_secret = client_secret or os.getenv("CONTABO_CLIENT_SECRET")
        self.base_url = "https://api.contabo.com/v1"
        self.token = None

    async def get_access_token(self) -> str:
        """Get OAuth2 access token"""
        auth_string = f"{self.client_id}:{self.client_secret}"
        auth_bytes = auth_string.encode('ascii')
        auth_b64 = base64.b64encode(auth_bytes).decode('ascii')
        
        headers = {
            "Authorization": f"Basic {auth_b64}",
            "Content-Type": "application/x-www-form-urlencoded"
        }
        
        data = {"grant_type": "client_credentials"}
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/auth/oauth/token",
                data=data,
                headers=headers
            )
            
            if response.status_code == 200:
                self.token = response.json()["access_token"]
                return self.token
            else:
                raise Exception("Failed to get Contabo access token")

    async def create_linux_instance(self, order_id: str, location: str = "EU", plan: str = "basic", image_id: str = "ubuntu-22.04", ssh_keys: List[int] = None) -> Dict:
        """Create Linux Instance (Contabo)"""
        if not self.client_id:
             return {"id": "mock-contabo-id", "ip": "10.0.0.1"}
             
        if not self.token:
             await self.get_access_token()
        
        region_map = {
            "US": "US", 
            "EU": "EU", 
            "ASIA": "SIN"
        }
        contabo_region = region_map.get(location, "EU")
        
        # Determine Product ID based on Plan
        # This is a simplification; in production mapped to real Contabo Product IDs
        product_id = "VPS-S-SSD" if plan == "basic" else "VPS-M-SSD"

        headers = {
            "Authorization": f"Bearer {self.token}",
            "x-trace-id": order_id
        }
        
        payload = {
            "imageId": image_id,
            "productId": product_id,
            "region": contabo_region,
            "period": 1,
            "displayName": f"nemordp-{order_id}",
            "sshKeys": ssh_keys if ssh_keys else [], # Contabo requires list of IDs
            "userData": self._get_ubuntu_desktop_script()
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/compute/instances",
                json=payload,
                headers=headers,
                timeout=60.0
            )
            
            if response.status_code == 201:
                instance = response.json()["data"][0]
                return await self._wait_for_linux_ready(instance["instanceId"])
            else:
                raise Exception(f"Contabo API error: {response.text}")

    async def _wait_for_linux_ready(self, instance_id: str) -> Dict:
        # Simplification: In a real scenario, we'd poll similar to Vultr
        # For Contabo, provisioning might take longer, so typically we just return status "provisioning"
        # But for this abstracted methods, let's assume we wait or return partial data
        await asyncio.sleep(10) 
        return {
             "provider_id": str(instance_id),
             "ip_address": "Pending", # Contabo might take time to assign IP
             "username": "ubuntu",
             "password": "CheckEmailOrReset", # Contabo often sends via email or requires reset
             "status": "provisioning"
        }

    def _get_ubuntu_desktop_script(self) -> str:
        """Cloud-init script for Ubuntu Desktop with RDP"""
        return """#cloud-config
packages:
  - ubuntu-desktop-minimal
  - xrdp
  - firefox
  - code

runcmd:
  - systemctl enable xrdp
  - systemctl start xrdp
  - ufw allow 3389
  - echo 'ubuntu:NemoRDP2024!' | chpasswd
  - adduser ubuntu sudo
  - sed -i 's/^#*WaylandEnable=false/WaylandEnable=false/' /etc/gdm3/custom.conf
  - ufw allow 3389
  - echo 'ubuntu:NemoRDP2024!' | chpasswd
  - adduser ubuntu sudo
  - sed -i 's/^#*WaylandEnable=false/WaylandEnable=false/' /etc/gdm3/custom.conf
  - systemctl restart gdm3
  - reboot
"""

    async def reboot_instance(self, instance_id: str) -> bool:
        """Reboot instance"""
        if not self.client_id:
            return True
        
        # Note: Contabo API needs Token here, so ensure token is refreshed if expired
        if not self.token:
             await self.get_access_token()
             
        headers = {
            "Authorization": f"Bearer {self.token}",
             "x-trace-id": "reboot-trace"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/compute/instances/{instance_id}/actions/restart",
                headers=headers
            )
            return response.status_code == 201

    async def delete_instance(self, instance_id: str) -> bool:
        """Delete instance"""
        if not self.client_id:
            return True
            
        if not self.token:
             await self.get_access_token()

        headers = {
            "Authorization": f"Bearer {self.token}",
             "x-trace-id": "delete-trace"
        }
        
        async with httpx.AsyncClient() as client:
             response = await client.delete(
                 f"{self.base_url}/compute/instances/{instance_id}",
                 headers=headers
             )
             return response.status_code == 204

    async def get_instance_vnc_url(self, instance_id: str) -> str:
        """Get VNC URL for instance"""
        if not self.client_id:
             return "http://mock-vnc-url.com"
             
        if not self.token:
             await self.get_access_token()

        headers = {
            "Authorization": f"Bearer {self.token}",
             "x-trace-id": "vnc-trace"
        }
        
        # Contabo VNC API is a bit different, often requires specific permissions
        # GET /compute/instances/{instanceId}/vnc
        async with httpx.AsyncClient() as client:
             response = await client.get(
                 f"{self.base_url}/compute/instances/{instance_id}/vnc",
                 headers=headers
             )
             if response.status_code == 200:
                 # Contabo returns a clearer object usually
                 return response.json()["data"][0]["url"] 
             raise Exception(f"Failed to get VNC URL: {response.text}")

    async def create_snapshot(self, instance_id: str, name: str = "") -> dict:
        """Create snapshot (Contabo)"""
        if not self.client_id:
            return {"id": "mock-snap-c1", "status": "active"}
            
        if not self.token: await self.get_access_token()
        
        headers = {"Authorization": f"Bearer {self.token}"}
        async with httpx.AsyncClient() as client:
            # POST /compute/instances/{instanceId}/snapshots
            response = await client.post(
                f"{self.base_url}/compute/instances/{instance_id}/snapshots",
                headers=headers,
                json={"name": name, "description": "Created via NemoRDP"}
            )
            response.raise_for_status()
            # Contabo returns data wrapper
            return response.json().get("data", [{}])[0]

    async def list_snapshots(self, instance_id: str) -> list:
        """List snapshots for instance"""
        if not self.client_id: return []
        if not self.token: await self.get_access_token()
        
        headers = {"Authorization": f"Bearer {self.token}"}
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/compute/instances/{instance_id}/snapshots",
                headers=headers
            )
            if response.status_code == 200:
                return response.json().get("data", [])
            return []

    async def restore_snapshot(self, instance_id: str, snapshot_id: str) -> bool:
        """Rollback snapshot"""
        if not self.client_id: return True
        if not self.token: await self.get_access_token()
        
        headers = {"Authorization": f"Bearer {self.token}"}
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/compute/instances/{instance_id}/snapshots/{snapshot_id}/rollback",
                headers=headers
            )
            return response.status_code == 202 or response.status_code == 200
