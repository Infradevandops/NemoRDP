import httpx
import asyncio
from typing import Dict, Optional
import os

class VultrProvider:
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv("VULTR_API_KEY")
        self.base_url = "https://api.vultr.com/v2"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

    async def create_windows_instance(self, order_id: str) -> Dict:
        """Create Windows Server 2022 RDP instance"""
        if not self.api_key:
             # Mock for development if no key
             print("VULTR_API_KEY not found. Returning mock instance.")
             await asyncio.sleep(2)
             return {
                "provider_id": f"mock-vultr-{order_id}",
                "ip_address": "192.168.1.100",
                "username": "Administrator",
                "password": "MockPassword123!",
                "status": "active"
            }

        payload = {
            "region": "ewr",  # New Jersey
            "plan": "vc2-2c-4gb",  # 2 vCPU, 4GB RAM
            "os_id": 477,  # Windows Server 2022 (Standard) - Check ID if changed
            "label": f"nemordp-{order_id}",
            "hostname": f"nemordp-{order_id}",
            "enable_ipv6": False,
            "backups": "disabled",
            "ddos_protection": False
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/instances",
                json=payload,
                headers=self.headers,
                timeout=30.0
            )
            
            if response.status_code == 202:
                instance = response.json()["instance"]
                return await self._wait_for_instance_ready(instance["id"])
            else:
                raise Exception(f"Vultr API error: {response.text}")

    async def _wait_for_instance_ready(self, instance_id: str) -> Dict:
        """Wait for instance to be ready and get credentials"""
        max_attempts = 30  # 5 minutes max
        attempt = 0
        
        while attempt < max_attempts:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/instances/{instance_id}",
                    headers=self.headers
                )
                
                if response.status_code == 200:
                    instance = response.json()["instance"]
                    
                    if (instance["server_status"] == "ok" and 
                        instance["main_ip"] and 
                        instance["main_ip"] != "0.0.0.0"):
                        
                        return {
                            "provider_id": instance_id,
                            "ip_address": instance["main_ip"],
                            "username": "Administrator",
                            "password": instance.get("default_password", ""),
                            "status": "active"
                        }
            
            await asyncio.sleep(10)  # Wait 10 seconds
            attempt += 1
        
        raise Exception("Timeout waiting for instance to be ready")

    async def delete_instance(self, instance_id: str) -> bool:
        """Delete instance"""
        if not self.api_key:
            return True

        async with httpx.AsyncClient() as client:
            response = await client.delete(
                f"{self.base_url}/instances/{instance_id}",
                headers=self.headers
            )
            return response.status_code == 204

    async def reboot_instance(self, instance_id: str) -> bool:
        """Reboot instance"""
        if not self.api_key:
            return True

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/instances/{instance_id}/reboot",
                headers=self.headers
            )
            return response.status_code == 204
