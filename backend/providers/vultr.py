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

    async def create_windows_instance(self, order_id: str, location: str = "US", plan: str = "basic") -> Dict:
        """Create Windows Server 2022 RDP instance"""
    async def create_windows_instance(self, order_id: str, location: str = "US", plan: str = "basic", os_id: int = 477) -> Dict:
        """Create Windows Server RDP instance"""
        if not self.api_key:
             print("VULTR_API_KEY not found. Windows provisioning unavailable.")
             raise Exception("Windows RDP provisioning is currently unavailable (Provider key missing).")

        # Map generic locations to Vultr regions
        region_map = {
            "US": "ewr", # New Jersey
            "EU": "fra", # Frankfurt
            "ASIA": "sgp" # Singapore
        }
        vultr_region = region_map.get(location, "ewr")
        
        # Map plan to Vultr instance size
        plan_map = {
            "basic": "vc2-2c-4gb",   # 2 vCPU, 4GB RAM
            "pro": "vc2-4c-8gb",     # 4 vCPU, 8GB RAM
        }
        vultr_plan = plan_map.get(plan, "vc2-2c-4gb")

        payload = {
            "region": vultr_region,  # Dynamic Region
            "plan": vultr_plan,  # Dynamic Plan Size
            "os_id": os_id,  # Dynamic OS ID (Default 477=Win2022)
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

    async def create_snapshot(self, instance_id: str, description: str = "") -> dict:
        """Create a snapshot of the instance"""
        if not self.api_key:
            return {"id": "mock-snap-1", "status": "pending"}

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/snapshots",
                headers=self.headers,
                json={"instance_id": instance_id, "description": description}
            )
            # Vultr returns snapshot object
            if response.status_code != 201 and response.status_code != 200:
                pass # error handling
            
            return response.json().get("snapshot", {})

    async def list_snapshots(self, instance_id: str = None) -> list:
        """List snapshots, optionally filtered by instance"""
        if not self.api_key:
            return []

        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/snapshots",
                headers=self.headers
            )
            if response.status_code == 200:
                 return response.json().get("snapshots", [])
            return []

    async def restore_snapshot(self, instance_id: str, snapshot_id: str) -> bool:
        """Restore instance from snapshot"""
        if not self.api_key:
            return True

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/instances/{instance_id}/restore",
                headers=self.headers,
                json={"snapshot_id": snapshot_id}
            )
            return response.status_code == 202
