from enum import Enum
from typing import Dict, Optional
import os
from backend.providers.vultr import VultrProvider
from backend.providers.contabo import ContaboProvider

class OSType(Enum):
    WINDOWS = "windows"
    LINUX = "linux"

class ProvisioningService:
    def __init__(self):
        self.vultr = VultrProvider()
        self.contabo = ContaboProvider()

    async def provision_rdp(self, order_id: str, os_type: OSType, plan: str) -> Dict:
        """Route provisioning to appropriate provider"""
        try:
            if os_type == OSType.WINDOWS:
                return await self.vultr.create_windows_instance(order_id)
            else:
                return await self.contabo.create_linux_instance(order_id)
        except Exception as e:
            # Log error and potentially retry with different provider
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
