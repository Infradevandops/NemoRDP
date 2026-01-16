from enum import Enum
from typing import Dict, Optional
import os
from backend.providers.vultr import VultrProvider
from backend.providers.contabo import ContaboProvider

class OSType(Enum):
    WINDOWS = "windows"
    LINUX = "linux"

from backend.providers.os_catalog import get_os_by_id
from backend.providers.os_catalog import OS_CATALOG

class ProvisioningService:
    def __init__(self):
        self.vultr = VultrProvider()
        self.contabo = ContaboProvider()

    async def provision_rdp(self, order_id: str, os_type: OSType, plan: str, location: str, os_specific_id: str = None, ssh_key_ids: list = None) -> Dict:
        """
        Provision an RDP instance based on OS type.
        """
        try:
            # Resolve OS ID from Catalog if specific ID is provided
            provider_os_id = None
            if os_specific_id:
                # Find in catalog
                item = next((i for i in OS_CATALOG if i.id == os_specific_id), None)
                if item:
                    provider_os_id = item.provider_os_id

            if os_type == OSType.WINDOWS:
                final_os_id = provider_os_id if provider_os_id else 477
                return await self.vultr.create_windows_instance(order_id, location, plan, os_id=final_os_id)
            else:
                # Default to Ubuntu 22.04 if not specified
                final_image_id = provider_os_id if provider_os_id else "ubuntu-22.04"
                return await self.contabo.create_linux_instance(order_id, location, plan, image_id=final_image_id, ssh_keys=ssh_key_ids)
        except Exception as e:
            # Re-raise with clear message
            raise Exception(f"Provisioning failed: {str(e)}")

    async def terminate_rdp(self, provider: str, instance_id: str) -> bool:
        """Terminate RDP instance"""
        if provider == "vultr":
            return await self.vultr.delete_instance(instance_id)
        elif provider == "contabo":
            return await self.contabo.delete_instance(instance_id)
        else:
            raise ValueError(f"Unknown provider: {provider}")

    async def reboot_rdp(self, provider: str, instance_id: str) -> bool:
        """Reboot RDP instance"""
        if provider == "vultr":
            return await self.vultr.reboot_instance(instance_id)
        elif provider == "contabo":
            return await self.contabo.reboot_instance(instance_id)
        else:
            raise ValueError(f"Unknown provider: {provider}")

    async def get_console_url(self, provider: str, instance_id: str) -> str:
        """Get Web Console / VNC URL"""
        if provider == "vultr":
            return await self.vultr.get_instance_vnc_url(instance_id)
        elif provider == "contabo":
            return await self.contabo.get_instance_vnc_url(instance_id)
        else:
            raise ValueError(f"Unknown provider: {provider}")

    async def create_snapshot(self, provider: str, instance_id: str, name: str) -> dict:
        if provider == "vultr":
             return await self.vultr.create_snapshot(instance_id, name)
        elif provider == "contabo":
             return await self.contabo.create_snapshot(instance_id, name)
        return {}

    async def list_snapshots(self, provider: str, instance_id: str) -> list:
        if provider == "vultr":
             # Vultr listing might need filtering logic, for now return all
             return await self.vultr.list_snapshots(instance_id)
        elif provider == "contabo":
             return await self.contabo.list_snapshots(instance_id)
        return []

    async def restore_snapshot(self, provider: str, instance_id: str, snapshot_id: str) -> bool:
        if provider == "vultr":
             return await self.vultr.restore_snapshot(instance_id, snapshot_id)
        elif provider == "contabo":
             return await self.contabo.restore_snapshot(instance_id, snapshot_id)
        return False
