import httpx
import base64
import asyncio
from typing import Dict
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

    async def create_linux_instance(self, order_id: str) -> Dict:
        """Create Ubuntu Desktop RDP instance"""
        if not self.client_id or not self.client_secret:
             # Mock for development
             print("CONTABO_CLIENT credentials not found. Returning mock instance.")
             await asyncio.sleep(2)
             return {
                "provider_id": f"mock-contabo-{order_id}",
                "ip_address": "10.0.0.5",
                "username": "ubuntu",
                "password": "MockPassword123!",
                "status": "active"
            }

        if not self.token:
            await self.get_access_token()
            
        headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "imageId": "ubuntu-22.04",
            "productId": "VPS-1-SSD-20",  # 1 vCPU, 4GB RAM - check productId validity
            "region": "EU",
            "period": 1,
            "displayName": f"nemordp-{order_id}",
            "defaultUser": "ubuntu",
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
